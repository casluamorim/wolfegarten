import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AppRole = "admin" | "manager" | "salesperson";

async function assertAdminOrManager(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r) => r.role as string);
  const isAdmin = roles.includes("admin");
  const isManager = roles.includes("manager");
  if (!isAdmin && !isManager) throw new Error("Acesso negado");
  return { isAdmin, isManager };
}

export const listAppUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminOrManager(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: usersData, error: usersErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (usersErr) throw new Error(usersErr.message);
    const { data: roles, error: rolesErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role");
    if (rolesErr) throw new Error(rolesErr.message);

    const byUser = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = byUser.get(r.user_id as string) ?? [];
      arr.push(r.role as string);
      byUser.set(r.user_id as string, arr);
    }

    return usersData.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      roles: byUser.get(u.id) ?? [],
    }));
  });

export const createAppUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { email: string; password: string; role: AppRole; full_name?: string }) => {
      if (!d.email || !/.+@.+\..+/.test(d.email)) throw new Error("E-mail inválido");
      if (!d.password || d.password.length < 6)
        throw new Error("Senha precisa ter no mínimo 6 caracteres");
      if (!["admin", "manager", "salesperson"].includes(d.role))
        throw new Error("Função inválida");
      return d;
    },
  )
  .handler(async ({ context, data }) => {
    const { isAdmin } = await assertAdminOrManager(context.userId);
    if ((data.role === "admin" || data.role === "manager") && !isAdmin) {
      throw new Error("Apenas administradores podem criar admins ou gerentes");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: data.full_name ? { full_name: data.full_name } : undefined,
    });
    if (error) throw new Error(error.message);
    const userId = created.user!.id;
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: data.role });
    if (rErr) throw new Error(rErr.message);
    return { id: userId };
  });

export const setAppUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; role: AppRole }) => {
    if (!d.user_id) throw new Error("ID obrigatório");
    if (!["admin", "manager", "salesperson"].includes(d.role)) throw new Error("Função inválida");
    return d;
  })
  .handler(async ({ context, data }) => {
    const { isAdmin } = await assertAdminOrManager(context.userId);
    if ((data.role === "admin" || data.role === "manager") && !isAdmin) {
      throw new Error("Apenas administradores podem atribuir admin/gerente");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.user_id, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAppUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string }) => {
    if (!d.user_id) throw new Error("ID obrigatório");
    return d;
  })
  .handler(async ({ context, data }) => {
    const { isAdmin } = await assertAdminOrManager(context.userId);
    if (data.user_id === context.userId) throw new Error("Você não pode excluir a si mesmo");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user_id);
    const isTargetAdmin = (roles ?? []).some((r) => r.role === "admin");
    const isTargetManager = (roles ?? []).some((r) => r.role === "manager");
    if ((isTargetAdmin || isTargetManager) && !isAdmin) {
      throw new Error("Apenas administradores podem excluir admins ou gerentes");
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminOrManager(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 86400_000).toISOString();
    const d30 = new Date(now.getTime() - 30 * 86400_000).toISOString();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const [totalRes, last7Res, last30Res, todayRes, recentRes, byCityRes, byOriginRes, mediaRes] =
      await Promise.all([
        supabaseAdmin.from("leads").select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("leads")
          .select("id", { count: "exact", head: true })
          .gte("created_at", d7),
        supabaseAdmin
          .from("leads")
          .select("id", { count: "exact", head: true })
          .gte("created_at", d30),
        supabaseAdmin
          .from("leads")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfDay.toISOString()),
        supabaseAdmin
          .from("leads")
          .select("id, nome, telefone, email, cidade, como_conheceu, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
        supabaseAdmin.from("leads").select("cidade").not("cidade", "is", null),
        supabaseAdmin.from("leads").select("como_conheceu").not("como_conheceu", "is", null),
        supabaseAdmin.from("media_library").select("id", { count: "exact", head: true }),
      ]);

    const tally = (rows: { [k: string]: unknown }[] | null, key: string) => {
      const m = new Map<string, number>();
      for (const r of rows ?? []) {
        const v = String(r[key] ?? "").trim();
        if (!v) continue;
        m.set(v, (m.get(v) ?? 0) + 1);
      }
      return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    };

    return {
      totals: {
        leads: totalRes.count ?? 0,
        last7: last7Res.count ?? 0,
        last30: last30Res.count ?? 0,
        today: todayRes.count ?? 0,
        media: mediaRes.count ?? 0,
      },
      recent: recentRes.data ?? [],
      topCities: tally(byCityRes.data, "cidade"),
      topOrigins: tally(byOriginRes.data, "como_conheceu"),
    };
  });
