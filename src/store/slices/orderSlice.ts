/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../utils/apiFetch";

// ─── Shared Nested Types ──────────────────────────────────────────────────────
interface CompanyRef {
  companyName: string;
}

interface ProductRef {
  id:       number;
  name:     string;
  category: string;
  currency: string;
}

interface PartyRef {
  id:             number;
  companyDetails: CompanyRef | null;
}

interface AdminRef {
  id:    number;
  name:  string | null;
  email: string;
}

interface PlanRef {
  id:         number;
  planName:   string;
  profitRate: string;   // Decimal → string
  termType:   string;
  termValue:  number;
}

// ─── Order Status ─────────────────────────────────────────────────────────────
export type OrderStatus =
  | "PENDING_REVIEW"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "ACTIVE"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED"
  | "DEFAULTED";

// ─── Entity Type ──────────────────────────────────────────────────────────────
// NOTE: all money fields are Decimal in Prisma → serialized as strings in JSON.
export interface Order {
  id:       number;
  orderRef: string;

  productId:  number;
  product?:   ProductRef;
  buyerId:    number;
  buyer?:     PartyRef;
  merchantId: number;
  merchant?:  PartyRef;

  requestedPlanId?: number | null;
  requestedPlan?:   PlanRef | null;

  assignedAdminId: number | null;
  assignedAdmin?:  AdminRef | null;

  // ── Pricing (Decimal → string) ──
  quantity:     number;
  unitPrice:    string;
  costAmount:   string;
  profitRate:   string;
  profitAmount: string;
  totalAmount:  string;
  downPayment:  string;

  // ── Installments ──
  numberOfInstallments: number;
  installmentAmount:    string;
  installmentFrequency: string;

  currency: string;
  status:   OrderStatus;

  rejectionReason: string | null;
  adminNotes:      string | null;

  // ── Merchant fulfillment ──
  merchantConfirmed?:   boolean;
  merchantDeclined?:    boolean;
  merchantRespondedAt?: string | null;
  declineReason?:       string | null;

  // ── Contact / delivery snapshot ──
  contactName:     string | null;
  contactEmail:    string | null;
  contactPhone:    string | null;
  deliveryAddress: string | null;

  // ── Dates ──
  submittedAt: string;
  reviewedAt:  string | null;
  approvedAt:  string | null;
  disbursedAt: string | null;
  completedAt: string | null;
  createdAt:   string;
  updatedAt:   string;
}

// ─── Query filters for fetchAllOrders ─────────────────────────────────────────
export interface OrderFilters {
  status?:          OrderStatus;
  assignedAdminId?: number;
  buyerId?:         number;
  merchantId?:      number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

// Admin updates pricing/terms (server recomputes money)
export interface UpdateOrderPayload {
  id:                    number;
  quantity?:             number;
  unitPrice?:            number;
  profitRate?:           number;
  downPayment?:          number;
  numberOfInstallments?: number;
  installmentFrequency?: string;
  currency?:             string;
  adminNotes?:           string;
  contactName?:          string;
  contactEmail?:         string;
  contactPhone?:         string;
  deliveryAddress?:      string;
}

// Admin assigns order to an admin user
export interface AssignOrderPayload {
  id:              number;
  assignedAdminId: number | null;   // null = unassign
}

// Admin transitions workflow status
export interface UpdateOrderStatusPayload {
  id:               number;
  status:           OrderStatus;
  rejectionReason?: string;  // required by backend when status === "REJECTED"
}

// ─── API Response Types ───────────────────────────────────────────────────────
interface OrderListResponse {
  message: string;
  count:   number;
  orders:  Order[];
}

interface OrderResponse {
  message: string;
  order:   Order;
}

interface DeleteOrderResponse {
  message: string;
}

// ─── State ────────────────────────────────────────────────────────────────────
interface OrderState {
  orders:       Order[];
  currentOrder: Order | null;

  ordersLoading: boolean;
  ordersError:   string | null;

  singleLoading: boolean;
  singleError:   string | null;

