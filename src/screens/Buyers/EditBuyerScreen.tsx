/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Input } from "../../components/Input";
import { SelectField } from "../../components/SelectField";
import { FileInput } from "../../components/FileInput";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  deleteDocument,
  fetchAllBuyers,
  fetchBuyerById,
  updateBuyer,
  type BuyerDetail,
} from "../../store/slices/adminSlice";
import { toast } from "react-toastify";
import {
  fetchAllPaymentPlans,
  selectPaymentPlan,
} from "../../store/slices/adminSlice";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

const NAVY = "#1a2a4a";

const COMPANY_TYPES = [
  {
    value: "SINGLE_SHAREHOLDER",
    en: "Single Shareholder Company",
    ar: "شركة الشخص الواحد",
  },
  {
    value: "SIMPLIFIED_JOINT_STOCK",
    en: "Simplified Joint Stock Company",
    ar: "شركة المساهمة المبسطة",
  },
  { value: "JOINT_STOCK", en: "Joint Stock Company", ar: "شركة المساهمة" },
  {
    value: "LIMITED_LIABILITY",
    en: "Limited Liability Company",
    ar: "الشركة ذات المسؤولية المحدودة",
  },
  {
    value: "LIMITED_PARTNERSHIP",
    en: "Limited Partnership",
    ar: "شركة التوصية البسيطة",
  },
  { value: "PROFESSIONAL", en: "Professional Company", ar: "شركة مهنية" },
  { value: "FOREIGN", en: "Foreign Company", ar: "شركة أجنبية" },
  {
    value: "GENERAL_PARTNERSHIP",
    en: "General Partnership",
    ar: "شركة التضامن",
  },
];

const TITLES = [
  { value: "MR", label: "Mr" },
  { value: "MS", label: "Ms" },
  { value: "MRS", label: "Mrs" },
  { value: "DR", label: "Dr" },
  { value: "PROF", label: "Prof" },
];

const STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
];

// ─── Read-only field ──────────────────────────────────────────────────────────
const ReadField = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="flex flex-col gap-1 w-full">
    <div className="border border-gray-100 rounded-xl px-4 pt-2.5 pb-2 bg-gray-50">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <p className="text-sm text-gray-800 mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

// ─── Tab 1: Profile ───────────────────────────────────────────────────────────
const ProfileTab = ({ buyer, status, onStatusChange }: any) => (
  <div className="flex flex-col gap-4">
    <ReadField label="Full Name" value={buyer.user.name} />
    <ReadField label="Email Address" value={buyer.user.email} />
    <SelectField
      label="Buyer Status"
      name="status"
      value={status}
      onChange={onStatusChange}
      options={STATUSES}
    />
  </div>
);

// ─── Tab 2: Company Details ───────────────────────────────────────────────────
const CompanyDetails = ({ data, onChange }: any) => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Company Name"
        name="companyName"
        value={data.companyName}
        onChange={(v: any) => onChange("companyName", v)}
      />
      <Input
        label="Company Registration Number"
        name="companyRegistrationNo"
        value={data.companyRegistrationNo}
        onChange={(v: any) => onChange("companyRegistrationNo", v)}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Corporate Telephone Number"
        name="corporateTelephone"
        type="tel"
        value={data.corporateTelephone}
        onChange={(v: any) => onChange("corporateTelephone", v)}
      />
      <SelectField
        label="Company Type"
        name="companyType"
        value={data.companyType}
        onChange={(v: any) => onChange("companyType", v)}
        options={COMPANY_TYPES.map((c) => ({
          value: c.value,
          label: `${c.en} — ${c.ar}`,
        }))}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Operation License Number"
        name="operationLicenseNo"
        value={data.operationLicenseNo || ""}
        onChange={(v: any) => onChange("operationLicenseNo", v)}
      />
      <Input
        label="Expiration Date"
        name="operationLicenseExpiry"
        type="date"
        value={data.operationLicenseExpiry || ""}
        onChange={(v: any) => onChange("operationLicenseExpiry", v)}
      />
    </div>
    <Input
      label="SAGIA Number"
      name="sagiaNumber"
      value={data.sagiaNumber || ""}
      onChange={(v: any) => onChange("sagiaNumber", v)}
    />
  </div>
);

