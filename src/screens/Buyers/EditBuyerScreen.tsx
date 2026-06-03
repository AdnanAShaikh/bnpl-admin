/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
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
  selectBuyers,
  updateBuyer,
} from "../../store/slices/adminSlice";
import { toast } from "react-toastify";

const NAVY = "#1a2a4a";

const COMPANY_TYPES = [
  { value: "SINGLE_SHAREHOLDER",    en: "Single Shareholder Company",      ar: "شركة الشخص الواحد"               },
  { value: "SIMPLIFIED_JOINT_STOCK",en: "Simplified Joint Stock Company",  ar: "شركة المساهمة المبسطة"           },
  { value: "JOINT_STOCK",           en: "Joint Stock Company",             ar: "شركة المساهمة"                   },
  { value: "LIMITED_LIABILITY",     en: "Limited Liability Company",       ar: "الشركة ذات المسؤولية المحدودة"   },
  { value: "LIMITED_PARTNERSHIP",   en: "Limited Partnership",             ar: "شركة التوصية البسيطة"            },
  { value: "PROFESSIONAL",          en: "Professional Company",            ar: "شركة مهنية"                      },
  { value: "FOREIGN",               en: "Foreign Company",                 ar: "شركة أجنبية"                     },
  { value: "GENERAL_PARTNERSHIP",   en: "General Partnership",             ar: "شركة التضامن"                    },
];

const TITLES = [
  { value: "MR",   label: "Mr"   },
  { value: "MS",   label: "Ms"   },
  { value: "MRS",  label: "Mrs"  },
  { value: "DR",   label: "Dr"   },
  { value: "PROF", label: "Prof" },
];

const STATUSES = [
  { value: "DRAFT",            label: "Draft"            },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "APPROVED",         label: "Approved"         },
  { value: "REJECTED",         label: "Rejected"         },
  { value: "SUSPENDED",        label: "Suspended"        },
];

// ─── Read-only field ──────────────────────────────────────────────────────────
const ReadField = ({ label, value }: { label: string; value?: string | null }) => (
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
    <ReadField label="Full Name"     value={buyer.user.name}  />
    <ReadField label="Email Address" value={buyer.user.email} />
    <SelectField
      label="Buyer Status" name="status"
      value={status} onChange={onStatusChange}
      options={STATUSES}
    />
  </div>
);

// ─── Tab 2: Company Details ───────────────────────────────────────────────────
const CompanyDetails = ({ data, onChange }: any) => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 gap-4">
      <Input label="Company Name" name="companyName"
        value={data.companyName} onChange={(v: any) => onChange("companyName", v)} />
      <Input label="Company Registration Number" name="companyRegistrationNo"
        value={data.companyRegistrationNo} onChange={(v: any) => onChange("companyRegistrationNo", v)} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Input label="Corporate Telephone Number" name="corporateTelephone" type="tel"
        value={data.corporateTelephone} onChange={(v: any) => onChange("corporateTelephone", v)} />
      <SelectField
        label="Company Type" name="companyType"
        value={data.companyType} onChange={(v: any) => onChange("companyType", v)}
        options={COMPANY_TYPES.map((c) => ({ value: c.value, label: `${c.en} — ${c.ar}` }))}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Input label="Operation License Number" name="operationLicenseNo"
        value={data.operationLicenseNo || ""} onChange={(v: any) => onChange("operationLicenseNo", v)} />
      <Input label="Expiration Date" name="operationLicenseExpiry" type="date"
        value={data.operationLicenseExpiry || ""} onChange={(v: any) => onChange("operationLicenseExpiry", v)} />
    </div>
    <Input label="SAGIA Number" name="sagiaNumber"
      value={data.sagiaNumber || ""} onChange={(v: any) => onChange("sagiaNumber", v)} />
  </div>
);

// ─── Tab 3: Power of Attorney ─────────────────────────────────────────────────
const PowerOfAttorney = ({ data, onChange }: any) => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 gap-4">
      <SelectField label="Title" name="title"
        value={data.title} onChange={(v: any) => onChange("title", v)}
        options={TITLES} />
      <Input label="First Name" name="firstName"
        value={data.firstName} onChange={(v: any) => onChange("firstName", v)} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Input label="Last Name" name="lastName"
        value={data.lastName} onChange={(v: any) => onChange("lastName", v)} />
      <Input label="Mobile Number" name="mobileNumber" type="tel"
        value={data.mobileNumber} onChange={(v: any) => onChange("mobileNumber", v)} />
    </div>
    <Input label="Home Address" name="homeAddress"
      value={data.homeAddress} onChange={(v: any) => onChange("homeAddress", v)} />
    <div className="grid grid-cols-2 gap-4">
      <Input label="City"     name="city"     value={data.city}     onChange={(v: any) => onChange("city", v)} />
      <Input label="District" name="district" value={data.district} onChange={(v: any) => onChange("district", v)} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Input label="Postal Code" name="postalCode"
        value={data.postalCode} onChange={(v: any) => onChange("postalCode", v)} />
      <Input label="National Identity Number / Iqama Number" name="nationalIdNumber"
        value={data.nationalIdNumber} onChange={(v: any) => onChange("nationalIdNumber", v)} />
    </div>
  </div>
);

