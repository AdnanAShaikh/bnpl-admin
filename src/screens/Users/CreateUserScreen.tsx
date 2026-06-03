/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Input } from "../../components/Input";
import { SelectField } from "../../components/SelectField";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createAdminUser, fetchAllRoles, selectRoles } from "../../store/slices/adminSlice";
import { toast } from "react-toastify";
import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES";

// ─── Types ────────────────────────────────────────────────────────────────────
type Errors = Record<string, string>;

const DEPARTMENTS = [
  { value: "ENGINEERING",  label: "Engineering"  },
  { value: "OPERATIONS",   label: "Operations"   },
  { value: "LEGAL",        label: "Legal"        },
  { value: "FINANCE",      label: "Finance"      },
  { value: "SALES",        label: "Sales"        },
  { value: "CREDIT",       label: "Credit"       },
  { value: "HR",           label: "HR"           },
];

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = (data: any): Errors => {
  const errs: Errors = {};
  if (!data.accessRoleId)                       errs.accessRoleId    = "User role is required";
  if (!data.staffId)                             errs.staffId         = "Staff ID is required";
  if (!data.email)                               errs.email           = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(data.email))    errs.email           = "Invalid Email";
  if (!data.name)                                errs.name            = "Full name is required";
  if (!data.dateOfBirth)                         errs.dateOfBirth     = "Date of birth is required";
  if (!data.password)                            errs.password        = "Password is required";
  else if (data.password.length < 8)             errs.password        = "Minimum 8 characters";
  if (!data.confirmPassword)                     errs.confirmPassword = "Please confirm password";
  else if (data.password !== data.confirmPassword) errs.confirmPassword = "Passwords do not match";
  return errs;
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const CreateUserScreen = () => {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const roles     = useAppSelector(selectRoles);

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData]   = useState({
    accessRoleId:   "",
    staffId:        "",
    email:          "",
    name:           "",
    dateOfBirth:    "",
    department:     "",
    password:       "",
    confirmPassword:"",
  });

  const patch = (k: string, v: string) => setFormData((p) => ({ ...p, [k]: v }));

  const errors = submitted ? validate(formData) : {};

  // Fetch roles for the dropdown
  useEffect(() => {
    if (roles.length === 0) dispatch(fetchAllRoles());
  }, [dispatch, roles.length]);

  const activeRoles = roles
    .filter((r) => r.status === "Active")
    .map((r) => ({ value: String(r.id), label: r.roleName }));

const handleSubmit = async () => {
  setSubmitted(true);
  const errs = validate(formData);
  if (Object.keys(errs).length > 0) return;

  const result = await dispatch(createAdminUser({
    email:        formData.email,
    password:     formData.password,
    name:         formData.name        || undefined,
    staffId:      formData.staffId     || undefined,
    dateOfBirth:  formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split("T")[0] : undefined,
    department:   formData.department  || undefined,
    accessRoleId: formData.accessRoleId ? Number(formData.accessRoleId) : undefined,
  }));

  if (createAdminUser.fulfilled.match(result)) {
    toast.success("User created successfully!", { autoClose: 1500 });
    navigate("/admin/user/all");
  } else {

    const raw     = result.payload ?? "Failed to create user. Please try again.";
    const message = ERROR_MESSAGES[raw] ?? raw;

    toast.error(message);
  }
};

  return (
    <Sidebar>
      <h1 className="text-xl font-bold text-[#1a2a4a] mb-5">Create User</h1>

      <div className="flex flex-col gap-5">

        {/* ── User Details Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm font-bold text-[#1a2a4a] mb-5">User Details</p>

          <div className="flex flex-col gap-4">

            {/* User Role + Staff ID + Department */}
            <div className="grid grid-cols-3 gap-4">
              <SelectField
                label="User Role" name="accessRoleId" required
                value={formData.accessRoleId}
                onChange={(v) => patch("accessRoleId", v)}
                error={errors.accessRoleId}
                options={activeRoles.length > 0 ? activeRoles : [{ value: "", label: "No roles available" }]}
              />
              <Input
                label="Staff ID" name="staffId" required
                value={formData.staffId}
                onChange={(v) => patch("staffId", v)}
                error={errors.staffId}
              />
            <SelectField
                label="Department"
                name="department"
                value={formData.department}
                onChange={(v: string) => patch("department", v)}
                options={DEPARTMENTS}
              />
            </div>

          {/* Full Name — full width */}
            <Input
              label="Full Name" name="name" required
              value={formData.name}
              onChange={(v) => patch("name", v)}
              error={errors.name}
            />
            
            {/* Email — full width */}
            <Input
              label="Email" name="email" type="email" required
              value={formData.email}
              onChange={(v) => patch("email", v)}
              error={errors.email}
            />

                   {/* Password + Confirm Password */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Password" name="password" type="password" required
                value={formData.password}
                onChange={(v) => patch("password", v)}
                error={errors.password}
              />
              <Input
                label="Confirm Password" name="confirmPassword" type="password" required
                value={formData.confirmPassword}
                onChange={(v) => patch("confirmPassword", v)}
                error={errors.confirmPassword}
              />
            </div>
            
            {/* Date of Birth — full width */}
            <Input
              label="Date of Birth" name="dateOfBirth" type="date" required
              value={formData.dateOfBirth}
              onChange={(v) => patch("dateOfBirth", v)}
              error={errors.dateOfBirth}
            />
 

          </div>
        </div>

        {/* ── Footer Buttons ── */}
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-2.5 border-2 border-gray-300 text-gray-600 font-semibold text-sm rounded-xl hover:border-[#1a2a4a] hover:text-[#1a2a4a] transition-all duration-200"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="px-10 py-2.5 bg-[#4a5a8a] hover:bg-[#1a2a4a] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md"
          >
            Create User
          </button>
        </div>

      </div>
    </Sidebar>
  );
};

export default CreateUserScreen;