// ─── Tab 3: Power of Attorney ─────────────────────────────────────────────────
const PowerOfAttorney = ({ data, onChange }: any) => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 gap-4">
      <SelectField
        label="Title"
        name="title"
        value={data.title}
        onChange={(v: any) => onChange("title", v)}
        options={TITLES}
      />
      <Input
        label="First Name"
        name="firstName"
        value={data.firstName}
        onChange={(v: any) => onChange("firstName", v)}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Last Name"
        name="lastName"
        value={data.lastName}
        onChange={(v: any) => onChange("lastName", v)}
      />
      <Input
        label="Mobile Number"
        name="mobileNumber"
        type="tel"
        value={data.mobileNumber}
        onChange={(v: any) => onChange("mobileNumber", v)}
      />
    </div>
    <Input
      label="Home Address"
      name="homeAddress"
      value={data.homeAddress}
      onChange={(v: any) => onChange("homeAddress", v)}
    />
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="City"
        name="city"
        value={data.city}
        onChange={(v: any) => onChange("city", v)}
      />
      <Input
        label="District"
        name="district"
        value={data.district}
        onChange={(v: any) => onChange("district", v)}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Postal Code"
        name="postalCode"
        value={data.postalCode}
        onChange={(v: any) => onChange("postalCode", v)}
      />
      <Input
        label="National Identity Number / Iqama Number"
        name="nationalIdNumber"
        value={data.nationalIdNumber}
        onChange={(v: any) => onChange("nationalIdNumber", v)}
      />
    </div>
  </div>
);

