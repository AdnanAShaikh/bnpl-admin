/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAllMerchants, selectMerchants } from "../../store/slices/adminSlice";

const NAVY = "#1a2a4a";

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  APPROVED:         "bg-teal-600",
  PENDING_APPROVAL: "bg-blue-500",
  DRAFT:            "bg-amber-400 text-gray-800",
  REJECTED:         "bg-red-500",
  SUSPENDED:        "bg-gray-500",
};

// ─── Read-only Field ──────────────────────────────────────────────────────────
const ReadField = ({ label, value }: { label: string; value?: string | null }) => (
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
    <ReadField label="Full Name"     value={merchant.user.name}  />
    <ReadField label="Email Address" value={merchant.user.email} />
    <ReadField label="Role"          value={merchant.user.role}  />
    <div className="flex flex-col gap-1">
      <div className="border border-gray-100 rounded-xl px-4 pt-2.5 pb-2 bg-gray-50">
        <label className="text-xs text-gray-400 font-medium">Account Status</label>
        <div className="mt-1">
          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-md text-white ${STATUS_STYLES[merchant.status] ?? "bg-gray-400"}`}>
            {merchant.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>
    </div>
    <ReadField label="Registered On" value={new Date(merchant.createdAt).toLocaleDateString("en-SA", { year: "numeric", month: "long", day: "numeric" })} />
  </div>
);

// ─── Tab 2: Company Details ───────────────────────────────────────────────────
const CompanyTab = ({ company }: { company: any }) => (
  <div className="flex flex-col gap-4">

    {/* Company Type */}
    <ReadField label="Company Type" value={company.companyType} />

    {/* Company Name + Presence */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Company Name"     value={company.companyName}     />
      <ReadField label="Company Presence" value={company.companyPresence} />
    </div>

    {/* E-Commerce URL */}
    {company.ecommerceUrl && (
      <ReadField label="E-Commerce Website URL" value={company.ecommerceUrl} />
    )}

    {/* Telephone + Registration */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Corporate Telephone"      value={company.corporateTelephone}    />
      <ReadField label="Company Registration No." value={company.companyRegistrationNo} />
    </div>

    {/* Annual Turnover + Employees */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField
        label="Business Annual Turnover (SAR)"
        value={company.annualTurnover != null ? company.annualTurnover.toLocaleString("en-SA") : null}
      />
      <ReadField
        label="Number of Employees"
        value={company.numberOfEmployees != null ? String(company.numberOfEmployees) : null}
      />
    </div>

    {/* Operation License + Expiry */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Operation License No." value={company.operationLicenseNo} />
      <ReadField
        label="Expiration Date"
        value={company.operationLicenseExpiry
          ? new Date(company.operationLicenseExpiry).toLocaleDateString("en-SA")
          : null}
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
      <ReadField label="Title"      value={attorney.title}     />
      <ReadField label="First Name" value={attorney.firstName} />
    </div>

    {/* Last Name + Nationality */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Last Name"   value={attorney.lastName}   />
      <ReadField label="Nationality" value={attorney.nationality} />
    </div>

    {/* Mobile + Date of Birth */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Mobile Number" value={attorney.mobileNumber} />
      <ReadField
        label="Date of Birth"
        value={attorney.dateOfBirth
          ? new Date(attorney.dateOfBirth).toLocaleDateString("en-SA")
          : null}
      />
    </div>

    {/* Place of Birth */}
    <ReadField label="Place of Birth" value={attorney.placeOfBirth} />

    {/* Home Address */}
    <ReadField label="Home Address" value={attorney.homeAddress} />

    {/* City + District */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="City"     value={attorney.city}    />
      <ReadField label="District" value={attorney.district}/>
    </div>

    {/* Postal Code + National ID */}
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Postal Code"                   value={attorney.postalCode}      />
      <ReadField label="National Identity / Iqama No." value={attorney.nationalIdNumber}/>
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
        <div key={doc.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-700">{doc.documentType.replace(/_/g, " ")}</p>
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
      <ReadField label="Email Address for Invoicing" value={gnplConfig.invoicingEmail}  />
      <ReadField label="Mobile Number for Invoicing" value={gnplConfig.invoicingMobile} />
      <ReadField label="Pay-out Plan"                value={gnplConfig.payoutPlan}       />
    </div>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ViewMerchantScreen = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const merchants = useAppSelector(selectMerchants);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (merchants.length === 0) {
      dispatch(fetchAllMerchants());
    }
  }, [dispatch, merchants.length]);

  const merchant = merchants.find((m) => m.id === Number(id));

  if (!merchant) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Merchant not found.</p>
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
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
        <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-lg text-white ${STATUS_STYLES[merchant.status] ?? "bg-gray-400"}`}>
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
            TabIndicatorProps={{ style: { background: NAVY, height: 3, borderRadius: 2 } }}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontFamily:    "inherit",
                fontSize:      "14px",
                fontWeight:    500,
                color:         "#6B7280",
                minHeight:     52,
                padding:       "0 20px",
              },
              "& .Mui-selected": {
                color:      `${NAVY} !important`,
                fontWeight: 600,
              },
            }}
          >
            <Tab label="Profile"           value={0} />
            <Tab label="Company Details"   value={1} />
            <Tab label="Power of Attorney" value={2} />
            <Tab label="Documents"         value={3} />
            <Tab label="GNPL Config"       value={4} />
          </Tabs>
        </div>

        {/* Content */}
        <div className="p-7">
          {activeTab === 0 && <ProfileTab  merchant={merchant}                        />}
          {activeTab === 1 && <CompanyTab  company={merchant.companyDetails}          />}
          {activeTab === 2 && <AttorneyTab attorney={merchant.powerOfAttorney}        />}
          {activeTab === 3 && <DocumentsTab documents={merchant.documents}            />}
          {activeTab === 4 && <GNPLTab     gnplConfig={merchant.gnplConfig}           />}
        </div>
      </div>
    </Sidebar>
  );
};

export default ViewMerchantScreen;