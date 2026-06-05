import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  createAppUser,
  deleteAppUser,
  listAppUsers,
  setAppUserRole,
  type AppRole,
} from "@/lib/admin-users.functions";

const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrador",
  manager: "Gerente",
  salesperson: "Vendedor",
};

export function UsersPanel({ currentUserId, isAdmin }: { currentUserId: string; isAdmin: boolean }) {
  const qc = useQueryClient();
  const list = useServerFn(listAppUsers);
  const create = useServerFn(createAppUser);
  const setRole = useServerFn(setAppUserRole);
  const del = useServerFn(deleteAppUser);

  const usersQ = useQuery({
    queryKey: ["app-users"],
    queryFn: () => list(),
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRoleVal] = useState<AppRole>("salesperson");
  const [err, setErr] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: async () => {
      setErr(null);
      await create({ data: { email, password, role, full_name: name || undefined } });
    },
    onSuccess: () => {
      setEmail("");
      setPassword("");
      setName("");
      setRoleVal("salesperson");
      qc.invalidateQueries({ queryKey: ["app-users"] });
    },
    onError: (e: Error) => setErr(e.message),
  });

  const roleMut = useMutation({
    mutationFn: ({ user_id, role }: { user_id: string; role: AppRole }) =>
      setRole({ data: { user_id, role } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["app-users"] }),
    onError: (e: Error) => alert(e.message),
  });

  const delMut = useMutation({
    mutationFn: (user_id: string) => del({ data: { user_id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["app-users"] }),
    onError: (e: Error) => alert(e.message),
  });

  const availableRoles: AppRole[] = isAdmin
    ? ["admin", "manager", "salesperson"]
    : ["salesperson"];

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-offwhite">Usuários & Acessos</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {isAdmin
            ? "Administradores têm acesso total. Gerentes podem criar vendedores. Vendedores acessam leads e mídia."
            : "Como gerente, você pode criar e remover vendedores."}
        </p>
      </div>

      <div className="rounded border border-border bg-card p-5">
        <h3 className="text-sm text-offwhite">Criar novo acesso</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            placeholder="Nome (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
          />
          <input
            type="text"
            placeholder="Senha (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
          />
          <select
            value={role}
            onChange={(e) => setRoleVal(e.target.value as AppRole)}
            className="rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
          >
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        {err && <p className="mt-3 text-xs text-destructive">{err}</p>}
        <button
          onClick={() => createMut.mutate()}
          disabled={createMut.isPending || !email || !password}
          className="btn-luxe mt-4 disabled:opacity-50"
        >
          {createMut.isPending ? "Criando..." : "Criar acesso"}
        </button>
      </div>

      <div className="mt-8 overflow-x-auto rounded border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card text-[10px] tracking-luxe text-muted-foreground">
            <tr>
              {["E-MAIL", "FUNÇÃO", "ÚLTIMO ACESSO", "CRIADO EM", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usersQ.isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            )}
            {usersQ.data?.map((u) => {
              const main = (u.roles[0] ?? "salesperson") as AppRole;
              const isSelf = u.id === currentUserId;
              const canEdit =
                isAdmin || (!u.roles.includes("admin") && !u.roles.includes("manager"));
              return (
                <tr key={u.id} className="border-t border-border text-offwhite/80">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={main}
                      disabled={!canEdit || isSelf}
                      onChange={(e) =>
                        roleMut.mutate({ user_id: u.id, role: e.target.value as AppRole })
                      }
                      className="rounded border border-border bg-background px-2 py-1 text-xs text-offwhite outline-none focus:border-gold disabled:opacity-50"
                    >
                      {availableRoles.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                      {!availableRoles.includes(main) && (
                        <option value={main}>{ROLE_LABEL[main] ?? main}</option>
                      )}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isSelf && canEdit && (
                      <button
                        onClick={() =>
                          confirm(`Remover acesso de ${u.email}?`) && delMut.mutate(u.id)
                        }
                        className="text-[10px] tracking-luxe text-muted-foreground hover:text-destructive"
                      >
                        REMOVER
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!usersQ.isLoading && (usersQ.data?.length ?? 0) === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Nenhum usuário ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
