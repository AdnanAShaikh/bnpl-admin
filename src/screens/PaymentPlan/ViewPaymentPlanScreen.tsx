import { useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllPaymentPlans,
  selectPaymentPlan,
} from "../../store/slices/adminSlice";
import { usePermission } from "../../hooks/usePermission";

// ─── Read-only Field (mirrors ViewMerchantScreen) ─────────────────────────────
const ReadField = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-1 w-full">
    <div className="border border-gray-100 rounded-xl px-4 pt-2.5 pb-2 bg-gray-50">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <p className="text-sm text-gray-800 mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  Active:   "bg-teal-600",
  Inactive: "bg-gray-500",
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const ViewPaymentPlanScreen = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const paymentPlans  = useAppSelector(selectPaymentPlan);
  const paymentPlan   = paymentPlans.find((p) => p.id === Number(id));
  const canEdit   = usePermission("products.edit");

  useEffect(() => {
    if (paymentPlans.length === 0) dispatch(fetchAllPaymentPlans());
  }, [dispatch, paymentPlans.length]);

  if (paymentPlans.length > 0 && !paymentPlan) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Payment Plan not found.</p>
        </div>
      </Sidebar>
    );
  }

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
            <h1 className="text-xl font-bold text-[#1a2a4a]">View Payment Plan</h1>
            {paymentPlan && (
              <p className="text-xs text-gray-400 mt-0.5">
                {paymentPlan.planName} · #{paymentPlan.id}
              </p>
            )}
          </div>
        </div>

        {paymentPlan && (
          <span
            className={`inline-block text-xs font-bold px-3 py-1.5 rounded-lg text-white ${STATUS_STYLES[paymentPlan.status] ?? "bg-gray-400"}`}
          >
            {paymentPlan.status}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm font-bold text-[#1a2a4a] mb-5">Payment Plan Details</p>

          <div className="flex flex-col gap-4">

            {/* Row 1 — Plan Name + Status */}
            <div className="grid grid-cols-2 gap-4">
              <ReadField label="Plan Name" value={paymentPlan?.planName} />
              <ReadField label="Status"       value={paymentPlan?.status}      />
            </div>

            {/* Row 2 — Term Value + Term Type + Currency */}
            <div className="grid grid-cols-3 gap-4">
              <ReadField label="Term Value" value={paymentPlan ? String(paymentPlan.termValue) : null} />
              <ReadField label="Term Type"  value={paymentPlan?.termType}                          />
              <ReadField label="Currency"   value={paymentPlan?.currency}                          />
            </div>

            {/* Row 3 — Min Amount + Max Amount */}
            <div className="grid grid-cols-2 gap-4">
              <ReadField
                label="Minimum Amount"
                value={paymentPlan ? Number(paymentPlan.minimumAmount).toLocaleString("en-SA") : null}
              />
              <ReadField
                label="Maximum Amount"
                value={paymentPlan ? Number(paymentPlan.maximumAmount).toLocaleString("en-SA") : null}
              />
            </div>

            {/* Row 4 — Term Description */}
            <ReadField label="Term Description"   value={paymentPlan?.termDescription}   />

            {/* Row 5 — Arabic Description */}
            <ReadField label="Arabic Description" value={paymentPlan?.arabicDescription} />

            {/* Row 6 — Additional Notes */}
            <ReadField label="Additional Notes"   value={paymentPlan?.additionalNotes}   />

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-2.5 border-2 border-gray-300 text-gray-600 font-semibold text-sm rounded-xl hover:border-[#1a2a4a] hover:text-[#1a2a4a] transition-all duration-200"
          >
            Back
          </button>

          {
            canEdit ? 
              <button
                onClick={() => navigate(`/admin/payment-plan/edit/${id}`)}
                className="px-10 py-2.5 bg-[#1a2a4a] hover:bg-[#243a64] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md"
              >
                Edit Plan
              </button>
          : null
          }
     
        </div>
      </div>
    </Sidebar>
  );
};

export default ViewPaymentPlanScreen;