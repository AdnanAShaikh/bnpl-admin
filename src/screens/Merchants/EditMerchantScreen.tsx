/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { Input } from "../../components/Input";
import { SelectField } from "../../components/SelectField";
import { FileInput } from "../../components/FileInput";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import {
  deleteDocument,
  fetchAllMerchants,
  fetchMerchantById,
  updateMerchant,
  type MerchantDetail,
} from "../../store/slices/adminSlice";
import { toast } from "react-toastify";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";

// ─── Constants ────────────────────────────────────────────────────────────────
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

const COMPANY_PRESENCE = [
  { value: "ONLINE", label: "Online" },
  { value: "PHYSICAL", label: "Physical" },
  { value: "BOTH", label: "Both" },
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

const COUNTRIES = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Kuwait",
  "Bahrain",
  "Qatar",
  "Oman",
  "Egypt",
  "Jordan",
  "Lebanon",
  "Iraq",
  "Yemen",
  "India",
  "Pakistan",
  "Bangladesh",
  "Philippines",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Turkey",
  "Malaysia",
  "Indonesia",
  "Other",
];

const COUNTRY_CODES = [
  { code: "+966", country: "SA" },
  { code: "+971", country: "AE" },
  { code: "+965", country: "KW" },
  { code: "+973", country: "BH" },
  { code: "+974", country: "QA" },
  { code: "+968", country: "OM" },
  { code: "+20", country: "EG" },
  { code: "+962", country: "JO" },
  { code: "+91", country: "IN" },
  { code: "+92", country: "PK" },
  { code: "+44", country: "UK" },
  { code: "+1", country: "US" },
];

