/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Input } from "../../components/Input";
import { SelectField } from "../../components/SelectField";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllRoles,
  updateRole,
  selectRoles,
} from "../../store/slices/adminSlice";
import { toast } from "react-toastify";

// ─── Permission Definitions (same as CreateNewRoleScreen) ─────────────────────
const PERMISSION_GROUPS = [
  {
    group: "User",
    permissions: [
      { key: "user.create",         label: "Create User"     },
      { key: "user.view",           label: "View User"       },
      { key: "user.edit",           label: "Edit User"       },
      { key: "user.changePassword", label: "Change Password" },
    ],
  },
  {
    group: "Merchant",
    permissions: [
      { key: "merchant.create",  label: "Create Merchant"    },
      { key: "merchant.approve", label: "Approve Merchant"   },
      { key: "merchant.reject",  label: "Reject Merchant"    },
      { key: "merchant.suspend", label: "Suspend Merchant"   },
      { key: "merchant.viewEdit",label: "View/Edit Merchant" },
    ],
  },
  {
    group: "Buyer",
    permissions: [
      { key: "buyer.create",  label: "Create Buyer"    },
      { key: "buyer.approve", label: "Approve Buyer"   },
      { key: "buyer.reject",  label: "Reject Buyer"    },
      { key: "buyer.suspend", label: "Suspend Buyer"   },
      { key: "buyer.viewEdit",label: "View/Edit Buyer" },
    ],
  },
  {
    group: "Orders",
    permissions: [
      { key: "orders.view",    label: "View Orders"    },
      { key: "orders.approve", label: "Approve Orders" },
      { key: "orders.reject",  label: "Reject Orders"  },
      { key: "orders.fulfill", label: "Fulfill Orders" },
    ],
  },
  {
    group: "Products",
    permissions: [
      { key: "products.create", label: "Create Product"  },
      { key: "products.view",   label: "View Products"   },
      { key: "products.edit",   label: "Edit Product"    },
      { key: "products.delete", label: "Delete Product"  },
    ],
  },
  {
    group: "Payments",
    permissions: [
      { key: "payments.view",    label: "View Payments"    },
      { key: "payments.process", label: "Process Payments" },
      { key: "payments.refund",  label: "Refund Payments"  },
    ],
  },
  {
    group: "GNPL Configuration",
    permissions: [
      { key: "gnpl.view", label: "View GNPL Config" },
      { key: "gnpl.edit", label: "Edit GNPL Config" },
    ],
  },
  {
    group: "Roles",
    permissions: [
      { key: "roles.create", label: "Create Role" },
      { key: "roles.view",   label: "View Roles"  },
      { key: "roles.edit",   label: "Edit Role"   },
      { key: "roles.delete", label: "Delete Role" },
    ],
  },
  {
    group: "Notification Setup",
    permissions: [
      { key: "notifications.view", label: "View Notifications" },
      { key: "notifications.edit", label: "Edit Notifications" },
    ],
  },
];

const STATUS_OPTIONS = [
  { value: "Active",   label: "Active"   },
  { value: "Inactive", label: "Inactive" },
];

