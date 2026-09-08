/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import DataTable from "../../components/DataTable";
import type { ColumnDef, RowAction } from "../../components/DataTable";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  fetchAllOrders,
  selectOrders,
  selectOrdersLoading,
  selectOrdersError,
  type Order,
} from "../../store/slices/orderSlice";

const NAVY = "#1a2a4a";

// ─── Status display + meaning ─────────────────────────────────────────────────
const STATUS_META: Record<
  string,
  { label: string; cls: string; dot: string; desc: string }
> = {
  PENDING_REVIEW: {
    label: "Pending Review",
    cls: "bg-amber-400 text-gray-800",
    dot: "bg-amber-400",
    desc: "A buyer has submitted a financing request that has not yet been picked up for review.",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    cls: "bg-blue-500",
    dot: "bg-blue-500",
    desc: "The order has been assigned to an admin and is being assessed.",
  },
  APPROVED: {
    label: "Approved",
    cls: "bg-teal-600",
    dot: "bg-teal-600",
    desc: "The request has been approved and is awaiting merchant fulfilment confirmation.",
  },
  ACTIVE: {
    label: "Active",
    cls: "bg-emerald-600",
    dot: "bg-emerald-600",
    desc: "Financing is live — the merchant is being paid and buyer installments have begun.",
  },
  COMPLETED: {
    label: "Completed",
    cls: "bg-[#1a2a4a]",
    dot: "bg-[#1a2a4a]",
    desc: "All installments are settled and the order is closed.",
  },
  REJECTED: {
    label: "Rejected",
    cls: "bg-red-500",
    dot: "bg-red-500",
    desc: "The request was declined — by an admin during review, or by the merchant.",
  },
  CANCELLED: {
    label: "Cancelled",
    cls: "bg-gray-500",
    dot: "bg-gray-500",
    desc: "The buyer cancelled the request before it became active.",
  },
  DEFAULTED: {
    label: "Defaulted",
    cls: "bg-red-700",
    dot: "bg-red-700",
    desc: "The buyer has missed installments and the order is in default.",
  },
};

