/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Input } from "../../components/Input";
import { SelectField } from "../../components/SelectField";
import { useAppDispatch } from "../../store/hooks";
import { createNewRole } from "../../store/slices/adminSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PERMISSION_GROUPS } from "../../constants/permissions";

const STATUS_OPTIONS = [
  { value: "Active",   label: "Active"   },
  { value: "Inactive", label: "Inactive" },
];

// ─── Permission Checkbox ──────────────────────────────────────────────────────
const PermissionCheckbox = ({
  label,
  checked,
  onChange,
}: {
  label:    string;
  checked:  boolean;
  onChange: (v: boolean) => void;
}) => (
  <div
    onClick={() => onChange(!checked)}
    className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none"
  >
    <span className="text-sm text-gray-700">{label}</span>
    {/* Custom radio circle */}
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        checked ? "border-[#1a2a4a] bg-[#1a2a4a]" : "border-gray-300 bg-white"
      }`}
    >
      {checked && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  </div>
);

// ─── Permission Group Card ────────────────────────────────────────────────────
const PermissionGroup = ({
  group,
  permissions,
  selected,
  onToggle,
  onToggleAll,
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
      {/* Group header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
        <p className="text-sm font-semibold text-[#1a2a4a]">{group}</p>
        <button
          type="button"
          onClick={() => onToggleAll(keys, !allChecked)}
          className="text-xs font-medium text-[#1a2a4a] hover:underline transition-colors"
        >
          {allChecked ? "Deselect All" : "Select All"}
        </button>
      </div>

      {/* Permissions grid */}
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
const CreateNewRoleScreen = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [roleName, setRoleName]   = useState("");
  const [status,   setStatus]     = useState("Active");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleToggle = (key: string, val: boolean) => {
    setPermissions((p) => ({ ...p, [key]: val }));
  };

  const handleToggleAll = (keys: string[], val: boolean) => {
    setPermissions((p) => {
      const next = { ...p };
      keys.forEach((k) => { next[k] = val; });
      return next;
    });
  };

  const handleSelectAll = () => {
    const all: Record<string, boolean> = {};
    PERMISSION_GROUPS.forEach((g) => g.permissions.forEach((p) => { all[p.key] = true; }));
    setPermissions(all);
  };

  const handleClearAll = () => setPermissions({});

  const totalSelected = Object.values(permissions).filter(Boolean).length;
  const totalAll      = PERMISSION_GROUPS.reduce((s, g) => s + g.permissions.length, 0);

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!roleName.trim()) errs.roleName = "Role name is required";
    if (!status)          errs.status   = "Status is required";

    setErrors(errs);
    setSubmitted(true);

    if (Object.keys(errs).length > 0) return;

    const result = await dispatch(createNewRole({ roleName, status, permissions }));
    if (createNewRole.fulfilled.match(result)) {
        toast.success("Role created successfully!");
        navigate("/admin/role/all");
        } else {
        toast.error(result.payload as string);
    }
  };

  return (
    <Sidebar>
      {/* Page heading */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[#1a2a4a]">Create New Role</h1>
        <button
          onClick={handleSubmit}
          className="px-8 py-2.5 bg-[#1a2a4a] hover:bg-[#243a64] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md"
        >
          Save Role
        </button>
      </div>

      <div className="flex flex-col gap-5">

        {/* ── Role Details Card ── */}
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

        {/* ── Permissions Card ── */}
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

        {/* ── Footer Save ── */}
        <div className="flex justify-end pb-2">
          <button
            onClick={handleSubmit}
            className="px-10 py-3 bg-[#1a2a4a] hover:bg-[#243a64] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md"
          >
            Save Role
          </button>
        </div>
      </div>
    </Sidebar>
  );
};

export default CreateNewRoleScreen;