const PAYOUT_PLANS = [
  { value: "WEEKLY", label: "Pay Weekly" },
  { value: "MONTHLY", label: "Pay Monthly" },
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
const ProfileTab = ({ merchant, status, onStatusChange }: any) => (
  <div className="flex flex-col gap-4">
    <ReadField label="Full Name" value={merchant.user.name} />
    <ReadField label="Email Address" value={merchant.user.email} />
    <SelectField
      label="Merchant Status"
      name="status"
      required
      value={status}
      onChange={onStatusChange}
      options={STATUSES}
    />
  </div>
);

// ─── Tab 2: Company Details ───────────────────────────────────────────────────
const CompanyDetails = ({ data, onChange }: any) => (
  <div className="flex flex-col gap-4">
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
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Company Name"
        name="companyName"
        value={data.companyName}
        onChange={(v: any) => onChange("companyName", v)}
      />
      <SelectField
        label="Company Presence"
        name="companyPresence"
        value={data.companyPresence}
        onChange={(v: any) => onChange("companyPresence", v)}
        options={COMPANY_PRESENCE}
      />
    </div>
    {(data.companyPresence === "ONLINE" || data.companyPresence === "BOTH") && (
      <Input
        label="E-Commerce Website URL"
        name="ecommerceUrl"
        type="url"
        value={data.ecommerceUrl || ""}
        onChange={(v: any) => onChange("ecommerceUrl", v)}
      />
    )}
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Corporate Telephone Number"
        name="corporateTelephone"
        type="tel"
        value={data.corporateTelephone}
        onChange={(v: any) => onChange("corporateTelephone", v)}
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
        label="Business Annual Turnover (SAR)"
        name="annualTurnover"
        type="number"
        value={data.annualTurnover}
        onChange={(v: any) => onChange("annualTurnover", v)}
      />
      <Input
        label="Number of Employees"
        name="numberOfEmployees"
        type="number"
        value={data.numberOfEmployees}
        onChange={(v: any) => onChange("numberOfEmployees", v)}
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
      <SelectField
        label="Nationality"
        name="nationality"
        value={data.nationality || ""}
        onChange={(v: any) => onChange("nationality", v)}
        options={COUNTRIES.map((c) => ({ value: c, label: c }))}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Mobile Number"
        name="mobileNumber"
        type="tel"
        value={data.mobileNumber}
        onChange={(v: any) => onChange("mobileNumber", v)}
      />
      <Input
        label="Date of Birth"
        name="dateOfBirth"
        type="date"
        value={data.dateOfBirth || ""}
        onChange={(v: any) => onChange("dateOfBirth", v)}
      />
    </div>
    <SelectField
      label="Place of Birth"
      name="placeOfBirth"
      value={data.placeOfBirth || ""}
      onChange={(v: any) => onChange("placeOfBirth", v)}
      options={COUNTRIES.map((c) => ({ value: c, label: c }))}
    />
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

// ─── Tab 4: GNPL Config ───────────────────────────────────────────────────────
const GNPLConfig = ({ data, onChange }: any) => (
  <div className="flex flex-col gap-4">
    <Input
      label="Email Address for Invoicing of Fee"
      name="invoicingEmail"
      type="email"
      value={data.invoicingEmail}
      onChange={(v: any) => onChange("invoicingEmail", v)}
    />
    <div className="border border-gray-200 rounded-xl px-4 pt-2.5 pb-2 focus-within:border-[#1a2a4a] transition-all">
      <label className="text-xs text-gray-500 font-medium block mb-1">
        Mobile Number for Invoicing
      </label>
      <div className="flex items-center gap-2">
        <FormControl size="small">
          <Select
            value={data.invoicingCountryCode || "+966"}
            onChange={(e) => onChange("invoicingCountryCode", e.target.value)}
            sx={{
              fontFamily: "inherit",
              fontSize: "14px",
              color: "#1f2937",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiSelect-select": {
                padding: "0",
                paddingRight: "24px !important",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
          >
            {COUNTRY_CODES.map((c) => (
              <MenuItem
                key={c.code}
                value={c.code}
                sx={{ fontFamily: "inherit", fontSize: "13px" }}
              >
                {c.country} {c.code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
        <input
          type="tel"
          placeholder="5XXXXXXXX"
          value={data.invoicingMobile || ""}
          onChange={(e) => onChange("invoicingMobile", e.target.value)}
          className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-300 bg-transparent"
        />
      </div>
    </div>
    <SelectField
      label="Pay-out Plan"
      name="payoutPlan"
      value={data.payoutPlan}
      onChange={(v: any) => onChange("payoutPlan", v)}
      options={PAYOUT_PLANS}
    />
  </div>
);

// ─── Tab 5: Documents ─────────────────────────────────────────────────────────
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
      await onChanged(); // ← parent's load(), refreshes local merchant
    } else {
      await dispatch(fetchAllMerchants()); // fallback for any list-based screen
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(deleteDocument(deleteTarget.id)).unwrap();
      await refresh(); // ← was fetchAllMerchants(), now goes through refresh
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
    {
      label: "Power of Attorney Representative ID",
      hint: "Copy of valid ID of the person in charge.",
      documentType: "poa_representative_id",
    },
    {
      label: "Bank Issued and Certified IBAN Letter",
      hint: "Please provide certified bank letter.",
      documentType: "iban_letter",
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
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#1a2a4a] hover:underline px-2"
                >
                  View
                </a>

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
          entityType="merchant"
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

const MerchantProductsTab = ({ products }: { products: any[] }) => {
  if (!products.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-gray-400">
          This merchant has no products yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p) => (
        <div
          key={p.id}
          className="flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="aspect-[4/3] bg-gray-50 overflow-hidden flex items-center justify-center">
            {p.images?.[0] ? (
              <img
                src={p.images[0]}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-10 h-10 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z"
                />
              </svg>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-primary truncate">
                {p.name}
              </p>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${
                  p.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : p.status === "Draft"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                {p.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
            <p className="text-sm font-semibold text-primary mt-2">
              {p.currency}{" "}
              {Number(p.price).toLocaleString("en-SA", {
                minimumFractionDigits: 2,
              })}
            </p>
            {!p.inStock && (
              <p className="text-xs text-red-500 mt-1">Out of stock</p>
            )}
          </div>
        </div>
      ))}
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

const MerchantOrdersTab = ({ orders }: { orders: any[] }) => {
  const navigate = useNavigate();

  if (!orders.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-gray-400">
          No orders placed with this merchant yet.
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
            <th className="py-3 pr-4 font-medium">Buyer</th>
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
                {o.buyer?.companyDetails?.companyName ?? "—"}
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
const EditMerchantScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState(0);

  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // const merchant = merchants.find((m) => m.id === Number(id));

  const [status, setStatus] = useState("");
  const [companyData, setCompanyData] = useState({
    companyType: "",
    companyName: "",
    companyPresence: "",
    ecommerceUrl: "",
    corporateTelephone: "",
    companyRegistrationNo: "",
    annualTurnover: "",
    numberOfEmployees: "",
    operationLicenseNo: "",
    operationLicenseExpiry: "",
    sagiaNumber: "",
  });
  const [attorneyData, setAttorneyData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    nationality: "",
    mobileNumber: "",
    dateOfBirth: "",
    placeOfBirth: "",
    homeAddress: "",
    city: "",
    district: "",
    postalCode: "",
    nationalIdNumber: "",
  });

  // Split invoicing mobile into country code + number for the UI
  const splitMobile = (full: string) => {
    const match = COUNTRY_CODES.find((c) => full.startsWith(c.code));
    return match
      ? { code: match.code, number: full.slice(match.code.length) }
      : { code: "+966", number: full };
  };

  const [gnplData, setGnplData] = useState({
    invoicingEmail: "",
    invoicingCountryCode: "+966",
    invoicingMobile: "",
    payoutPlan: "",
  });

  // Re-sync when merchant loads from store (e.g. after redirect from create)
  const load = async () => {
    setLoading(true);
    const result = await dispatch(fetchMerchantById(Number(id)));
    if (fetchMerchantById.fulfilled.match(result)) {
      const m = result.payload.merchant;
      setMerchant(m);
      setStatus(m.status);
      setCompanyData({
        companyType: m.companyDetails.companyType ?? "",
        companyName: m.companyDetails.companyName ?? "",
        companyPresence: m.companyDetails.companyPresence ?? "",
        ecommerceUrl: m.companyDetails.ecommerceUrl ?? "",
        corporateTelephone: m.companyDetails.corporateTelephone ?? "",
        companyRegistrationNo: m.companyDetails.companyRegistrationNo ?? "",
        annualTurnover: m.companyDetails.annualTurnover?.toString() ?? "",
        numberOfEmployees: m.companyDetails.numberOfEmployees?.toString() ?? "",
        operationLicenseNo: m.companyDetails.operationLicenseNo ?? "",
        operationLicenseExpiry: m.companyDetails.operationLicenseExpiry
          ? new Date(m.companyDetails.operationLicenseExpiry)
              .toISOString()
              .split("T")[0]
          : "",
        sagiaNumber: m.companyDetails.sagiaNumber ?? "",
      });
      setAttorneyData({
        title: m.powerOfAttorney.title ?? "",
        firstName: m.powerOfAttorney.firstName ?? "",
        lastName: m.powerOfAttorney.lastName ?? "",
        nationality: m.powerOfAttorney.nationality ?? "",
        mobileNumber: m.powerOfAttorney.mobileNumber ?? "",
        dateOfBirth: m.powerOfAttorney.dateOfBirth
          ? new Date(m.powerOfAttorney.dateOfBirth).toISOString().split("T")[0]
          : "",
        placeOfBirth: m.powerOfAttorney.placeOfBirth ?? "",
        homeAddress: m.powerOfAttorney.homeAddress ?? "",
        city: m.powerOfAttorney.city ?? "",
        district: m.powerOfAttorney.district ?? "",
        postalCode: m.powerOfAttorney.postalCode ?? "",
        nationalIdNumber: m.powerOfAttorney.nationalIdNumber ?? "",
      });
      const s = splitMobile(m.gnplConfig?.invoicingMobile || "");
      setGnplData({
        invoicingEmail: m.gnplConfig?.invoicingEmail ?? "",
        invoicingCountryCode: s.code,
        invoicingMobile: s.number,
        payoutPlan: m.gnplConfig?.payoutPlan ?? "",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id]);

  const patchCompany = (k: string, v: string) =>
    setCompanyData((p) => ({ ...p, [k]: v }));
  const patchAttorney = (k: string, v: string) =>
    setAttorneyData((p) => ({ ...p, [k]: v }));
  const patchGnpl = (k: string, v: string) =>
    setGnplData((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const result = await dispatch(
      updateMerchant({
        id: Number(id),
        status,
        companyData: {
          companyType: companyData.companyType,
          companyName: companyData.companyName,
          companyPresence: companyData.companyPresence,
          ecommerceUrl: companyData.ecommerceUrl || undefined,
          corporateTelephone: companyData.corporateTelephone,
          companyRegistrationNo: companyData.companyRegistrationNo,
          annualTurnover: companyData.annualTurnover
            ? Number(companyData.annualTurnover)
            : undefined,
          numberOfEmployees: companyData.numberOfEmployees
            ? Number(companyData.numberOfEmployees)
            : undefined,
          operationLicenseNo: companyData.operationLicenseNo || undefined,
          operationLicenseExpiry:
            companyData.operationLicenseExpiry || undefined,
          sagiaNumber: companyData.sagiaNumber || undefined,
        },
        attorneyData: {
          title: attorneyData.title,
          firstName: attorneyData.firstName,
          lastName: attorneyData.lastName,
          nationality: attorneyData.nationality,
          mobileNumber: attorneyData.mobileNumber,
          dateOfBirth: attorneyData.dateOfBirth || "",
          placeOfBirth: attorneyData.placeOfBirth,
          homeAddress: attorneyData.homeAddress,
          city: attorneyData.city,
          district: attorneyData.district,
          postalCode: attorneyData.postalCode,
          nationalIdNumber: attorneyData.nationalIdNumber,
        },
        gnplData: {
          invoicingEmail: gnplData.invoicingEmail,
          invoicingMobile: `${gnplData.invoicingCountryCode}${gnplData.invoicingMobile}`,
          payoutPlan: gnplData.payoutPlan,
        },
      }),
    );

    if (updateMerchant.fulfilled.match(result)) {
      toast.success("Merchant updated successfully!");
      await load();
    } else {
      toast.error("Failed to update merchant. Please try again.");
    }
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Loading merchant...</p>
        </div>
      </Sidebar>
    );
  }

  if (!merchant) {
    return (
      <Sidebar>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-gray-400 text-sm">Merchant not found.</p>
          <button
            onClick={() => navigate("/admin/merchant/all")}
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
            onClick={() => navigate("/admin/merchant/all")}
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
            <h1 className="text-xl font-bold text-[#1a2a4a]">Edit Merchant</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {merchant.companyDetails.companyName || merchant.user.name} · #
              {merchant.id}
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
            <Tab label="GNPL Config" value={3} />
            <Tab label="Documents" value={4} />
            <Tab label="Products" value={5} />
            <Tab label="Orders" value={6} />
          </Tabs>
        </div>

        <div className="p-7">
          {activeTab === 0 && (
            <ProfileTab
              merchant={merchant}
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
            <GNPLConfig data={gnplData} onChange={patchGnpl} />
          )}
          {activeTab === 4 && (
            <DocumentsTab
              documents={merchant.documents}
              entityId={merchant.id}
              onChanged={load}
            />
          )}
          {activeTab === 5 && (
            <MerchantProductsTab products={merchant.products ?? []} />
          )}
          {activeTab === 6 && (
            <MerchantOrdersTab orders={merchant.orders ?? []} />
          )}
        </div>
      </div>
    </Sidebar>
  );
};

export default EditMerchantScreen;
