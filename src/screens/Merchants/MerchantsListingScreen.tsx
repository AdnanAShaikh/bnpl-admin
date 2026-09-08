import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import DataTable from "../../components/DataTable";
import type { ColumnDef, RowAction } from "../../components/DataTable";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllMerchants,
  selectMerchants,
  selectMerchantsError,
  selectMerchantsLoading,
} from "../../store/slices/adminSlice";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";

const flattenMerchant = (merchant: any) => ({
  id: merchant.id,
  companyRegistrationNo: merchant.companyDetails.companyRegistrationNo,
  name: merchant.user.name || "",
  email: merchant.user.email,
  status: merchant.status,
  createdAt: new Date(merchant.createdAt).toLocaleDateString("en-SA"),
});

type FlatMerchant = ReturnType<typeof flattenMerchant>;

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-teal-600",
  PENDING_APPROVAL: "bg-blue-500",
  DRAFT: "bg-amber-400 text-gray-800",
  REJECTED: "bg-red-500",
  SUSPENDED: "bg-gray-500",
};

// ─── Column Definitions ───────────────────────────────────────────────────────
const COLUMNS: ColumnDef<FlatMerchant>[] = [
  {
    key: "companyRegistrationNo",
    label: "Company Registration No.",
    render: (value) => (
      <span className="text-blue-600 font-medium cursor-pointer hover:underline">
        {String(value)}
      </span>
    ),
  },
  { key: "name", label: "Merchant Name" },
  { key: "email", label: "Merchant Email" },
  { key: "createdAt", label: "Last Modified" },
  {
    key: "status",
    label: "Merchant Status",
    render: (value) => {
      const status = String(value);
      const cls = STATUS_STYLES[status] ?? "bg-gray-400";

      return (
        <span
          className={`inline-block text-xs font-bold px-3 py-1 rounded-md text-white ${cls}`}
        >
          {status.replaceAll("_", " ")}
        </span>
      );
    },
  },
];

// ─── Tab Toggle ───────────────────────────────────────────────────────────────
type TabValue = "all" | "pending";

const TabToggle = ({
  active,
  onChange,
}: {
  active: TabValue;
  onChange: (v: TabValue) => void;
}) => {
  const tabs: { value: TabValue; label: string }[] = [
    { value: "all", label: "ALL MERCHANTS" },
    { value: "pending", label: "PENDING MERCHANT" },
  ];

  return (
    <div className="flex border border-gray-200 rounded-full overflow-hidden w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-6 py-2 text-sm font-bold tracking-wide transition-all duration-200 ${
            active === tab.value
              ? "bg-[#e8a020] text-white"
              : "bg-white text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const MerchantsListingScreen = () => {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const merchants = useAppSelector(selectMerchants);
  const loading = useAppSelector(selectMerchantsLoading);
  const error = useAppSelector(selectMerchantsError);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const canCreate = usePermission("merchant.create");
  const canEdit = usePermission("merchant.edit");
  const canView = usePermission("merchant.view");

  useEffect(() => {
    dispatch(fetchAllMerchants());
  }, [dispatch]);

  // Flatten + filter by tab
  const flatMerchants = merchants.map(flattenMerchant);
  const dataSource =
    activeTab === "pending"
      ? flatMerchants.filter((b) => b.status === "PENDING_APPROVAL")
      : flatMerchants;

  // ─── Row Actions ──────────────────────────────────────────────────────────────
  const ROW_ACTIONS: RowAction<FlatMerchant>[] = [
    canView && {
      label: "View Merchant",
      icon: (
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
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      onClick: (merchant: FlatMerchant) =>
        navigate(`/admin/merchant/${merchant.id}`),
    },
    canEdit && {
      label: "Edit Merchant",
      icon: (
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      onClick: (merchant: FlatMerchant) =>
        navigate(`/admin/merchant/edit/${merchant.id}`),
    },
  ].filter(Boolean) as RowAction<FlatMerchant>[];

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Loading merchants...</p>
        </div>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      {/* Header row: tabs left, create button right */}
      <div className="flex items-center justify-between mb-5">
        <TabToggle active={activeTab} onChange={setActiveTab} />

        {canCreate ? (
          <button
            onClick={() => {
              navigate("/admin/merchant/new");
            }}
            className="flex items-center gap-2 border-2 border-[#1a2a4a] text-[#1a2a4a] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#1a2a4a] hover:text-white transition-all duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Merchant
          </button>
        ) : null}
      </div>

      <DataTable<FlatMerchant>
        columns={COLUMNS}
        dataSource={dataSource}
        rowActions={ROW_ACTIONS}
        searchable
        searchKeys={["name", "email", "companyRegistrationNo"]}
        showStatusFilter={activeTab === "all"}
        statusOptions={[
          "DRAFT",
          "PENDING_APPROVAL",
          "APPROVED",
          "REJECTED",
          "SUSPENDED",
          "All Status",
        ]}
        defaultStatus="All Status"
        defaultPageSize={10}
      />
    </Sidebar>
  );
};

export default MerchantsListingScreen;