  actionLoading: boolean;   // shared for update/assign/status/delete
  actionError:   string | null;
}

const initialState: OrderState = {
  orders:       [],
  currentOrder: null,

  ordersLoading: false,
  ordersError:   null,

  singleLoading: false,
  singleError:   null,

  actionLoading: false,
  actionError:   null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

// ── Fetch All Orders (ADMIN) — optional query filters ──
export const fetchAllOrders = createAsyncThunk<OrderListResponse, OrderFilters | void, { rejectValue: string }>(
  "order/fetchAllOrders",
  async (filters, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams();
      if (filters) {
        if (filters.status)          qs.append("status",          filters.status);
        if (filters.assignedAdminId) qs.append("assignedAdminId", String(filters.assignedAdminId));
        if (filters.buyerId)         qs.append("buyerId",         String(filters.buyerId));
        if (filters.merchantId)      qs.append("merchantId",      String(filters.merchantId));
      }
      const query = qs.toString() ? `?${qs.toString()}` : "";
      const res  = await apiFetch(`/api/order/all${query}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Fetch Single Order (ADMIN view) ──
export const fetchOrderById = createAsyncThunk<OrderResponse, number, { rejectValue: string }>(
  "order/fetchOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const res  = await apiFetch(`/api/order/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch order");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Update Order (ADMIN — pricing/terms) ──
export const updateOrder = createAsyncThunk<OrderResponse, UpdateOrderPayload, { rejectValue: string }>(
  "order/updateOrder",
  async (payload, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const res  = await apiFetch(`/api/order/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update order");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Assign Order to Admin ──
export const assignOrder = createAsyncThunk<OrderResponse, AssignOrderPayload, { rejectValue: string }>(
  "order/assignOrder",
  async (payload, { rejectWithValue }) => {
    try {
      const { id, assignedAdminId } = payload;
      const res  = await apiFetch(`/api/order/assign/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedAdminId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign order");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Update Order Status (ADMIN — workflow transition) ──
export const updateOrderStatus = createAsyncThunk<OrderResponse, UpdateOrderStatusPayload, { rejectValue: string }>(
  "order/updateOrderStatus",
  async (payload, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const res  = await apiFetch(`/api/order/status/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update order status");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Delete Order (ADMIN) ──
export const deleteOrder = createAsyncThunk<DeleteOrderResponse & { id: number }, number, { rejectValue: string }>(
  "order/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      const res  = await apiFetch(`/api/order/delete/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete order");
      return { ...data, id };
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ─── Helper: keep list + currentOrder in sync after a mutation ─────────────────
const upsertOrder = (state: OrderState, order: Order) => {
  const idx = state.orders.findIndex((o) => o.id === order.id);
  if (idx !== -1) state.orders[idx] = order;
  if (state.currentOrder?.id === order.id) state.currentOrder = order;
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearOrdersError:  (state) => { state.ordersError  = null; },
    clearSingleError:  (state) => { state.singleError  = null; },
    clearActionError:  (state) => { state.actionError  = null; },
    clearCurrentOrder: (state) => { state.currentOrder = null; },
  },
  extraReducers: (builder) => {

    // ── Fetch All Orders ──
    builder
      .addCase(fetchAllOrders.pending,   (state) => { state.ordersLoading = true;  state.ordersError = null; })
      .addCase(fetchAllOrders.fulfilled, (state, action) => { state.ordersLoading = false; state.orders = action.payload.orders; })
      .addCase(fetchAllOrders.rejected,  (state, action) => { state.ordersLoading = false; state.ordersError = action.payload ?? "Something went wrong"; });

    // ── Fetch Single Order ──
    builder
      .addCase(fetchOrderById.pending,   (state) => { state.singleLoading = true;  state.singleError = null; })
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.singleLoading = false; state.currentOrder = action.payload.order; })
      .addCase(fetchOrderById.rejected,  (state, action) => { state.singleLoading = false; state.singleError = action.payload ?? "Something went wrong"; });

    // ── Update Order ──
    builder
      .addCase(updateOrder.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
      .addCase(updateOrder.fulfilled, (state, action) => { state.actionLoading = false; upsertOrder(state, action.payload.order); })
      .addCase(updateOrder.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });

    // ── Assign Order ──
    builder
      .addCase(assignOrder.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
      .addCase(assignOrder.fulfilled, (state, action) => { state.actionLoading = false; upsertOrder(state, action.payload.order); })
      .addCase(assignOrder.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });

    // ── Update Order Status ──
    builder
      .addCase(updateOrderStatus.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => { state.actionLoading = false; upsertOrder(state, action.payload.order); })
      .addCase(updateOrderStatus.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });

    // ── Delete Order ──
    builder
      .addCase(deleteOrder.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.orders = state.orders.filter((o) => o.id !== action.payload.id);
        if (state.currentOrder?.id === action.payload.id) state.currentOrder = null;
      })
      .addCase(deleteOrder.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });
  },
});

export const {
  clearOrdersError,
  clearSingleError,
  clearActionError,
  clearCurrentOrder,
} = orderSlice.actions;
export default orderSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectOrders        = (state: { order: OrderState }) => state.order.orders;
export const selectOrdersLoading = (state: { order: OrderState }) => state.order.ordersLoading;
export const selectOrdersError   = (state: { order: OrderState }) => state.order.ordersError;

export const selectCurrentOrder  = (state: { order: OrderState }) => state.order.currentOrder;

export const selectSingleLoading = (state: { order: OrderState }) => state.order.singleLoading;
export const selectSingleError   = (state: { order: OrderState }) => state.order.singleError;

export const selectActionLoading = (state: { order: OrderState }) => state.order.actionLoading;
export const selectActionError   = (state: { order: OrderState }) => state.order.actionError;