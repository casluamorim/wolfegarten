
-- Restringe execução de funções SECURITY DEFINER ao mínimo necessário.
-- has_role: necessária para policies que rodam como 'authenticated'; bloqueia 'anon' e 'public'.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- is_admin_or_manager: usada apenas em código de servidor/admin.
REVOKE EXECUTE ON FUNCTION public.is_admin_or_manager(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager(uuid) TO service_role;

-- handle_new_user: trigger function; ninguém precisa chamar diretamente.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
