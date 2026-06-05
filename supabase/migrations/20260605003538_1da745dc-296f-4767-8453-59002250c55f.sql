
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin'::app_role,'manager'::app_role)
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin_or_manager(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins and managers can view all roles" ON public.user_roles;
CREATE POLICY "Admins and managers can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin_or_manager(auth.uid()));
