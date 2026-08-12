/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchOrderById,
  clearCurrentOrder,
  selectCurrentOrder,
  selectSingleLoading,
  selectSingleError,
  assignOrder,
  updateOrderStatus,
} from "../../store/slices/orderSlice";
import { fetchAllAdminUsers, selectAuthUser, selectUsers } from "../../store/slices/adminSlice";
import { toast } from "react-toastify";
import { SelectField } from "../../components/SelectField";

const NAVY = "#1a2a4a";

// ─── Status styling ───────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  PENDING_REVIEW: "bg-amber-400 text-gray-800",
  UNDER_REVIEW:   "bg-blue-500",
  APPROVED:       "bg-teal-600",
  ACTIVE:         "bg-emerald-600",
  COMPLETED:      "bg-[#1a2a4a]",
  REJECTED:       "bg-red-500",
  CANCELLED:      "bg-gray-500",
  DEFAULTED:      "bg-red-700",
};

const REVIEW_STATUS_OPTIONS = [
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED",     label: "Approved"     },
  { value: "ACTIVE",       label: "Active"       },
  { value: "COMPLETED",    label: "Completed"    },
  { value: "REJECTED",     label: "Rejected"     },
  { value: "CANCELLED",    label: "Cancelled"    },
  { value: "DEFAULTED",    label: "Defaulted"    },
];
const prettyStatus = (s: string) => s.replace(/_/g, " ");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const money = (v: string | number | null | undefined, currency = "SAR") =>
  v == null ? "—" : `${currency} ${Number(v).toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const dateFmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-SA", { year: "numeric", month: "long", day: "numeric" }) : "—";

const pct = (v: string | number | null | undefined) =>
  v == null ? "—" : `${(Number(v) * 100).toFixed(2)}%`;

// ─── Read-only field ──────────────────────────────────────────────────────────
const ReadField = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex flex-col gap-1 w-full">
    <div className="border border-gray-100 rounded-xl px-4 pt-2.5 pb-2 bg-gray-50">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <p className="text-sm text-gray-800 mt-0.5">{value === 0 ? "0" : value || "—"}</p>
    </div>
  </div>
);

// ─── Section heading ──────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs font-bold text-[#1a2a4a] uppercase tracking-wide mb-2.5">{title}</p>
    {children}
  </div>
);

// ─── Tab 1: Details (order + buyer + merchant) ────────────────────────────────
const DetailsTab = ({ order, canReview, onStatusChange, statusSaving }: any) => (
  <div className="flex flex-col gap-6">
    {/* Order financials */}
    <Section title="Order Details">
      <div className="grid grid-cols-3 gap-3">
        {canReview ? (
            <div className="flex flex-col gap-1 w-full">
            <SelectField
                label="Status"
                name="status"
                value={order.status}
                onChange={onStatusChange}
                options={REVIEW_STATUS_OPTIONS}
            />
            {statusSaving && <p className="text-[11px] text-gray-400 pl-1">Updating…</p>}
            </div>
        ) : (
            <>
                <ReadField label="Status"              value={prettyStatus(order.status)} />
                <ReadField label="Quantity"            value={order.quantity} />
                <ReadField label="Unit Price"          value={money(order.unitPrice, order.currency)} />
                <ReadField label="Goods Cost"          value={money(order.costAmount, order.currency)} />
                <ReadField label="Profit Rate"         value={pct(order.profitRate)} />
                <ReadField label="Profit Amount"       value={money(order.profitAmount, order.currency)} />
                <ReadField label="Total Amount"        value={money(order.totalAmount, order.currency)} />
                <ReadField label="Down Payment"        value={money(order.downPayment, order.currency)} />
                <ReadField label="Installment Amount"  value={money(order.installmentAmount, order.currency)} />
                <ReadField label="# Installments"      value={order.numberOfInstallments} />
                <ReadField label="Frequency"           value={order.installmentFrequency} />
                <ReadField label="Plan"                value={order.requestedPlan?.planName} />
            </>
         )}
        </div>
    </Section>

    {/* Contact / delivery */}
    <Section title="Contact & Delivery">
      <div className="grid grid-cols-2 gap-3">
        <ReadField label="Contact Name"    value={order.contactName} />
        <ReadField label="Contact Email"   value={order.contactEmail} />
        <ReadField label="Contact Phone"   value={order.contactPhone} />
        <ReadField label="Delivery Address" value={order.deliveryAddress} />
      </div>
    </Section>

    {/* Buyer */}
    <Section title="Buyer">
      <div className="grid grid-cols-2 gap-3">
        <ReadField label="Company" value={order.buyer?.companyDetails?.companyName} />
        <ReadField label="Buyer ID" value={order.buyerId} />
      </div>
    </Section>

    {/* Merchant */}
    <Section title="Merchant">
      <div className="grid grid-cols-2 gap-3">
        <ReadField label="Company" value={order.merchant?.companyDetails?.companyName} />
        <ReadField label="Merchant ID" value={order.merchantId} />
        <ReadField
          label="Fulfillment Response"
          value={
            order.merchantConfirmed ? "Confirmed"
            : order.merchantDeclined ? "Declined"
            : "Awaiting"
          }
        />
        {order.merchantDeclined && <ReadField label="Decline Reason" value={order.declineReason} />}
      </div>
    </Section>

    {/* Assignment + key dates */}
    <Section title="Review & Assignment">
      <div className="grid grid-cols-3 gap-3">
        <ReadField label="Assigned To" value={order.assignedAdmin?.name ?? order.assignedAdmin?.email} />
        <ReadField label="Submitted"   value={dateFmt(order.submittedAt ?? order.createdAt)} />
        <ReadField label="Reviewed"    value={dateFmt(order.reviewedAt)} />
        <ReadField label="Approved"    value={dateFmt(order.approvedAt)} />
        <ReadField label="Disbursed"   value={dateFmt(order.disbursedAt)} />
        <ReadField label="Completed"   value={dateFmt(order.completedAt)} />
      </div>
      {order.rejectionReason && (
        <div className="mt-3">
          <ReadField label="Rejection Reason" value={order.rejectionReason} />
        </div>
      )}
      {order.adminNotes && (
        <div className="mt-3">
          <ReadField label="Admin Notes" value={order.adminNotes} />
        </div>
      )}
    </Section>
  </div>
);

// ─── Tab 2: Product ───────────────────────────────────────────────────────────
const ProductTab = ({ order }: { order: any }) => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 gap-3">
      <ReadField label="Product Name" value={order.product?.name} />
      <ReadField label="Category"     value={order.product?.category} />
      <ReadField label="Currency"     value={order.product?.currency} />
      <ReadField label="Product ID"   value={order.productId} />
    </div>
    <p className="text-xs text-gray-400">
      Ordered quantity: {order.quantity} · Unit price: {money(order.unitPrice, order.currency)}
    </p>
  </div>
);

// ─── Tab 3: Wa'ad Promise (placeholder) ───────────────────────────────────────
const WaadTab = () => (
  <div className="flex items-center justify-center py-16">
    <div className="text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-[#1a2a4a] mb-1">Wa'ad Promise</p>
      <p className="text-sm text-gray-400">This section is coming soon.</p>
    </div>
  </div>
);

const AssignModal = ({
  open, onClose, orderId, currentAssignedId,
}: {
  open: boolean;
  onClose: () => void;
  orderId: number;
  currentAssignedId: number | null;
}) => {
  const dispatch = useAppDispatch();
  const admins   = useAppSelector(selectUsers);
  const me       = useAppSelector(selectAuthUser);

  const [selectedId, setSelectedId] = useState<number | null>(currentAssignedId);
  const [saving, setSaving]         = useState(false);

  // Load admins when modal opens; seed selection from current assignment
  useEffect(() => {
    if (open) {
      if (admins.length === 0) dispatch(fetchAllAdminUsers());
      setSelectedId(currentAssignedId);
    }
  }, [open, currentAssignedId, admins.length, dispatch]);

  if (!open) return null;

  const doAssign = async (assignedAdminId: number) => {
    setSaving(true);
    const result = await dispatch(assignOrder({ id: orderId, assignedAdminId }));
    setSaving(false);
    if (assignOrder.fulfilled.match(result)) {
      toast.success("Order assigned");
      onClose();
    } else {
      toast.error((result.payload as string) || "Failed to assign order");
    }
  };

  const activeAdmins = admins.filter((u: any) => !u.isDisabled);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      style={{ animation: "fadeIn .15s ease-out" }}
      onClick={() => !saving && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
        style={{ animation: "popIn .18s ease-out" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-[#1a2a4a]">Assign Order</h3>
            <p className="text-xs text-gray-400 mt-0.5">Choose an admin to handle this order</p>
          </div>
          <button onClick={() => !saving && onClose()} disabled={saving}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-40">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Assign to me */}
        {me && (
          <div className="px-6 pt-4">
            <button
              onClick={() => doAssign(me.id)}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a2a4a] hover:bg-[#243a5e] text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-60"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Assign to me
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-gray-100 flex-1" />
              <span className="text-xs text-gray-400">or pick an admin</span>
              <div className="h-px bg-gray-100 flex-1" />
            </div>
          </div>
        )}

        {/* Admin radio list */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {activeAdmins.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No admins available.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {activeAdmins.map((u: any) => {
                const checked = selectedId === u.id;
                return (
                  <label key={u.id}
                    className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition-all
                      ${checked ? "border-[#1a2a4a] bg-[#1a2a4a]/[0.03]" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="assignee" checked={checked}
                      onChange={() => setSelectedId(u.id)}
                      className="w-4 h-4 accent-[#1a2a4a] cursor-pointer" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1a2a4a] truncate">{u.name || u.email}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {u.email}{u.accessRole?.roleName ? ` · ${u.accessRole.roleName}` : ""}
                      </p>
                    </div>
                    {me?.id === u.id && (
                      <span className="ml-auto text-[10px] font-bold text-[#1a2a4a] bg-[#1a2a4a]/10 px-2 py-0.5 rounded">YOU</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} disabled={saving}
            className="px-6 py-2 border-2 border-gray-300 text-gray-600 font-semibold text-sm rounded-xl hover:border-[#1a2a4a] hover:text-[#1a2a4a] transition-all disabled:opacity-40">
            Cancel
          </button>
          <button
            onClick={() => selectedId != null && doAssign(selectedId)}
            disabled={saving || selectedId == null}
            className="px-8 py-2 bg-[#1a2a4a] hover:bg-[#243a5e] text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-40 flex items-center gap-2">
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Assigning...
              </>
            ) : "Assign"}
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
const EditOrderScreen = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const me = useAppSelector(selectAuthUser);

  const order   = useAppSelector(selectCurrentOrder);
  const loading = useAppSelector(selectSingleLoading);
  const error   = useAppSelector(selectSingleError);
  
  const isSuperAdmin  = me?.accessRole?.roleName === "Super Admin";
  const isAssignedToMe = order && order.assignedAdminId != null && order.assignedAdminId === me?.id;
  const canReview      = isSuperAdmin || isAssignedToMe;

  const [activeTab, setActiveTab] = useState(0);
  const [assignOpen, setAssignOpen] = useState(false);

  const [statusSaving, setStatusSaving] = useState(false);

  const [unassigning, setUnassigning] = useState(false);

  console.log('heheheh', order)
  
  useEffect(() => {
      if (id) dispatch(fetchOrderById(Number(id)));
      return () => { dispatch(clearCurrentOrder()); };
    }, [id, dispatch]);
    
    const handleUnassign = async () => {
        if (!order) return;                          

        setUnassigning(true);
        const result = await dispatch(assignOrder({ id: order.id, assignedAdminId: null as any }));
        setUnassigning(false);
    
        if (assignOrder.fulfilled.match(result)) {
            toast.success("Unassigned from you");
        } else {
            toast.error((result.payload as string) || "Failed to unassign");
        }
    };

    const handleStatusChange = async (newStatus: string) => {
          if (!order) return;                  

        if (newStatus === order.status) return;
        
        let rejectionReason: string | undefined;
        if (newStatus === "REJECTED") {
            rejectionReason = window.prompt("Reason for rejecting this order?")?.trim() || "";
            if (!rejectionReason) {
            toast.error("Rejection reason is required.");
            return;
            }
        }
        
        setStatusSaving(true);
        const result = await dispatch(updateOrderStatus({
            id: order.id,
            status: newStatus as any,
            ...(rejectionReason ? { rejectionReason } : {}),
        }));
        setStatusSaving(false);
        
        if (updateOrderStatus.fulfilled.match(result)) {
            toast.success("Status updated");
        } else {
            toast.error((result.payload as string) || "Failed to update status");
        }
    };


  // ── Loading ──
  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <span className="w-6 h-6 border-2 border-gray-200 border-t-[#1a2a4a] rounded-full animate-spin" />
          <span className="ml-3 text-sm text-gray-400">Loading order...</span>
        </div>
      </Sidebar>
    );
  }

  // ── Error / not found ──
  if (error || !order) {
    return (
      <Sidebar>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-sm font-semibold text-[#1a2a4a] mb-1">Couldn't load this order</p>
          <p className="text-sm text-gray-400 mb-4">{error || "Order not found."}</p>
          <button
            onClick={() => navigate("/admin/orders/all")}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#1a2a4a] text-white hover:bg-[#243a5e] transition-colors"
          >
            Back to Orders
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
          <button onClick={() => navigate("/admin/orders")}
            className="text-gray-400 hover:text-[#1a2a4a] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1a2a4a]">
              Order #{order.id}
              {order.orderRef && <span className="text-sm text-gray-400 font-medium ml-2">{order.orderRef}</span>}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {order.product?.name ?? "—"} · {order.buyer?.companyDetails?.companyName ?? `Buyer #${order.buyerId}`}
            </p>
          </div>
        </div>
      

         {isAssignedToMe && (
                <button
                onClick={handleUnassign}
                disabled={unassigning}
                className="px-5 py-2 border-2 border-gray-300 text-gray-600 font-semibold text-sm rounded-xl hover:border-red-400 hover:text-red-500 transition-all disabled:opacity-40"
                >
                {unassigning ? "Unassigning..." : "Unassign from me"}
                </button>
        )}

            <button
                onClick={() => setAssignOpen(true)}
                className="px-5 py-2 border-2 border-[#1a2a4a] text-[#1a2a4a] font-semibold text-sm rounded-xl hover:bg-[#1a2a4a] hover:text-white transition-all"
                 >
                {order.assignedAdminId ? "Reassign" : "Assign"}
            </button>

            <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-lg text-white ${STATUS_STYLES[order.status] ?? "bg-gray-400"}`}>
                {prettyStatus(order.status)}
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
            <Tab label="Details"        value={0} />
            <Tab label="Product"        value={1} />
            <Tab label="Wa'ad Promise"  value={2} />
          </Tabs>
        </div>

        {/* Content */}
        <div className="p-7">
          {activeTab === 0 && <DetailsTab   
                order={order}
                canReview={canReview}
                onStatusChange={handleStatusChange}
                statusSaving={statusSaving}
          />}
          {activeTab === 1 && <ProductTab order={order} />}
          {activeTab === 2 && <WaadTab />}
        </div>
      </div>

      <AssignModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        orderId={order.id}
        currentAssignedId={order.assignedAdminId}
      />
    </Sidebar>
  );
};

export default EditOrderScreen;