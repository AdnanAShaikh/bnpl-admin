/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import {
  fetchBuyerById,
  type BuyerDetail,
} from "../../store/slices/adminSlice";

const NAVY = "#1a2a4a";

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-teal-600",
  PENDING_APPROVAL: "bg-blue-500",
  DRAFT: "bg-amber-400 text-gray-800",
  REJECTED: "bg-red-500",
  SUSPENDED: "bg-gray-500",
};

// ─── Read-only Field ──────────────────────────────────────────────────────────
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
const ProfileTab = ({ buyer }: { buyer: any }) => (
  <div className="flex flex-col gap-4">
    <ReadField label="Full Name" value={buyer.user.name} />
    <ReadField label="Email Address" value={buyer.user.email} />
    <ReadField label="Role" value={buyer.user.role} />
    <div className="flex flex-col gap-1">
      <div className="border border-gray-100 rounded-xl px-4 pt-2.5 pb-2 bg-gray-50">
        <label className="text-xs text-gray-400 font-medium">
          Account Status
        </label>
        <div className="mt-1">
          <span
            className={`inline-block text-xs font-bold px-3 py-1 rounded-md text-white ${STATUS_STYLES[buyer.status] ?? "bg-gray-400"}`}
          >
            {buyer.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>
    </div>
    <ReadField
      label="Registered On"
      value={new Date(buyer.createdAt).toLocaleDateString("en-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    />
  </div>
);

// ─── Tab 2: Company Details ───────────────────────────────────────────────────
const CompanyTab = ({ company }: { company: any }) => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Company Name" value={company.companyName} />
      <ReadField
        label="Company Registration No."
        value={company.companyRegistrationNo}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <ReadField
        label="Corporate Telephone"
        value={company.corporateTelephone}
      />
      <ReadField label="Company Type" value={company.companyType} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <ReadField
        label="Operation License No."
        value={company.operationLicenseNo}
      />
      <ReadField
        label="Expiration Date"
        value={
          company.operationLicenseExpiry
            ? new Date(company.operationLicenseExpiry).toLocaleDateString(
                "en-SA",
              )
            : null
        }
      />
    </div>
    <ReadField label="SAGIA Number" value={company.sagiaNumber} />
  </div>
);

// ─── Tab 3: Power of Attorney ─────────────────────────────────────────────────
const AttorneyTab = ({ attorney }: { attorney: any }) => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Title" value={attorney.title} />
      <ReadField label="First Name" value={attorney.firstName} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Last Name" value={attorney.lastName} />
      <ReadField label="Mobile Number" value={attorney.mobileNumber} />
    </div>
    <ReadField label="Home Address" value={attorney.homeAddress} />
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="City" value={attorney.city} />
      <ReadField label="District" value={attorney.district} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Postal Code" value={attorney.postalCode} />
      <ReadField
        label="National Identity / Iqama No."
        value={attorney.nationalIdNumber}
      />
    </div>
  </div>
);

// ─── Tab 4: Documents ─────────────────────────────────────────────────────────
const DocumentsTab = ({ documents }: { documents: any[] }) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-400">No documents uploaded yet.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {documents.map((doc: any) => (
        <div
          key={doc.id}
          className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-400"
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
              <p className="text-sm font-medium text-gray-700">
                {doc.documentType.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-gray-400">{doc.fileName}</p>
            </div>
          </div>
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#1a2a4a] hover:underline"
          >
            View
          </a>
        </div>
      ))}
    </div>
  );
};

// ─── Tab 5: Payment Plans ─────────────────────────────────────────────────────
const PaymentPlansTab = ({ plans }: { plans: any[] }) => {
  if (!plans || plans.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-400">No payment plans assigned.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3">
      {plans.map((plan: any) => (
        <div
          key={plan.id}
          className="border-2 border-[#1a2a4a] bg-[#1a2a4a]/[0.03] rounded-xl px-4 py-3"
        >
          <p className="text-sm font-bold text-[#1a2a4a]">{plan.planName}</p>
          {plan.termValue != null && (
            <p className="text-xs text-gray-400 mt-0.5">
              {plan.termValue} × {plan.termType?.toLowerCase()}
              {plan.profitRate != null &&
                ` · ${(Number(plan.profitRate) * 100).toFixed(1)}% profit`}
            </p>
          )}
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
const ViewBuyerScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(0);

  const [buyer, setBuyer] = useState<BuyerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await dispatch(fetchBuyerById(Number(id)));
      if (fetchBuyerById.fulfilled.match(result)) {
        setBuyer(result.payload.buyer);
      }
      setLoading(false);
    })();
  }, [dispatch, id]);

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
            <h1 className="text-xl font-bold text-[#1a2a4a]">
              {buyer.user.name || buyer.user.email}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {buyer.companyDetails.companyName} · #{buyer.id}
            </p>
          </div>
        </div>
        <span
          className={`inline-block text-xs font-bold px-3 py-1.5 rounded-lg text-white ${STATUS_STYLES[buyer.status] ?? "bg-gray-400"}`}
        >
          {buyer.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Tabs */}
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

        {/* Content */}
        <div className="p-7">
          {activeTab === 0 && <ProfileTab buyer={buyer} />}
          {activeTab === 1 && <CompanyTab company={buyer.companyDetails} />}
          {activeTab === 2 && <AttorneyTab attorney={buyer.powerOfAttorney} />}
          {activeTab === 3 && <DocumentsTab documents={buyer.documents} />}
          {activeTab === 4 && (
            <PaymentPlansTab plans={buyer.eligiblePlans ?? []} />
          )}
          {activeTab === 5 && <BuyerOrdersTab orders={buyer.orders ?? []} />}
        </div>
      </div>
    </Sidebar>
  );
};

export default ViewBuyerScreen;