const STATUS_FLOW = [
  "PENDING_REVIEW",
  "UNDER_REVIEW",
  "APPROVED",
  "ACTIVE",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "DEFAULTED",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const money = (v: string | number, currency = "SAR") =>
  `${currency} ${Number(v).toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// ─── Status Info Modal ────────────────────────────────────────────────────────
const StatusInfoModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      style={{ animation: "fadeIn .15s ease-out" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        style={{ animation: "popIn .18s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-[#1a2a4a]">
              Order Statuses Explained
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              The order workflow, stage by stage
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            {STATUS_FLOW.map((key) => {
              const meta = STATUS_META[key];
              return (
                <div key={key} className="flex gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${meta.dot} flex-shrink-0 mt-1`}
                  />
                  <div>
                    <p className="text-sm font-bold text-[#1a2a4a]">
                      {meta.label}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {meta.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#1a2a4a] hover:bg-[#243a5e] text-white font-semibold text-sm rounded-xl transition-all"
          >
            Got it
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const OrdersListingScreen = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const orders = useAppSelector(selectOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);

  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  // ── Summary stats ──
  const stats = useMemo(() => {
    const pending = orders.filter((o: Order) => o.status === "PENDING_REVIEW");
    const review = orders.filter((o: Order) => o.status === "UNDER_REVIEW");
    const active = orders.filter((o: Order) => o.status === "ACTIVE");
    const activeTotal = active.reduce(
      (s: number, o: Order) => s + Number(o.totalAmount),
      0,
    );
    return {
      total: orders.length,
      pendingCount: pending.length,
      reviewCount: review.length,
      activeCount: active.length,
      activeTotal,
    };
  }, [orders]);

  // ── Donut: orders grouped by status ──
  const donutData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o: Order) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    const fillOf: Record<string, string> = {
      PENDING_REVIEW: "#f59e0b",
      UNDER_REVIEW: "#3b82f6",
      APPROVED: "#0d9488",
      ACTIVE: "#059669",
      COMPLETED: "#1a3a6a",
      REJECTED: "#ef4444",
      CANCELLED: "#6b7280",
      DEFAULTED: "#b91c1c",
    };
    return Object.entries(counts).map(([status, value]) => ({
      name: STATUS_META[status]?.label ?? status,
      value,
      fill: fillOf[status] ?? "#E5E7EB",
    }));
  }, [orders]);

  const totalOrders = orders.length;

  // ── Columns ──
  const COLUMNS: ColumnDef<Order>[] = [
    {
      key: "id",
      label: "Order #",
      render: (v) => (
        <span className="font-semibold text-[#1a2a4a]">#{String(v)}</span>
      ),
    },
    {
      key: "product",
      label: "Product",
      render: (_v, row) => row.product?.name ?? "—",
    },
    {
      key: "buyer",
      label: "Buyer",
      render: (_v, row) => row.buyer?.companyDetails?.companyName ?? "—",
    },
    {
      key: "merchant",
      label: "Merchant",
      render: (_v, row) => row.merchant?.companyDetails?.companyName ?? "—",
    },
    { key: "quantity", label: "Qty" },
    {
      key: "totalAmount",
      label: "Total",
      render: (v, row) => money(v as string, row.currency),
    },
    {
      key: "installmentAmount",
      label: "Installments",
      render: (v, row) => (
        <span>
          {row.numberOfInstallments} × {money(v as string, row.currency)}
        </span>
      ),
    },
    {
      key: "requestedPlan",
      label: "Plan",
      render: (_v, row) => row.requestedPlan?.planName ?? "—",
    },
    {
      key: "assignedAdmin",
      label: "Assigned To",
      render: (_v, row) =>
        row.assignedAdmin?.name ??
        row.assignedAdmin?.email ?? (
          <span className="text-gray-300">Unassigned</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const meta = STATUS_META[String(value)] ?? {
          label: String(value),
          cls: "bg-gray-400",
        };
        return (
          <span
            className={`inline-block text-xs font-bold px-3 py-1 rounded-md text-white ${meta.cls}`}
          >
            {meta.label}
          </span>
        );
      },
    },
    { key: "createdAt", label: "Submitted", render: (v) => dateFmt(String(v)) },
  ];

  // ── Row actions ──
  const eyeIcon = (
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
  );

  const ROW_ACTIONS: RowAction<Order>[] = [
    {
      label: "View / Manage",
      icon: eyeIcon,
      onClick: (order) => navigate(`/admin/orders/${order.id}`),
    },
  ];

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Loading orders...</p>
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
      {/* Header with info button */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[#1a2a4a]">Orders</h1>
        <button
          onClick={() => setInfoOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a2a4a] border border-gray-200 rounded-xl px-3.5 py-2 hover:border-[#1a2a4a] transition-colors"
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Status Guide
        </button>
      </div>

      {/* Summary + donut */}
      <div className="flex gap-5 mb-6">
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">Active Orders Value</p>
            <p className="text-lg font-bold text-[#1a2a4a]">
              SAR{" "}
              {stats.activeTotal.toLocaleString("en-SA", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">Pending Review</p>
            <p className="text-2xl font-bold text-[#1a2a4a]">
              {stats.pendingCount}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">Under Review</p>
            <p className="text-2xl font-bold text-[#1a2a4a]">
              {stats.reviewCount}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">Active</p>
            <p className="text-2xl font-bold text-[#1a2a4a]">
              {stats.activeCount}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 w-[380px] flex-shrink-0">
          <p className="text-sm font-semibold text-gray-600 mb-4">
            Orders by Status
          </p>
          {totalOrders === 0 ? (
            <div className="h-[160px] flex items-center justify-center">
              <p className="text-sm text-gray-400">No orders yet.</p>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-[160px] h-[160px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={72}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}
                      labelLine={false}
                      label={({ cx, cy }: any) => (
                        <>
                          <text
                            x={cx}
                            y={cy - 6}
                            textAnchor="middle"
                            style={{
                              fontSize: 22,
                              fontWeight: 700,
                              fill: NAVY,
                            }}
                          >
                            {totalOrders}
                          </text>
                          <text
                            x={cx}
                            y={cy + 13}
                            textAnchor="middle"
                            style={{ fontSize: 11, fill: "#9CA3AF" }}
                          >
                            Orders
                          </text>
                        </>
                      )}
                    >
                      {donutData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any, n: any) => [
                        `${v} order${v === 1 ? "" : "s"}`,
                        n,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {donutData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ background: d.fill }}
                    />
                    <span className="text-xs text-gray-500 flex-1">
                      {d.name}
                    </span>
                    <span className="text-xs font-bold text-[#1a2a4a]">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <DataTable<Order>
        title="All Orders"
        columns={COLUMNS}
        dataSource={orders}
        rowActions={ROW_ACTIONS}
        searchable
        searchKeys={["id", "orderRef", "status"]}
        showStatusFilter
        statusOptions={[
          "PENDING_REVIEW",
          "UNDER_REVIEW",
          "APPROVED",
          "ACTIVE",
          "COMPLETED",
          "REJECTED",
          "CANCELLED",
          "DEFAULTED",
          "All Status",
        ]}
        defaultStatus="All Status"
        defaultPageSize={10}
      />

      <StatusInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </Sidebar>
  );
};

export default OrdersListingScreen;
