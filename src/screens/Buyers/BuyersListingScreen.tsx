import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import DataTable from "../../components/DataTable";
import type { ColumnDef, RowAction } from "../../components/DataTable";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllBuyers,
  selectBuyers,
  selectBuyersError,
  selectBuyersLoading,
} from "../../store/slices/adminSlice";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";

// ─── Flatten API response for DataTable ───────────────────────────────────────
const flattenBuyer = (buyer: any) => ({
  id: buyer.id,
  companyRegistrationNo: buyer.companyDetails.companyRegistrationNo,
  name: buyer.user.name || "",
  email: buyer.user.email,
  status: buyer.status,
  createdAt: new Date(buyer.createdAt).toLocaleDateString("en-SA"),
});

type FlatBuyer = ReturnType<typeof flattenBuyer>;

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-teal-600",
  PENDING_APPROVAL: "bg-blue-500",
  DRAFT: "bg-amber-400 text-gray-800",
  REJECTED: "bg-red-500",
  SUSPENDED: "bg-gray-500",
};

// ─── Column Definitions ───────────────────────────────────────────────────────
const COLUMNS: ColumnDef<FlatBuyer>[] = [
  {
    key: "companyRegistrationNo",
    label: "Company Registration No.",
    render: (value) => (
      <span className="text-blue-600 font-medium cursor-pointer hover:underline">
        {String(value)}
      </span>
    ),
  },
  { key: "name", label: "Buyer Name" },
  { key: "email", label: "Email" },
  { key: "createdAt", label: "Registered On" },
  {
    key: "status",
    label: "Status",
    render: (value) => {
      const cls = STATUS_STYLES[String(value)] ?? "bg-gray-400";
      return (
        <span
          className={`inline-block text-xs font-bold px-3 py-1 rounded-md text-white ${cls}`}
        >
          {String(value).replace("_", " ")}
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
    { value: "all", label: "ALL BUYERS" },
    { value: "pending", label: "PENDING BUYERS" },
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
const BuyersListingScreen = () => {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const buyers = useAppSelector(selectBuyers);
  const loading = useAppSelector(selectBuyersLoading);
  const error = useAppSelector(selectBuyersError);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const canCreate = usePermission("buyer.create");
  const canEdit = usePermission("buyer.edit");
  const canView = usePermission("buyer.view");

  useEffect(() => {
    dispatch(fetchAllBuyers());
  }, [dispatch]);

  // Flatten + filter by tab
  const flatBuyers = buyers.map(flattenBuyer);
  const dataSource =
    activeTab === "pending"
      ? flatBuyers.filter((b) => b.status === "PENDING_APPROVAL")
      : flatBuyers;

  // ─── Row Actions ──────────────────────────────────────────────────────────────
  const ROW_ACTIONS: RowAction<FlatBuyer>[] = [
    canView && {
      label: "View Buyer",
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
      onClick: (buyer: FlatBuyer) => navigate(`/admin/buyer/${buyer.id}`), // ← pass the id
    },
    canEdit && {
      label: "Edit Buyer",
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
      onClick: (buyer: FlatBuyer) => navigate(`/admin/buyer/edit/${buyer.id}`), // ← pass the id
    },
    // {
    //   label: "Suspended Buyers",
    //   icon: (
    //     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    //       <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    //     </svg>
    //   ),
    //   onClick: (buyer: FlatBuyer) => console.log("Edit merchant", buyer),
    // },
    // {
    //   label: "Change Power Of Attorney",
    //   icon: (
    //     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    //       <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    //     </svg>
    //   ),
    //   onClick: (buyer: FlatBuyer) => console.log("Edit Buyer", buyer),
    // },
  ].filter(Boolean) as RowAction<FlatBuyer>[];

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Loading buyers...</p>
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
              navigate("/admin/buyer/new");
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
            Create New Buyer
          </button>
        ) : null}
      </div>

      <DataTable<FlatBuyer>
        columns={COLUMNS}
        dataSource={dataSource}
        rowActions={ROW_ACTIONS}
        searchable
        searchKeys={["name", "email", "companyRegistrationNo", "status"]}
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

export default BuyersListingScreen;
