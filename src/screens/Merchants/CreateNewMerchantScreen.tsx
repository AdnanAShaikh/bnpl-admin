import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Input } from "../../components/Input";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createNewMerchant, fetchAllMerchants, selectActionLoading } from "../../store/slices/adminSlice";
import { toast } from "react-toastify";

type Errors = Record<string, string>;

const CreateNewMerchantScreen = () => {
  const navigate      = useNavigate();
  const dispatch      = useAppDispatch();
  const actionLoading = useAppSelector(selectActionLoading);

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  const patch = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Errors = {};
    if (!form.name)    e.name  = "Name is required";
    if (!form.email)   e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)        e.password        = "Password is required";
    else if (form.password.length < 8)          e.password = "Minimum 8 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const result = await dispatch(createNewMerchant({
      name:     form.name,
      email:    form.email,
      password: form.password,
    }));

    if (createNewMerchant.fulfilled.match(result)) {
      const merchantId = result.payload.user.merchant.id;
      toast.success("Merchant created!");
      await dispatch(fetchAllMerchants()); // ← refetch so edit screen finds it in state
      navigate(`/admin/merchant/edit/${merchantId}`);
    } else {
      toast.error(result.payload as string || "Failed to create merchant");
    }
  };

  return (
    <Sidebar>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[#1a2a4a]">Create New Merchant</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-7 flex flex-col gap-6">

          <p className="text-sm text-gray-500 leading-relaxed">
            Enter the merchant's basic credentials. You'll be taken to their profile to fill in company details, power of attorney, GNPL config, and upload documents.
          </p>

          <Input label="Full Name"         name="name"            required value={form.name}            onChange={(v: any) => patch("name", v)}            error={errors.name}            />
          <Input label="Email Address"     name="email"           required value={form.email}           onChange={(v: any) => patch("email", v)}           error={errors.email}           type="email"    />
          <Input label="Password"          name="password"        required value={form.password}        onChange={(v: any) => patch("password", v)}        error={errors.password}        type="password" />
          <Input label="Confirm Password"  name="confirmPassword" required value={form.confirmPassword} onChange={(v: any) => patch("confirmPassword", v)} error={errors.confirmPassword} type="password" />

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={actionLoading}
              className="px-10 py-3 bg-[#1a2a4a] hover:bg-[#243a64] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md"
            >
              {actionLoading ? "Creating..." : "Create Merchant"}
            </button>
          </div>

        </div>
      </div>
    </Sidebar>
  );
};

export default CreateNewMerchantScreen;