// ─── Tab 4: Documents ─────────────────────────────────────────────────────────
const DocumentsTab = ({ documents, entityId }: { documents: any[]; entityId: number }) => {
  const dispatch = useAppDispatch();

  const handleDelete = async (docId: number) => {
    try {
      await dispatch(deleteDocument(docId)).unwrap();
      await dispatch(fetchAllBuyers());
      toast.success("Document deleted successfully");
    } catch (err: any) {
      toast.error(err || "Failed to delete document");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-gray-500 leading-relaxed">
        Uploaded documents are shown below. You can upload new versions if needed.
      </p>
      {documents && documents.length > 0 && (
        <div className="flex flex-col gap-3 mb-2">
          {documents.map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-700 capitalize">{doc.documentType.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-400">{doc.fileName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#1a2a4a] hover:underline">View</a>
                <button onClick={() => handleDelete(doc.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <FileInput label="Valid Commercial Registration"
        hint="An official copy of the Commercial Register for commercial activity and type of company."
        required documentType="commercial_registration" entityType="buyer" entityId={entityId} />
      <FileInput label="Business Trade License" required
        documentType="trade_license" entityType="buyer" entityId={entityId} />
      <FileInput label="Audited Financial Accounts" hint="Period of last year." required
        documentType="audited_financial_accounts" entityType="buyer" entityId={entityId} />
      <FileInput label="VAT Returns" hint="Period of last 4 quarters." required
        documentType="vat_returns" entityType="buyer" entityId={entityId} />
      <FileInput label="Bank Statements" hint="Period of last 6 months." required
        documentType="bank_statements" entityType="buyer" entityId={entityId} />
      <FileInput label="Power of Attorney Document" required
        documentType="power_of_attorney" entityType="buyer" entityId={entityId} />
      <FileInput label="VAT Registration Certificate" required
        documentType="vat_registration_certificate" entityType="buyer" entityId={entityId} />
    </div>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const EditBuyerScreen = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const buyers   = useAppSelector(selectBuyers);
  const initialized = useRef(false);

  const [activeTab, setActiveTab] = useState(0);
  const buyer = buyers.find((b) => b.id === Number(id));

  const [status,      setStatus]      = useState(buyer?.status || "");
  const [companyData, setCompanyData] = useState({
    companyName:            buyer?.companyDetails.companyName            || "",
    companyRegistrationNo:  buyer?.companyDetails.companyRegistrationNo  || "",
    corporateTelephone:     buyer?.companyDetails.corporateTelephone     || "",
    companyType:            buyer?.companyDetails.companyType            || "",
    operationLicenseNo:     buyer?.companyDetails.operationLicenseNo     || "",
    operationLicenseExpiry: buyer?.companyDetails.operationLicenseExpiry
      ? new Date(buyer.companyDetails.operationLicenseExpiry).toISOString().split("T")[0]
      : "",
    sagiaNumber:            buyer?.companyDetails.sagiaNumber            || "",
  });
  const [attorneyData, setAttorneyData] = useState({
    title:           buyer?.powerOfAttorney.title            || "",
    firstName:       buyer?.powerOfAttorney.firstName        || "",
    lastName:        buyer?.powerOfAttorney.lastName         || "",
    mobileNumber:    buyer?.powerOfAttorney.mobileNumber     || "",
    homeAddress:     buyer?.powerOfAttorney.homeAddress      || "",
    city:            buyer?.powerOfAttorney.city             || "",
    district:        buyer?.powerOfAttorney.district         || "",
    postalCode:      buyer?.powerOfAttorney.postalCode       || "",
    nationalIdNumber:buyer?.powerOfAttorney.nationalIdNumber || "",
  });

  // Re-sync when buyer loads from store after redirect
  if (buyer && !initialized.current) {
    initialized.current = true;
    if (!status) setStatus(buyer.status);
    if (!companyData.companyName) {
      setCompanyData({
        companyName:            buyer.companyDetails.companyName            ?? "",
        companyRegistrationNo:  buyer.companyDetails.companyRegistrationNo  ?? "",
        corporateTelephone:     buyer.companyDetails.corporateTelephone     ?? "",
        companyType:            buyer.companyDetails.companyType            ?? "",
        operationLicenseNo:     buyer.companyDetails.operationLicenseNo     ?? "",
        operationLicenseExpiry: buyer.companyDetails.operationLicenseExpiry
          ? new Date(buyer.companyDetails.operationLicenseExpiry).toISOString().split("T")[0]
          : "",
        sagiaNumber:            buyer.companyDetails.sagiaNumber            ?? "",
      });
      setAttorneyData({
        title:           buyer.powerOfAttorney.title            ?? "",
        firstName:       buyer.powerOfAttorney.firstName        ?? "",
        lastName:        buyer.powerOfAttorney.lastName         ?? "",
        mobileNumber:    buyer.powerOfAttorney.mobileNumber     ?? "",
        homeAddress:     buyer.powerOfAttorney.homeAddress      ?? "",
        city:            buyer.powerOfAttorney.city             ?? "",
        district:        buyer.powerOfAttorney.district         ?? "",
        postalCode:      buyer.powerOfAttorney.postalCode       ?? "",
        nationalIdNumber:buyer.powerOfAttorney.nationalIdNumber ?? "",
      });
    }
  }

  useEffect(() => {
    if (buyers.length === 0) dispatch(fetchAllBuyers());
  }, [dispatch, buyers.length]);

  const patchCompany  = (k: string, v: string) => setCompanyData((p)  => ({ ...p, [k]: v }));
  const patchAttorney = (k: string, v: string) => setAttorneyData((p) => ({ ...p, [k]: v }));

  // ── No validation — save whatever is filled ──
  const handleSave = async () => {
    const result = await dispatch(updateBuyer({
      id:     Number(id),
      status,
      companyData: {
        companyName:            companyData.companyName,
        companyRegistrationNo:  companyData.companyRegistrationNo,
        corporateTelephone:     companyData.corporateTelephone,
        companyType:            companyData.companyType,
        operationLicenseNo:     companyData.operationLicenseNo     || undefined,
        operationLicenseExpiry: companyData.operationLicenseExpiry || undefined,
        sagiaNumber:            companyData.sagiaNumber            || undefined,
      },
      attorneyData: {
        title:           attorneyData.title,
        firstName:       attorneyData.firstName,
        lastName:        attorneyData.lastName,
        mobileNumber:    attorneyData.mobileNumber,
        homeAddress:     attorneyData.homeAddress,
        city:            attorneyData.city,
        district:        attorneyData.district,
        postalCode:      attorneyData.postalCode,
        nationalIdNumber:attorneyData.nationalIdNumber,
      },
    }));

    if (updateBuyer.fulfilled.match(result)) {
      toast.success("Buyer updated successfully!");
    } else {
      toast.error("Failed to update buyer. Please try again.");
    }
  };

  if (!buyer) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Loading buyer...</p>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/buyer/all")}
            className="text-gray-400 hover:text-[#1a2a4a] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1a2a4a]">Edit Buyer</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {buyer.companyDetails.companyName || buyer.user.name} · #{buyer.id}
            </p>
          </div>
        </div>
        <button onClick={handleSave}
          className="px-8 py-2.5 bg-[#1a2a4a] hover:bg-[#243a64] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md">
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
            slotProps={{ indicator: { style: { background: NAVY, height: 3, borderRadius: 2 } } }}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none", fontFamily: "inherit",
                fontSize: "14px", fontWeight: 500,
                color: "#6B7280", minHeight: 52, padding: "0 20px",
              },
              "& .Mui-selected": { color: `${NAVY} !important`, fontWeight: 600 },
            }}
          >
            <Tab label="Profile"           value={0} />
            <Tab label="Company Details"   value={1} />
            <Tab label="Power of Attorney" value={2} />
            <Tab label="Documents"         value={3} />
          </Tabs>
        </div>

        <div className="p-7">
          {activeTab === 0 && <ProfileTab buyer={buyer} status={status} onStatusChange={setStatus} />}
          {activeTab === 1 && <CompanyDetails data={companyData} onChange={patchCompany} />}
          {activeTab === 2 && <PowerOfAttorney data={attorneyData} onChange={patchAttorney} />}
          {activeTab === 3 && <DocumentsTab documents={buyer.documents} entityId={buyer.id} />}
        </div>
      </div>
    </Sidebar>
  );
};

export default EditBuyerScreen;