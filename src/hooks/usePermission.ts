import { useAppSelector } from "../store/hooks";
import { selectAuthUser } from "../store/slices/adminSlice";

export const usePermission = (permission: string): boolean => {
  const authUser = useAppSelector(selectAuthUser);

  // Super Admin — full access
  if (authUser?.accessRole?.roleName === "Super Admin") return true;

  // No role assigned — deny everything
  if (!authUser?.accessRole) return false;

  return authUser.accessRole.permissions[permission] === true;
};