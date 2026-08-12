import { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Input } from "../../components/Input";
import { SelectField } from "../../components/SelectField";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllPaymentPlans,
  updatePaymentPlan,
  selectPaymentPlan,
} from "../../store/slices/adminSlice";
import { toast } from "react-toastify";
import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "Active",   label: "Active"   },
  { value: "Inactive", label: "Inactive" },
];

const TERM_TYPE_OPTIONS = [
  { value: "Daily",    label: "Daily"    },
  { value: "Weekly",   label: "Weekly"   },
  { value: "Biweekly", label: "Biweekly" },
  { value: "Monthly",  label: "Monthly"  },
];

const CURRENCY_OPTIONS = [
  { value: "SAR", label: "SAR — Saudi Riyal" },
  { value: "USD", label: "USD — US Dollar"   },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type Errors = Record<string, string>;

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = (data: typeof EMPTY_FORM): Errors => {
  const errs: Errors = {};

  if (!data.planName.trim())    errs.planName      = "Plan name is required";
  if (!data.status)             errs.status        = "Status is required";
  if (!data.termType)           errs.termType      = "Term type is required";
  if (!data.currency)           errs.currency      = "Currency is required";

  if (!data.termValue)          errs.termValue     = "Term value is required";
  else if (isNaN(Number(data.termValue)) || Number(data.termValue) <= 0)
                                errs.termValue     = "Term value must be a positive number";

  if (!data.profitRate)         errs.profitRate    = "Profit rate is required";
  else if (isNaN(Number(data.profitRate)) || Number(data.profitRate) < 0)
                                errs.profitRate    = "Must be a valid percentage (e.g. 5 for 5%)";

  if (!data.minimumAmount)      errs.minimumAmount = "Minimum amount is required";
  else if (isNaN(Number(data.minimumAmount)) || Number(data.minimumAmount) <= 0)
                                errs.minimumAmount = "Must be a positive number";

  if (!data.maximumAmount)      errs.maximumAmount = "Maximum amount is required";
  else if (isNaN(Number(data.maximumAmount)) || Number(data.maximumAmount) <= 0)
                                errs.maximumAmount = "Must be a positive number";

  if (
    data.minimumAmount &&
    data.maximumAmount &&
    Number(data.minimumAmount) >= Number(data.maximumAmount)
  ) errs.maximumAmount = "Maximum amount must be greater than minimum amount";

  return errs;
};

const EMPTY_FORM = {
  planName:          "",
  status:            "",
  termValue:         "",
  termType:          "",
  profitRate:        "",
  currency:          "",
  minimumAmount:     "",
  maximumAmount:     "",
  termDescription:   "",
  arabicDescription: "",
  additionalNotes:   "",
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const EditPaymentPlanScreen = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const paymentPlans = useAppSelector(selectPaymentPlan);
  const plan         = paymentPlans.find((p:any) => p.id === Number(id));

  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const initialized = useRef(false);

  // ── Bootstrap data ──
  useEffect(() => {
    if (paymentPlans.length === 0) dispatch(fetchAllPaymentPlans());
  }, [dispatch, paymentPlans.length]);

  // ── Pre-fill form when plan loads ──
  if (plan && !initialized.current) {
    initialized.current = true;
    setForm({
      planName:          plan.planName,
      status:            plan.status,
      termValue:         String(plan.termValue),
      termType:          plan.termType,
      profitRate:        String(Number(plan.profitRate) * 100), // stored as 0.05, show as 5
      currency:          plan.currency,
      minimumAmount:     String(plan.minimumAmount),
      maximumAmount:     String(plan.maximumAmount),
      termDescription:   plan.termDescription   ?? "",
      arabicDescription: plan.arabicDescription ?? "",
      additionalNotes:   plan.additionalNotes   ?? "",
    });
  }

  const patch = (key: string, value: string) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (submitted) setErrors(validate(next));
      return next;
    });

  // ── Not found guard ──
  if (paymentPlans.length > 0 && !plan) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Payment plan not found.</p>
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
      updatePaymentPlan({
        id:                Number(id),
        planName:          form.planName,
        status:            form.status as "Active" | "Inactive",
        termType:          form.termType as "Daily" | "Weekly" | "Biweekly" | "Monthly",
        currency:          form.currency,
        termValue:         Number(form.termValue),
        profitRate:        Number(form.profitRate) / 100, // convert 5 → 0.05
        minimumAmount:     Number(form.minimumAmount),
        maximumAmount:     Number(form.maximumAmount),
        termDescription:   form.termDescription   || undefined,
        arabicDescription: form.arabicDescription || undefined,
        additionalNotes:   form.additionalNotes   || undefined,
      })
    );

    if (updatePaymentPlan.fulfilled.match(result)) {
      toast.success("Payment plan updated successfully!", { autoClose: 1500 });
      navigate("/admin/payment-plan/all");
    } else {
      const raw     = result.payload ?? "Failed to update payment plan. Please try again.";
      const message = ERROR_MESSAGES[raw] ?? raw;
      toast.error(message);
    }
  };

  return (
    <Sidebar>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/payment-plan/all")}
            className="text-gray-400 hover:text-[#1a2a4a] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1a2a4a]">Edit Payment Plan</h1>
            {plan && (
              <p className="text-xs text-gray-400 mt-0.5">
                {plan.planName} · #{plan.id}
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

      <div className="flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm font-bold text-[#1a2a4a] mb-5">Plan Details</p>

          <div className="flex flex-col gap-4">

            {/* Row 1 — Plan Name + Status */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Plan Name" name="planName" required
                value={form.planName}
                onChange={(v: string) => patch("planName", v)}
                error={errors.planName}
              />
              <SelectField
                label="Status" name="status" required
                value={form.status}
                onChange={(v: string) => patch("status", v)}
                error={errors.status}
                options={STATUS_OPTIONS}
              />
            </div>

            {/* Row 2 — Term Value + Term Type + Currency */}
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Term Value" name="termValue" type="number" required
                value={form.termValue}
                onChange={(v: string) => patch("termValue", v)}
                error={errors.termValue}
              />
              <SelectField
                label="Term Type" name="termType" required
                value={form.termType}
                onChange={(v: string) => patch("termType", v)}
                error={errors.termType}
                options={TERM_TYPE_OPTIONS}
              />
              <SelectField
                label="Currency" name="currency" required
                value={form.currency}
                onChange={(v: string) => patch("currency", v)}
                error={errors.currency}
                options={CURRENCY_OPTIONS}
              />
            </div>

            {/* Row 3 — Min Amount + Max Amount + Profit Rate */}
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Minimum Amount" name="minimumAmount" type="number" required
                value={form.minimumAmount}
                onChange={(v: string) => patch("minimumAmount", v)}
                error={errors.minimumAmount}
              />
              <Input
                label="Maximum Amount" name="maximumAmount" type="number" required
                value={form.maximumAmount}
                onChange={(v: string) => patch("maximumAmount", v)}
                error={errors.maximumAmount}
              />
              <Input
                label="Profit Rate (%)" name="profitRate" type="number" required
                value={form.profitRate}
                onChange={(v: string) => patch("profitRate", v)}
                error={errors.profitRate}
              />
            </div>

            {/* Row 4 — Term Description */}
            <Input
              label="Term Description" name="termDescription"
              value={form.termDescription}
              onChange={(v: string) => patch("termDescription", v)}
            />

            {/* Row 5 — Arabic Description */}
            <Input
              label="Arabic Description" name="arabicDescription"
              value={form.arabicDescription}
              onChange={(v: string) => patch("arabicDescription", v)}
            />

            {/* Row 6 — Additional Notes */}
            <Input
              label="Additional Notes" name="additionalNotes"
              value={form.additionalNotes}
              onChange={(v: string) => patch("additionalNotes", v)}
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
            onClick={handleSave}
            className="px-10 py-2.5 bg-[#4a5a8a] hover:bg-[#1a2a4a] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Sidebar>
  );
};

export default EditPaymentPlanScreen;