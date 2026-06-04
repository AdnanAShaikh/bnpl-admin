import { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Input } from "../../components/Input";
import { SelectField } from "../../components/SelectField";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllAdminUsers,
  updateAdminUser,
  selectUsers,
  selectRoles,
  fetchAllRoles,
} from "../../store/slices/adminSlice";
import { toast } from "react-toastify";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { value: "ENGINEERING",  label: "Engineering"  },
  { value: "OPERATIONS",   label: "Operations"   },
  { value: "LEGAL",        label: "Legal"        },
  { value: "FINANCE",      label: "Finance"      },
  { value: "SALES",        label: "Sales"        },
  { value: "CREDIT",       label: "Credit"       },
  { value: "HR",           label: "HR"           },
];

const STATUS_OPTIONS = [
  { value: "false", label: "Active"   },
  { value: "true",  label: "Inactive" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type Errors = Record<string, string>;

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = (form: typeof EMPTY_FORM): Errors => {
  const errors: Errors = {};
  if (!form.name.trim())  errors.name  = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address";
  return errors;
};

const EMPTY_FORM = {
  name:        "",
  email:       "",
  staffId:     "",
  department:  "",
  dateOfBirth: "",
  isDisabled:  "false",
  accessRoleId:"",
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const EditUserScreen = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const users = useAppSelector(selectUsers);
  const roles = useAppSelector(selectRoles);
  const user  = users.find((u) => u.id === Number(id));

  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const initialized = useRef(false);

  // ── Bootstrap data ──
  useEffect(() => {
    if (users.length === 0) dispatch(fetchAllAdminUsers());
    if (roles.length === 0) dispatch(fetchAllRoles());
  }, [dispatch, users.length, roles.length]);

  // ── Pre-fill form when user loads ──
  if (user && !initialized.current) {
    initialized.current = true;
    setForm({
      name:         user.name        ?? "",
      email:        user.email       ?? "",
      staffId:      user.staffId     ?? "",
      department:   user.department  ?? "",
      dateOfBirth:  user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
      isDisabled:   String(user.isDisabled ?? false),
      accessRoleId: user.accessRole ? String(user.accessRole.id) : "",
    });
  }

  const patch = (key: string, value: string) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (submitted) setErrors(validate(next));
      return next;
    });

  // ── Not found guard ──
  if (users.length > 0 && !user) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">User not found.</p>
        </div>
      </Sidebar>
    );
  }

  // ── Save ──
  const handleSave = async () => {
    const validationErrors = validate(form);
    setErrors(validationErrors);
    setSubmitted(true);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix all errors before saving.");
      return;
    }

    const result = await dispatch(
      updateAdminUser({
        id:           Number(id),
        name:         form.name         || undefined,
        email:        form.email        || undefined,
        staffId:      form.staffId      || undefined,
        department:   form.department   || undefined,
        dateOfBirth:  form.dateOfBirth  || undefined,
        isDisabled:   form.isDisabled === "true",
        accessRoleId: form.accessRoleId ? Number(form.accessRoleId) : undefined,
      })
    );

    if (updateAdminUser.fulfilled.match(result)) {
      toast.success("User updated successfully!", { autoClose: 1500 });
      navigate("/admin/user/all");
    } else {
      toast.error(result.payload ?? "Failed to update user. Please try again.");
    }
  };

  const roleOptions = roles.map((r) => ({ value: String(r.id), label: r.roleName }));

  return (
    <Sidebar>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/user/all")}
            className="text-gray-400 hover:text-[#1a2a4a] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1a2a4a]">Edit User</h1>
            {user && (
              <p className="text-xs text-gray-400 mt-0.5">
                {user.email} · #{user.id}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleSave}
          className="px-8 py-2.5 bg-[#1a2a4a] hover:bg-[#243a64] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md"
        >
          Save Changes
        </button>
      </div>

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-7">
        <div className="flex flex-col gap-5">

   {/* Row 2 — Access Role + Staff ID + Department */}
          <div className="grid grid-cols-3 gap-4">
          <SelectField
              label="Access Role"
              name="accessRoleId"
              value={form.accessRoleId}
              onChange={(v: string) => patch("accessRoleId", v)}
              options={roleOptions}
            />
            <Input
              label="Staff ID"
              name="staffId"
              value={form.staffId}
              onChange={(v: string) => patch("staffId", v)}
            />
            <SelectField
              label="Department"
              name="department"
              value={form.department}
              onChange={(v: string) => patch("department", v)}
              options={DEPARTMENTS}
            />
          </div>

          {/* Row 1 — Name + Email */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              required
              value={form.name}
              onChange={(v: string) => patch("name", v)}
              error={errors.name}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={(v: string) => patch("email", v)}
              error={errors.email}
            />
          </div>

          <div className="">
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={(v: string) => patch("dateOfBirth", v)}
            />
          </div>

          {/* Row 4 — Status (full width intentional — prominent toggle) */}
          <div className="">
            <SelectField
              label="Status"
              name="isDisabled"
              required
              value={form.isDisabled}
              onChange={(v: string) => patch("isDisabled", v)}
              options={STATUS_OPTIONS}
            />
          </div>

        </div>
      </div>
    </Sidebar>
  );
};

export default EditUserScreen;