// ─── Permission Checkbox ──────────────────────────────────────────────────────
const PermissionCheckbox = ({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) => (
  <div
    onClick={() => onChange(!checked)}
    className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none"
  >
    <span className="text-sm text-gray-700">{label}</span>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
      checked ? "border-[#1a2a4a] bg-[#1a2a4a]" : "border-gray-300 bg-white"
    }`}>
      {checked && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  </div>
);

// ─── Permission Group ─────────────────────────────────────────────────────────
const PermissionGroup = ({
  group, permissions, selected, onToggle, onToggleAll,
}: {
  group:       string;
  permissions: { key: string; label: string }[];
  selected:    Record<string, boolean>;
  onToggle:    (key: string, val: boolean) => void;
  onToggleAll: (keys: string[], val: boolean) => void;
}) => {
  const allChecked = permissions.every((p) => selected[p.key]);
  const keys       = permissions.map((p) => p.key);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
        <p className="text-sm font-semibold text-[#1a2a4a]">{group}</p>
        <button
          type="button"
          onClick={() => onToggleAll(keys, !allChecked)}
          className="text-xs font-medium text-[#1a2a4a] hover:underline"
        >
          {allChecked ? "Deselect All" : "Select All"}
        </button>
      </div>
      <div className="p-4 grid grid-cols-4 gap-3">
        {permissions.map((p) => (
          <PermissionCheckbox
            key={p.key}
            label={p.label}
            checked={!!selected[p.key]}
            onChange={(val) => onToggle(p.key, val)}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const EditRoleScreen = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const roles     = useAppSelector(selectRoles);

  const role = roles.find((r) => r.id === Number(id));

  // Re-fetch if store is empty (e.g. on page refresh)
  React.useEffect(() => {
    if (roles.length === 0) dispatch(fetchAllRoles());
  }, [dispatch, roles.length]);

  // ── State — pre-filled from role ──
  const [roleName,     setRoleName]     = useState(role?.roleName  ?? "");
  const [status,       setStatus]       = useState(role?.status    ?? "Active");
  const [permissions,  setPermissions]  = useState<Record<string, boolean>>(
    (role?.permissions as Record<string, boolean>) ?? {}
  );
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [submitted,    setSubmitted]    = useState(false);

  // Re-populate once role loads after refresh
  const initialized = React.useRef(false);
  if (role && !initialized.current) {
    initialized.current = true;
    if (!roleName) setRoleName(role.roleName);
    if (!status)   setStatus(role.status);
    if (Object.keys(permissions).length === 0 && role.permissions) {
      setPermissions(role.permissions as Record<string, boolean>);
    }
  }

  const handleToggle = (key: string, val: boolean) =>
    setPermissions((p) => ({ ...p, [key]: val }));

  const handleToggleAll = (keys: string[], val: boolean) =>
    setPermissions((p) => {
      const next = { ...p };
      keys.forEach((k) => { next[k] = val; });
      return next;
    });

  const handleSelectAll = () => {
    const all: Record<string, boolean> = {};
    PERMISSION_GROUPS.forEach((g) => g.permissions.forEach((p) => { all[p.key] = true; }));
    setPermissions(all);
  };

  const handleClearAll = () => setPermissions({});

  const totalSelected = Object.values(permissions).filter(Boolean).length;
  const totalAll      = PERMISSION_GROUPS.reduce((s, g) => s + g.permissions.length, 0);

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!roleName.trim()) errs.roleName = "Role name is required";
    if (!status)          errs.status   = "Status is required";

    setErrors(errs);
    setSubmitted(true);

    if (Object.keys(errs).length > 0) {
      toast.error("Please fix all errors before saving.");
      return;
    }

    const result = await dispatch(updateRole({
      id:          Number(id),
      roleName,
      status,
      permissions,
    }));

    if (updateRole.fulfilled.match(result)) {
      toast.success("Role updated successfully!", { autoClose: 1500 });
      navigate("/admin/role/all");
    } else {
      toast.error(result.payload as string);
    }
  };

  if (!role && roles.length > 0) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Role not found.</p>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/role/all")}
            className="text-gray-400 hover:text-[#1a2a4a] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-[#1a2a4a]">Edit Role</h1>
        </div>
        <button
          onClick={handleSave}
          className="px-8 py-2.5 bg-[#1a2a4a] hover:bg-[#243a64] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md"
        >
          Save Changes
        </button>
      </div>

      <div className="flex flex-col gap-5">

        {/* Role Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm font-bold text-[#1a2a4a] mb-4">Role Details</p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Role Name" name="roleName" required
              value={roleName}
              onChange={setRoleName}
              error={submitted ? errors.roleName : undefined}
            />
            <SelectField
              label="Change Status" name="status" required
              value={status}
              onChange={setStatus}
              error={submitted ? errors.status : undefined}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-base font-bold text-[#1a2a4a]">
                Select the functionality you want to allow for this role
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {totalSelected} of {totalAll} permissions selected
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold text-[#1a2a4a] border border-[#1a2a4a] px-3 py-1.5 rounded-lg hover:bg-[#1a2a4a] hover:text-white transition-all duration-200"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {PERMISSION_GROUPS.map((g) => (
              <PermissionGroup
                key={g.group}
                group={g.group}
                permissions={g.permissions}
                selected={permissions}
                onToggle={handleToggle}
                onToggleAll={handleToggleAll}
              />
            ))}
          </div>
        </div>

        {/* Footer Save */}
        <div className="flex justify-end pb-2">
          <button
            onClick={handleSave}
            className="px-10 py-3 bg-[#1a2a4a] hover:bg-[#243a64] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Sidebar>
  );
};

export default EditRoleScreen;