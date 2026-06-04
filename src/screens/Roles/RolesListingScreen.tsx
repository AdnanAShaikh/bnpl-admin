import { useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import DataTable from "../../components/DataTable";
import type { ColumnDef, RowAction } from "../../components/DataTable";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllRoles,
  deleteRole,
  selectRoles,
  selectRolesLoading,
  selectRolesError,
  type AccessRole,
} from "../../store/slices/adminSlice";
import { toast } from "react-toastify";
import { usePermission } from "../../hooks/usePermission";

// ─── Flatten for DataTable ────────────────────────────────────────────────────
const flattenRole = (role: AccessRole) => ({
  id:           role.id,
  roleName:     role.roleName,
  status:       role.status,
  userCount:    role._count?.users ?? 0,
  lastModified: new Date(role.updatedAt).toLocaleDateString("en-SA"),
});

type FlatRole = ReturnType<typeof flattenRole>;

// ─── Columns ──────────────────────────────────────────────────────────────────
const COLUMNS: ColumnDef<FlatRole>[] = [
  { key: "roleName",     label: "Role Name"     },
  { key: "userCount",    label: "Assigned Users" },
  { key: "lastModified", label: "Last Modified"  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-md text-white ${
        value === "Active" ? "bg-green-500" : "bg-gray-400"
      }`}>
        {String(value)}
      </span>
    ),
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
const RolesListingScreen = () => {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const roles     = useAppSelector(selectRoles);
  const loading   = useAppSelector(selectRolesLoading);
  const error     = useAppSelector(selectRolesError);

  const canCreate = usePermission("roles.create");
  const canEdit   = usePermission("roles.edit");
  const canDelete = usePermission("roles.delete");


  useEffect(() => {
    dispatch(fetchAllRoles());
  }, [dispatch]);

  const handleDelete = async (role: FlatRole) => {
    if (!window.confirm(`Are you sure you want to delete "${role.roleName}"?`)) return;

    const result = await dispatch(deleteRole(role.id));

    if (deleteRole.fulfilled.match(result)) {
      toast.success(`Role "${role.roleName}" deleted successfully.`);
    } else {
      toast.error(result.payload as string);
    }
  };

  const ROW_ACTIONS: RowAction<FlatRole>[] = [
   canEdit && {
      label: "Edit Role",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: (role: FlatRole) => navigate(`/admin/role/edit/${role.id}`),
    },
    canDelete && {
      label: "Delete Role",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: handleDelete,
    },
  ].filter(Boolean) as RowAction<FlatRole>[];

  const flatRoles = roles.map(flattenRole);

  if (loading) return (
    <Sidebar>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading roles...</p>
      </div>
    </Sidebar>
  );

  if (error) return (
    <Sidebar>
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    </Sidebar>
  );

  return (
    <Sidebar>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#1a2a4a]">Roles</h1>
      </div>

      <DataTable<FlatRole>
        title="All Roles"
        columns={COLUMNS}
        dataSource={flatRoles}
        rowActions={ROW_ACTIONS}
        searchable
        searchKeys={["roleName", "status"]}
        showStatusFilter
        statusOptions={["Active", "Inactive", "All Status"]}
        defaultStatus="All Status"
        defaultPageSize={10}
        actionButton={

        canCreate ?
          <button
            onClick={() => navigate("/admin/role/new")}
            className="flex items-center gap-2 border-2 border-[#1a2a4a] text-[#1a2a4a] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#1a2a4a] hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create New Role
          </button>
          : null
        }
      />
    </Sidebar>
  );
};

export default RolesListingScreen;