// ─── Tab 4: Documents ─────────────────────────────────────────────────────────
const DocumentsTab = ({
  documents,
  entityId,
  onChanged,
}: {
  documents: any[];
  entityId: number;
  onChanged?: () => void | Promise<void>;
}) => {
  const dispatch = useAppDispatch();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = async () => {
    if (onChanged) {
      await onChanged(); // ← parent's load(), refreshes local buyer
    } else {
      await dispatch(fetchAllBuyers()); // fallback for screens still on the list
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(deleteDocument(deleteTarget.id)).unwrap();
      await refresh();
      toast.success("Document deleted successfully");
    } catch (err: any) {
      toast.error(err || "Failed to delete document");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const uploadedTypes = new Set((documents ?? []).map((d) => d.documentType));

  const DOC_FIELDS = [
    {
      label: "Valid Commercial Registration",
      hint: "An official copy of the Commercial Register for commercial activity and type of company.",
      documentType: "commercial_registration",
    },
    { label: "Business Trade License", documentType: "trade_license" },
    {
      label: "Audited Financial Accounts",
      hint: "Period of last year.",
      documentType: "audited_financial_accounts",
    },
    {
      label: "VAT Returns",
      hint: "Period of last 4 quarters.",
      documentType: "vat_returns",
    },
    {
      label: "Bank Statements",
      hint: "Period of last 6 months.",
      documentType: "bank_statements",
    },
    { label: "Power of Attorney Document", documentType: "power_of_attorney" },
    {
      label: "VAT Registration Certificate",
      documentType: "vat_registration_certificate",
    },
  ];

  const pendingFields = DOC_FIELDS.filter(
    (f) => !uploadedTypes.has(f.documentType),
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-gray-500 leading-relaxed">
        Uploaded documents are shown below. You can upload new versions if
        needed.
      </p>

      {documents && documents.length > 0 && (
        <div className="flex flex-col gap-3 mb-2">
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-700 capitalize">
                    {doc.documentType.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-400">{doc.fileName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* View */}
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#1a2a4a] hover:underline px-2"
                >
                  View
                </a>

                {/* Download */}
                {/* <button
                  onClick={() => downloadFile(doc.fileUrl, doc.fileName)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#1a2a4a] hover:bg-gray-100 transition-colors"
                  title="Download"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button> */}

                {/* Delete → opens confirm */}
                <button
                  onClick={() =>
                    setDeleteTarget({ id: doc.id, name: doc.fileName })
                  }
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingFields.map((f) => (
        <FileInput
          key={f.documentType}
          label={f.label}
          hint={f.hint}
          required
          documentType={f.documentType}
          entityType="buyer"
          entityId={entityId}
          onUploaded={refresh}
        />
      ))}

      {pendingFields.length === 0 && (
        <p className="text-sm text-green-600 font-medium">
          All required documents uploaded.
        </p>
      )}

      {/* Delete confirmation modal */}
      <Dialog
        open={deleteTarget !== null}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(4px)",
            },
          },
          paper: {
            sx: {
              borderRadius: "20px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
              padding: "8px",
            },
          },
        }}
      >
        <DialogContent sx={{ p: "32px 36px 28px" }}>
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-red-50">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#1a2a4a] text-center mb-1">
            Delete document?
          </h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            <span className="font-medium text-gray-600">
              {deleteTarget?.name}
            </span>{" "}
            will be permanently removed. This can't be undone.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Tab 5: Payment Plans ─────────────────────────────────────────────────────
const PaymentPlansTab = ({
  buyerId,
  allPlans,
  assignedPlans, // server truth: buyer.eligiblePlans (full plan objects or {id, planName}[])
}: {
  buyerId: number;
  allPlans: any[];
  assignedPlans: any[];
}) => {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [draftIds, setDraftIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const assignedIds = assignedPlans.map((p) => p.id);

  // Open modal: seed draft from current server truth
  const openModal = () => {
    setDraftIds(assignedIds);
    setModalOpen(true);
  };

  const toggleDraft = (planId: number) =>
    setDraftIds((prev) =>
      prev.includes(planId)
        ? prev.filter((x) => x !== planId)
        : [...prev, planId],
    );

  const handleSavePlans = async () => {
    setSaving(true);
    const result = await dispatch(
      updateBuyer({ id: buyerId, eligiblePlanIds: draftIds }),
    );
    setSaving(false);

    if (updateBuyer.fulfilled.match(result)) {
      // re-fetch so grid reflects DB truth (slice already updates the buyer,
      // but this guarantees eligiblePlans is fresh)
      await dispatch(fetchAllBuyers());
      toast.success("Payment plans updated!");
    } else {
      toast.error("Failed to update plans. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
          Payment plans this buyer is eligible to use when requesting financing.
        </p>
        <button
          onClick={openModal}
          className="flex-shrink-0 px-5 py-2 border-2 border-[#1a2a4a] text-[#1a2a4a] font-semibold text-sm rounded-xl hover:bg-[#1a2a4a] hover:text-white transition-all duration-200"
        >
          + Manage Plans
        </button>
      </div>

      {/* Assigned plans grid — server truth */}
      {assignedPlans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-400">No plans assigned yet.</p>
          <p className="text-xs text-gray-300 mt-1">
            Click "Manage Plans" to add some.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {assignedPlans.map((plan) => {
            // assignedPlans may be {id, planName} only — enrich from allPlans if available
            const full = allPlans.find((p) => p.id === plan.id) ?? plan;
            return (
              <div
                key={plan.id}
                className="border-2 border-[#1a2a4a] bg-[#1a2a4a]/[0.03] rounded-xl px-4 py-3"
              >
                <p className="text-sm font-bold text-[#1a2a4a]">
                  {full.planName}
                </p>
                {full.termValue && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {full.termValue} × {full.termType?.toLowerCase()} ·{" "}
                    {(Number(full.profitRate) * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !saving && setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#1a2a4a]">
                Manage Payment Plans
              </h3>
              <button
                onClick={() => !saving && setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
                disabled={saving}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {allPlans.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  No payment plans available.
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {allPlans.map((plan) => {
                    const checked = draftIds.includes(plan.id);
                    return (
                      <label
                        key={plan.id}
                        className={`flex items-center justify-between border-2 rounded-xl px-4 py-3 cursor-pointer transition-all
                          ${checked ? "border-[#1a2a4a] bg-[#1a2a4a]/[0.03]" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div>
                          <p className="text-sm font-bold text-[#1a2a4a]">
                            {plan.planName}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {plan.termValue} × {plan.termType?.toLowerCase()} ·{" "}
                            {(Number(plan.profitRate) * 100).toFixed(1)}% profit
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDraft(plan.id)}
                          className="w-5 h-5 accent-[#1a2a4a] cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="px-6 py-2 border-2 border-gray-300 text-gray-600 font-semibold text-sm rounded-xl hover:border-[#1a2a4a] hover:text-[#1a2a4a] transition-all disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlans}
                disabled={saving}
                className="px-8 py-2 bg-[#1a2a4a] hover:bg-[#243a64] text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Plans"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ORDER_STATUS_CLS: Record<string, string> = {
  PENDING_REVIEW: "bg-amber-400 text-gray-800",
  UNDER_REVIEW: "bg-blue-500 text-white",
  APPROVED: "bg-teal-600 text-white",
  ACTIVE: "bg-emerald-600 text-white",
  COMPLETED: "bg-[#1a2a4a] text-white",
  REJECTED: "bg-red-500 text-white",
  CANCELLED: "bg-gray-500 text-white",
  DEFAULTED: "bg-red-700 text-white",
};

const money = (v: string | number, cur = "SAR") =>
  `${cur} ${Number(v).toLocaleString("en-SA", { minimumFractionDigits: 2 })}`;

const BuyerOrdersTab = ({ orders }: { orders: any[] }) => {
  const navigate = useNavigate();

  if (!orders.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-gray-400">
          This buyer hasn't placed any orders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="py-3 pr-4 font-medium">Order #</th>
            <th className="py-3 pr-4 font-medium">Product</th>
            <th className="py-3 pr-4 font-medium">Merchant</th>
            <th className="py-3 pr-4 font-medium">Qty</th>
            <th className="py-3 pr-4 font-medium">Total</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 pr-4 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              onClick={() => navigate(`/admin/orders/${o.id}`)}
              className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="py-3 pr-4 font-semibold text-[#1a2a4a]">
                #{o.id}
              </td>
              <td className="py-3 pr-4 text-gray-700">
                {o.product?.name ?? "—"}
              </td>
              <td className="py-3 pr-4 text-gray-700">
                {o.merchant?.companyDetails?.companyName ?? "—"}
              </td>
              <td className="py-3 pr-4 text-gray-700">{o.quantity}</td>
              <td className="py-3 pr-4 text-gray-700">
                {money(o.totalAmount, o.currency)}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`inline-block text-xs font-bold px-2.5 py-1 rounded-md ${ORDER_STATUS_CLS[o.status] ?? "bg-gray-400 text-white"}`}
                >
                  {o.status.replace(/_/g, " ")}
                </span>
              </td>
              <td className="py-3 pr-4 text-gray-500">
                {new Date(o.createdAt).toLocaleDateString("en-SA", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
// ─── Main Screen ──────────────────────────────────────────────────────────────
const EditBuyerScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState(0);
  const [buyer, setBuyer] = useState<BuyerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const allPlans = useAppSelector(selectPaymentPlan);

  const [status, setStatus] = useState("");
  const [companyData, setCompanyData] = useState({
    companyName: "",
    companyRegistrationNo: "",
    corporateTelephone: "",
    companyType: "",
    operationLicenseNo: "",
    operationLicenseExpiry: "",
    sagiaNumber: "",
  });
  const [attorneyData, setAttorneyData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    homeAddress: "",
    city: "",
    district: "",
    postalCode: "",
    nationalIdNumber: "",
  });

  // fetch buyer + seed form
  const load = async () => {
    setLoading(true);
    const result = await dispatch(fetchBuyerById(Number(id)));
    if (fetchBuyerById.fulfilled.match(result)) {
      const b = result.payload.buyer;
      setBuyer(b);
      setStatus(b.status);
      setCompanyData({
        companyName: b.companyDetails.companyName ?? "",
        companyRegistrationNo: b.companyDetails.companyRegistrationNo ?? "",
        corporateTelephone: b.companyDetails.corporateTelephone ?? "",
        companyType: b.companyDetails.companyType ?? "",
        operationLicenseNo: b.companyDetails.operationLicenseNo ?? "",
        operationLicenseExpiry: b.companyDetails.operationLicenseExpiry
          ? new Date(b.companyDetails.operationLicenseExpiry)
              .toISOString()
              .split("T")[0]
          : "",
        sagiaNumber: b.companyDetails.sagiaNumber ?? "",
      });
      setAttorneyData({
        title: b.powerOfAttorney.title ?? "",
        firstName: b.powerOfAttorney.firstName ?? "",
        lastName: b.powerOfAttorney.lastName ?? "",
        mobileNumber: b.powerOfAttorney.mobileNumber ?? "",
        homeAddress: b.powerOfAttorney.homeAddress ?? "",
        city: b.powerOfAttorney.city ?? "",
        district: b.powerOfAttorney.district ?? "",
        postalCode: b.powerOfAttorney.postalCode ?? "",
        nationalIdNumber: b.powerOfAttorney.nationalIdNumber ?? "",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id]);

  useEffect(() => {
    if (allPlans.length === 0) dispatch(fetchAllPaymentPlans());
  }, [dispatch, allPlans.length]);

  const patchCompany = (k: string, v: string) =>
    setCompanyData((p) => ({ ...p, [k]: v }));
  const patchAttorney = (k: string, v: string) =>
    setAttorneyData((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const result = await dispatch(
      updateBuyer({
        id: Number(id),
        status,
        companyData: {
          companyName: companyData.companyName,
          companyRegistrationNo: companyData.companyRegistrationNo,
          corporateTelephone: companyData.corporateTelephone,
          companyType: companyData.companyType,
          operationLicenseNo: companyData.operationLicenseNo || undefined,
          operationLicenseExpiry:
            companyData.operationLicenseExpiry || undefined,
          sagiaNumber: companyData.sagiaNumber || undefined,
        },
        attorneyData: {
          title: attorneyData.title,
          firstName: attorneyData.firstName,
          lastName: attorneyData.lastName,
          mobileNumber: attorneyData.mobileNumber,
          homeAddress: attorneyData.homeAddress,
          city: attorneyData.city,
          district: attorneyData.district,
          postalCode: attorneyData.postalCode,
          nationalIdNumber: attorneyData.nationalIdNumber,
        },
      }),
    );

    if (updateBuyer.fulfilled.match(result)) {
      toast.success("Buyer updated successfully!");
      await load(); // refresh this buyer
    } else {
      toast.error("Failed to update buyer. Please try again.");
    }
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Loading buyer...</p>
        </div>
      </Sidebar>
    );
  }

  if (!buyer) {
    return (
      <Sidebar>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-gray-400 text-sm">Buyer not found.</p>
          <button
            onClick={() => navigate("/admin/buyer/all")}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#1a2a4a] text-white"
          >
            Back
          </button>
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
            onClick={() => navigate("/admin/buyer/all")}
            className="text-gray-400 hover:text-[#1a2a4a] transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1a2a4a]">Edit Buyer</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {buyer.companyDetails.companyName || buyer.user.name} · #
              {buyer.id}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="px-8 py-2.5 bg-[#1a2a4a] hover:bg-[#243a64] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md"
        >
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-2">
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            slotProps={{
              indicator: {
                style: { background: NAVY, height: 3, borderRadius: 2 },
              },
            }}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontFamily: "inherit",
                fontSize: "14px",
                fontWeight: 500,
                color: "#6B7280",
                minHeight: 52,
                padding: "0 20px",
              },
              "& .Mui-selected": {
                color: `${NAVY} !important`,
                fontWeight: 600,
              },
            }}
          >
            <Tab label="Profile" value={0} />
            <Tab label="Company Details" value={1} />
            <Tab label="Power of Attorney" value={2} />
            <Tab label="Documents" value={3} />
            <Tab label="Payment Plans" value={4} />
            <Tab label="Orders" value={5} />
          </Tabs>
        </div>

        <div className="p-7">
          {activeTab === 0 && (
            <ProfileTab
              buyer={buyer}
              status={status}
              onStatusChange={setStatus}
            />
          )}
          {activeTab === 1 && (
            <CompanyDetails data={companyData} onChange={patchCompany} />
          )}
          {activeTab === 2 && (
            <PowerOfAttorney data={attorneyData} onChange={patchAttorney} />
          )}
          {activeTab === 3 && (
            <DocumentsTab
              documents={buyer.documents}
              entityId={buyer.id}
              onChanged={load}
            />
          )}
          {activeTab === 4 && (
            <PaymentPlansTab
              buyerId={buyer.id}
              allPlans={allPlans}
              assignedPlans={buyer.eligiblePlans ?? []}
            />
          )}
          {activeTab === 5 && <BuyerOrdersTab orders={buyer.orders ?? []} />}
        </div>
      </div>
    </Sidebar>
  );
};

export default EditBuyerScreen;
