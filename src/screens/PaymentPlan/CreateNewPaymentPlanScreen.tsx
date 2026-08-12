import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Input } from "../../components/Input";
import { SelectField } from "../../components/SelectField";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { createPaymentPlan } from "../../store/slices/adminSlice";
import { toast } from "react-toastify";
import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES";

// ─── Types ────────────────────────────────────────────────────────────────────
type Errors = Record<string, string>;

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

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = (data: typeof EMPTY_FORM): Errors => {
  const errs: Errors = {};

  if (!data.planName.trim())      errs.planName      = "Plan name is required";
  if (!data.status)               errs.status        = "Status is required";
  if (!data.termType)             errs.termType      = "Term type is required";
  if (!data.currency)             errs.currency      = "Currency is required";

  if (!data.termValue)            errs.termValue     = "Term value is required";
  else if (isNaN(Number(data.termValue)) || Number(data.termValue) <= 0)
                                  errs.termValue     = "Term value must be a positive number";

  if (!data.profitRate)           errs.profitRate    = "Profit rate is required";
  else if (isNaN(Number(data.profitRate)) || Number(data.profitRate) < 0)
                                  errs.profitRate    = "Must be a valid percentage (e.g. 5 for 5%)";

  if (!data.minimumAmount)        errs.minimumAmount = "Minimum amount is required";
  else if (isNaN(Number(data.minimumAmount)) || Number(data.minimumAmount) <= 0)
                                  errs.minimumAmount = "Must be a positive number";

  if (!data.maximumAmount)        errs.maximumAmount = "Maximum amount is required";
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
const CreateNewPaymentPlanScreen = () => {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData]   = useState(EMPTY_FORM);

  const patch = (k: string, v: string) => setFormData((p) => ({ ...p, [k]: v }));

  const errors = submitted ? validate(formData) : {};

  const handleSubmit = async () => {
    setSubmitted(true);
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix all errors before saving.");
      return;
    }

    const result = await dispatch(createPaymentPlan({
      planName:          formData.planName,
      status:            formData.status as "Active" | "Inactive",
      termType:          formData.termType as "Daily" | "Weekly" | "Biweekly" | "Monthly",
      currency:          formData.currency,
      termValue:         Number(formData.termValue),
      profitRate:        Number(formData.profitRate), // backend convert 5 → "0.05"
      minimumAmount:     Number(formData.minimumAmount),
      maximumAmount:     Number(formData.maximumAmount),
      termDescription:   formData.termDescription   || undefined,
      arabicDescription: formData.arabicDescription || undefined,
      additionalNotes:   formData.additionalNotes   || undefined,
    }));

    if (createPaymentPlan.fulfilled.match(result)) {
      toast.success("Payment plan created successfully!", { autoClose: 1500 });
      navigate("/admin/payment-plan/all");
    } else {
      const raw     = result.payload ?? "Failed to create payment plan. Please try again.";
      const message = ERROR_MESSAGES[raw] ?? raw;
      toast.error(message);
    }
  };

  return (
    <Sidebar>
      {/* ── Header ── */}
      <div className="flex mb-5">
        <h1 className="text-xl font-bold text-[#1a2a4a]">Add Payment Plan</h1>
      </div>

      <div className="flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm font-bold text-[#1a2a4a] mb-5">Plan Details</p>

          <div className="flex flex-col gap-4">

            {/* Row 1 — Plan Name + Status */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Plan Name" name="planName" required
                value={formData.planName}
                onChange={(v: string) => patch("planName", v)}
                error={errors.planName}
              />
              <SelectField
                label="Status" name="status" required
                value={formData.status}
                onChange={(v: string) => patch("status", v)}
                error={errors.status}
                options={STATUS_OPTIONS}
              />
            </div>

            {/* Row 2 — Term Value + Term Type + Currency */}
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="No. of Installments" name="termValue" type="number" required
                value={formData.termValue}
                onChange={(v: string) => patch("termValue", v)}
                error={errors.termValue}
              />
              <SelectField
                label="Term Type" name="termType" required
                value={formData.termType}
                onChange={(v: string) => patch("termType", v)}
                error={errors.termType}
                options={TERM_TYPE_OPTIONS}
              />
              <SelectField
                label="Currency" name="currency" required
                value={formData.currency}
                onChange={(v: string) => patch("currency", v)}
                error={errors.currency}
                options={CURRENCY_OPTIONS}
              />
            </div>

            {/* Row 3 — Min Amount + Max Amount + Profit Rate */}
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Minimum Amount" name="minimumAmount" type="number" required
                value={formData.minimumAmount}
                onChange={(v: string) => patch("minimumAmount", v)}
                error={errors.minimumAmount}
              />
              <Input
                label="Maximum Amount" name="maximumAmount" type="number" required
                value={formData.maximumAmount}
                onChange={(v: string) => patch("maximumAmount", v)}
                error={errors.maximumAmount}
              />
              <Input
                label="Profit Rate (%)" name="profitRate" type="number" required
                value={formData.profitRate}
                onChange={(v: string) => patch("profitRate", v)}
                error={errors.profitRate}
              />
            </div>

            {/* Row 4 — Term Description */}
            <Input
              label="Term Description" name="termDescription"
              value={formData.termDescription}
              onChange={(v: string) => patch("termDescription", v)}
            />

            {/* Row 5 — Arabic Description */}
            <Input
              label="Arabic Description" name="arabicDescription"
              value={formData.arabicDescription}
              onChange={(v: string) => patch("arabicDescription", v)}
            />

            {/* Row 6 — Additional Notes */}
            <Input
              label="Additional Notes" name="additionalNotes"
              value={formData.additionalNotes}
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
            onClick={handleSubmit}
            className="px-10 py-2.5 bg-[#4a5a8a] hover:bg-[#1a2a4a] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md"
          >
            Save Plan
          </button>
        </div>
      </div>
    </Sidebar>
  );
};

export default CreateNewPaymentPlanScreen;