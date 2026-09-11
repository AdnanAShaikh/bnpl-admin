/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import {
  fetchMerchantById,
  type MerchantDetail,
  type MerchantProduct,
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
const ProfileTab = ({ merchant }: { merchant: any }) => (
  <div className="flex flex-col gap-4">
    <ReadField label="Full Name" value={merchant.user.name} />
    <ReadField label="Email Address" value={merchant.user.email} />
    <ReadField label="Role" value={merchant.user.role} />
    <div className="flex flex-col gap-1">
      <div className="border border-gray-100 rounded-xl px-4 pt-2.5 pb-2 bg-gray-50">
        <label className="text-xs text-gray-400 font-medium">
          Account Status
        </label>
        <div className="mt-1">
          <span
            className={`inline-block text-xs font-bold px-3 py-1 rounded-md text-white ${STATUS_STYLES[merchant.status] ?? "bg-gray-400"}`}
          >
            {merchant.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>
    </div>
    <ReadField
      label="Registered On"
      value={new Date(merchant.createdAt).toLocaleDateString("en-SA", {
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
    {/* Company Type */}
    <ReadField label="Company Type" value={company.companyType} />

    {/* Company Name + Presence */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Company Name" value={company.companyName} />
      <ReadField label="Company Presence" value={company.companyPresence} />
    </div>

    {/* E-Commerce URL */}
    {company.ecommerceUrl && (
      <ReadField label="E-Commerce Website URL" value={company.ecommerceUrl} />
    )}

    {/* Telephone + Registration */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField
        label="Corporate Telephone"
        value={company.corporateTelephone}
      />
      <ReadField
        label="Company Registration No."
        value={company.companyRegistrationNo}
      />
    </div>

    {/* Annual Turnover + Employees */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField
        label="Business Annual Turnover (SAR)"
        value={
          company.annualTurnover != null
            ? company.annualTurnover.toLocaleString("en-SA")
            : null
        }
      />
      <ReadField
        label="Number of Employees"
        value={
          company.numberOfEmployees != null
            ? String(company.numberOfEmployees)
            : null
        }
      />
    </div>

    {/* Operation License + Expiry */}
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

    {/* SAGIA */}
    <ReadField label="SAGIA Number" value={company.sagiaNumber} />
  </div>
);

// ─── Tab 3: Power of Attorney ─────────────────────────────────────────────────
const AttorneyTab = ({ attorney }: { attorney: any }) => (
  <div className="flex flex-col gap-4">
    {/* Title + First Name */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Title" value={attorney.title} />
      <ReadField label="First Name" value={attorney.firstName} />
    </div>

    {/* Last Name + Nationality */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Last Name" value={attorney.lastName} />
      <ReadField label="Nationality" value={attorney.nationality} />
    </div>

    {/* Mobile + Date of Birth */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Mobile Number" value={attorney.mobileNumber} />
      <ReadField
        label="Date of Birth"
        value={
          attorney.dateOfBirth
            ? new Date(attorney.dateOfBirth).toLocaleDateString("en-SA")
            : null
        }
      />
    </div>

    {/* Place of Birth */}
    <ReadField label="Place of Birth" value={attorney.placeOfBirth} />

    {/* Home Address */}
    <ReadField label="Home Address" value={attorney.homeAddress} />

    {/* City + District */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="City" value={attorney.city} />
      <ReadField label="District" value={attorney.district} />
    </div>

    {/* Postal Code + National ID */}
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

// ─── Tab 5: GNPL Config ───────────────────────────────────────────────────────
const GNPLTab = ({ gnplConfig }: { gnplConfig: any }) => {
  if (!gnplConfig) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-400">No GNPL configuration found.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <ReadField
        label="Email Address for Invoicing"
        value={gnplConfig.invoicingEmail}
      />
      <ReadField
        label="Mobile Number for Invoicing"
        value={gnplConfig.invoicingMobile}
      />
      <ReadField label="Pay-out Plan" value={gnplConfig.payoutPlan} />
    </div>
  );
};

const MerchantProductsTab = ({ products }: { products: MerchantProduct[] }) => {
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
              <p className="text-sm font-bold text-[#1a2a4a] truncate">
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
            <p className="text-sm font-semibold text-[#1a2a4a] mt-2">
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
const ViewMerchantScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(0);

  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await dispatch(fetchMerchantById(Number(id)));
      if (fetchMerchantById.fulfilled.match(result)) {
        setMerchant(result.payload.merchant);
      }
      setLoading(false);
    })();
  }, [dispatch, id]);

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
            <h1 className="text-xl font-bold text-[#1a2a4a]">
              {merchant.user.name || merchant.user.email}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {merchant.companyDetails.companyName} · #{merchant.id}
            </p>
          </div>
        </div>
        <span
          className={`inline-block text-xs font-bold px-3 py-1.5 rounded-lg text-white ${STATUS_STYLES[merchant.status] ?? "bg-gray-400"}`}
        >
          {merchant.status.replace(/_/g, " ")}
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
            <Tab label="GNPL Config" value={4} />
            <Tab label="Products" value={5} />
            <Tab label="Orders" value={6} />
          </Tabs>
        </div>

        {/* Content */}
        <div className="p-7">
          {activeTab === 0 && <ProfileTab merchant={merchant} />}
          {activeTab === 1 && <CompanyTab company={merchant.companyDetails} />}
          {activeTab === 2 && (
            <AttorneyTab attorney={merchant.powerOfAttorney} />
          )}
          {activeTab === 3 && <DocumentsTab documents={merchant.documents} />}
          {activeTab === 4 && <GNPLTab gnplConfig={merchant.gnplConfig} />}
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
export default ViewMerchantScreen;
