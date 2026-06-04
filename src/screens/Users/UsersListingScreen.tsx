import { useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import DataTable from "../../components/DataTable";
import type { ColumnDef, RowAction } from "../../components/DataTable";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import {
  fetchAllAdminUsers,
  selectUsers,
  selectUsersError,
  type AdminUser,
} from "../../store/slices/adminSlice";
import { usePermission } from "../../hooks/usePermission";

// ─── Flatten ──────────────────────────────────────────────────────────────────
const flattenUser = (user: AdminUser) => ({
  id:          user.id,
  staffId:     user.staffId     ?? "—",
  name:        user.name        ?? "—",
  email:       user.email,
  department:  user.department  ?? "—",
  accessRole:  user.accessRole?.roleName ?? "—",
  status:      user.isDisabled ? "Inactive" : "Active",
});

type FlatUser = ReturnType<typeof flattenUser>;

// ─── Status styles ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  Active:   "bg-green-500",
  Inactive: "bg-gray-400",
};

// ─── Column Definitions ───────────────────────────────────────────────────────
const COLUMNS: ColumnDef<FlatUser>[] = [
  { key: "staffId",    label: "Staff ID"    },
  { key: "name",       label: "Name"        },
  { key: "email",      label: "Email"       },
  { key: "department", label: "Department"  },
  { key: "accessRole", label: "Access Role" },
  {
    key:   "status",
    label: "Status",
    render: (value) => {
      const cls = STATUS_STYLES[String(value)] ?? "bg-gray-400";
      return (
        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-md text-white ${cls}`}>
          {String(value)}
        </span>
      );
    },
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
const UsersListingScreen = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const users   = useAppSelector(selectUsers);
  const error   = useAppSelector(selectUsersError);

  const canCreate = usePermission("user.create");
  const canEdit   = usePermission("user.edit");
  const canChangePassword = usePermission("user.ChangePassword");

  useEffect(() => {
    dispatch(fetchAllAdminUsers());
  }, [dispatch]);

  const flatUsers = users.map(flattenUser);

  // ─── Row Actions ────────────────────────────────────────────────────────────
  const ROW_ACTIONS: RowAction<FlatUser>[] = [
   canEdit && {
      label: "Edit User",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: (user: FlatUser) => navigate(`/admin/user/edit/${user.id}/`),
    },
   canChangePassword && {
      label: "Change Password",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      onClick: (user: FlatUser) => navigate(`/admin/user/${user.id}/change-password`),
    },
  ].filter(Boolean) as RowAction<FlatUser>[];

  return (
    <Sidebar>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[#1a2a4a]">Users</h1>

        {
          canCreate ? 
            <button
              onClick={() => navigate("/admin/user/new")}
              className="flex items-center gap-2 border-2 border-[#1a2a4a] text-[#1a2a4a] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#1a2a4a] hover:text-white transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create User
            </button> 
            : null
        }
    
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <DataTable<FlatUser>
        title="All Users"
        columns={COLUMNS}
        dataSource={flatUsers}
        rowActions={ROW_ACTIONS}
        searchable
        searchKeys={["staffId", "name", "email", "department"]}
        showStatusFilter
        statusOptions={["Active", "Inactive", "All Status"]}
        defaultStatus="All Status"
        defaultPageSize={10}
      />
    </Sidebar>
  );
};

export default UsersListingScreen;