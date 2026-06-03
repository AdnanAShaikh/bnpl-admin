import React from "react";
import Sidebar from "../components/Sidebar";

// ─── Demo Data ────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Total Disbursement", value: "SAR 355,978.04", change: "+20% from previous period", changeType: "positive" },
  { label: "Total Revenue", value: "SAR 355,978.04", change: "+20% from previous period", changeType: "positive" },
];

const PRODUCT_OVERVIEW = [
  { name: "Pay in 2", orders: 19, max: 19 },
  { name: "Pay in 4", orders: 7, max: 19 },
  { name: "Pay in 8", orders: 3, max: 19 },
  { name: "Pay in 2 (edit)", orders: 1, max: 19 },
  { name: "Pay in 10", orders: 2, max: 19 },
  { name: "Pay in 12", orders: 1, max: 19 },
  { name: "Pay in 6", orders: 1, max: 19 },
  { name: "This is a product for Retailers in Fast Moving Goods", orders: 3, max: 19 },
];

const MERCHANT_DATA = {
  total: 39,
  active: 8,
  suspended: 1,
};

const BUYER_DATA = {
  total: 34,
  active: 20,
  suspended: 0,
};

const ACTIVITY_STATUS = [
  { count: 0, bold: "Merchant", rest: "Pending POA Change Approval" },
  { count: 0, bold: "Merchants", rest: "Pending Approval" },
  { count: 0, bold: "Buyers", rest: "Pending Approval" },
  { count: 2, bold: "Orders", rest: "Awaiting Fulfillment" },
  { count: 1, bold: "Product", rest: "Pending Review" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

// Info tooltip icon
const InfoIcon = () => (
  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold cursor-pointer ml-1">?</span>
);

// Stat card (Disbursement / Revenue)
const StatCard = ({ label, value, change, changeType }: typeof STATS[0]) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 flex-1">
    <p className="text-sm font-semibold text-gray-600 flex items-center">
      {label} <InfoIcon />
    </p>
    <p className="text-2xl font-bold text-[#1a2a4a] mt-1">{value}</p>
    <p className={`text-sm mt-1 font-medium ${changeType === "positive" ? "text-green-500" : "text-red-500"}`}>
      {change}
    </p>
  </div>
);

// Progress bar row
const ProductRow = ({ name, orders, max }: typeof PRODUCT_OVERVIEW[0]) => {
  const pct = Math.round((orders / max) * 100);
  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3 mb-1.5">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#e8a020] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">{name}</span>
        <span className="text-sm text-gray-500 font-medium">{orders} = Orders</span>
      </div>
    </div>
  );
};

// Merchant / Buyer panel
const EntityPanel = ({
  title,
  total,
  active,
  suspended,
  activeLabel,
  suspendedLabel,
}: {
  title: string;
  total: number;
  active: number;
  suspended: number;
  activeLabel: string;
  suspendedLabel: string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5">
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-sm font-semibold text-gray-600 flex items-center">
          {title} <InfoIcon />
        </p>
        <p className="text-2xl font-bold text-[#1a2a4a] mt-0.5">{total}</p>
      </div>
      <button className="border-2 border-[#1a2a4a] text-[#1a2a4a] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#1a2a4a] hover:text-white transition-all duration-200">
        View All
      </button>
    </div>
    <div className="grid grid-cols-2 gap-3 mt-4">
      <div className="bg-green-500 rounded-xl px-3 py-2">
        <p className="text-xs font-bold text-white">{activeLabel}</p>
        <p className="text-xl font-bold text-white mt-0.5">{active}</p>
      </div>
      <div className="bg-[#e8a020] rounded-xl px-3 py-2">
        <p className="text-xs font-bold text-white">{suspendedLabel}</p>
        <p className="text-xl font-bold text-white mt-0.5">{suspended}</p>
      </div>
    </div>
  </div>
);

// Activity row
const ActivityRow = ({ count, bold, rest }: typeof ACTIVITY_STATUS[0]) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-7 h-7 rounded-full bg-[#e8a020]/15 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-[#e8a020]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p className="text-sm text-gray-600">
      <span className="font-bold text-[#1a2a4a]">{count} {bold}</span>{" "}
      {rest}
    </p>
  </div>
);

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
const DashboardScreen = () => {
  return (
    <Sidebar>
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1a2a4a]">Dashboard</h1>
      </div>

      <div className="flex gap-5">
        {/* ── Left / Main column ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Stat cards */}
          <div className="flex gap-5">
            {STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Product Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-bold text-gray-700 flex items-center mb-1">
              Product Overview <InfoIcon />
            </p>
            <div className="divide-y divide-gray-50">
              {PRODUCT_OVERVIEW.map((p) => (
                <ProductRow key={p.name} {...p} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="w-[300px] flex-shrink-0 flex flex-col gap-5">

          {/* Merchant panel */}
          <EntityPanel
            title="Total Merchant"
            total={MERCHANT_DATA.total}
            active={MERCHANT_DATA.active}
            suspended={MERCHANT_DATA.suspended}
            activeLabel="Active Merchants"
            suspendedLabel="Suspended Merchants"
          />

          {/* Buyer panel */}
          <EntityPanel
            title="Total Buyer"
            total={BUYER_DATA.total}
            active={BUYER_DATA.active}
            suspended={BUYER_DATA.suspended}
            activeLabel="Active Buyers"
            suspendedLabel="Suspended Buyers"
          />

          {/* Activity Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-bold text-gray-700 mb-1">Activity Status</p>
            {ACTIVITY_STATUS.map((a, i) => (
              <ActivityRow key={i} {...a} />
            ))}
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default DashboardScreen;