/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAllBuyers, selectBuyers } from "../../store/slices/adminSlice";

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
const ProfileTab = ({ buyer }: { buyer: any }) => (
  <div className="flex flex-col gap-4">
    <ReadField label="Full Name"      value={buyer.user.name}  />
    <ReadField label="Email Address"  value={buyer.user.email} />
    <ReadField label="Role"           value={buyer.user.role}  />
    <div className="flex flex-col gap-1">
      <div className="border border-gray-100 rounded-xl px-4 pt-2.5 pb-2 bg-gray-50">
        <label className="text-xs text-gray-400 font-medium">Account Status</label>
        <div className="mt-1">
          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-md text-white ${STATUS_STYLES[buyer.status] ?? "bg-gray-400"}`}>
            {buyer.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>
    </div>
    <ReadField label="Registered On"  value={new Date(buyer.createdAt).toLocaleDateString("en-SA", { year: "numeric", month: "long", day: "numeric" })} />
  </div>
);

// ─── Tab 2: Company Details ───────────────────────────────────────────────────
const CompanyTab = ({ company }: { company: any }) => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Company Name"             value={company.companyName}           />
      <ReadField label="Company Registration No." value={company.companyRegistrationNo} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Corporate Telephone" value={company.corporateTelephone} />
      <ReadField label="Company Type"        value={company.companyType}        />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Operation License No." value={company.operationLicenseNo}     />
      <ReadField label="Expiration Date"        value={company.operationLicenseExpiry
        ? new Date(company.operationLicenseExpiry).toLocaleDateString("en-SA")
        : null}
      />
    </div>
    <ReadField label="SAGIA Number" value={company.sagiaNumber} />
  </div>
);

// ─── Tab 3: Power of Attorney ─────────────────────────────────────────────────
const AttorneyTab = ({ attorney }: { attorney: any }) => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Title"      value={attorney.title}     />
      <ReadField label="First Name" value={attorney.firstName} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Last Name"     value={attorney.lastName}    />
      <ReadField label="Mobile Number" value={attorney.mobileNumber}/>
    </div>
    <ReadField label="Home Address" value={attorney.homeAddress} />
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="City"     value={attorney.city}    />
      <ReadField label="District" value={attorney.district}/>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <ReadField label="Postal Code"                    value={attorney.postalCode}      />
      <ReadField label="National Identity / Iqama No."  value={attorney.nationalIdNumber}/>
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ViewBuyerScreen = () => {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const dispatch   = useAppDispatch();
  const buyers     = useAppSelector(selectBuyers);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (buyers.length === 0) {
      dispatch(fetchAllBuyers());
    }
  }, [dispatch, buyers.length]);

  const buyer = buyers.find((b) => b.id === Number(id));

  if (!buyer) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Buyer not found.</p>
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
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
        <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-lg text-white ${STATUS_STYLES[buyer.status] ?? "bg-gray-400"}`}>
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
                style: {
                  background: NAVY,
                  height: 3,
                  borderRadius: 2,
                },
              },
            }}            
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
            <Tab label="Profile"            value={0} />
            <Tab label="Company Details"    value={1} />
            <Tab label="Power of Attorney"  value={2} />
            <Tab label="Documents"          value={3} />
          </Tabs>
        </div>

        {/* Content */}
        <div className="p-7">
          {activeTab === 0 && <ProfileTab  buyer={buyer}                       />}
          {activeTab === 1 && <CompanyTab  company={buyer.companyDetails}      />}
          {activeTab === 2 && <AttorneyTab attorney={buyer.powerOfAttorney}    />}
          {activeTab === 3 && <DocumentsTab documents={buyer.documents}        />}
        </div>
      </div>
    </Sidebar>
  );
};

export default ViewBuyerScreen;