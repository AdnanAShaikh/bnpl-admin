/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../utils/apiFetch";

// ─── Shared Base Types ────────────────────────────────────────────────────────
interface UserInfo {
  id:         number;
  email:      string;
  role:       string;
  isDisabled: boolean;
  createdAt:  string;
  name?:      string;
}

interface CompanyDetails {
  id:                     number;
  companyName:            string;
  companyType:            string;
  companyRegistrationNo:  string;
  corporateTelephone:     string;
  operationLicenseNo:     string | null;
  operationLicenseExpiry: string | null;
  sagiaNumber:            string | null;
  companyPresence:        string | null;
  ecommerceUrl:           string | null;
  annualTurnover:         number | null;
  numberOfEmployees:      number | null;
}

interface PowerOfAttorney {
  id:              number;
  title:           string;
  firstName:       string;
  lastName:        string;
  mobileNumber:    string;
  homeAddress:     string;
  city:            string;
  district:        string;
  postalCode:      string;
  nationalIdNumber:string;
  nationality:     string | null;
  dateOfBirth:     string | null;
  placeOfBirth:    string | null;
}

interface GNPLConfig {
  id:             number;
  invoicingEmail: string;
  invoicingMobile:string;
  payoutPlan:     string;
}

// ─── Entity Types ─────────────────────────────────────────────────────────────
export interface Buyer {
  id:              number;
  userId:          number;
  status:          string;
  createdAt:       string;
  user:            UserInfo;
  companyDetails:  CompanyDetails;
  powerOfAttorney: PowerOfAttorney;
  documents:       any[];
  eligiblePlans?:  { id: number; planName: string }[];   // ← add

}

export interface Merchant {
  id:              number;
  userId:          number;
  status:          string;
  createdAt:       string;
  user:            UserInfo;
  companyDetails:  CompanyDetails;
  powerOfAttorney: PowerOfAttorney;
  documents:       any[];
  gnplConfig:      GNPLConfig | null;
}

// ─── Shared Input Payload Types ───────────────────────────────────────────────

interface BuyerCompanyPayload {
  companyName:             string;
  companyRegistrationNo:   string;
  corporateTelephone:      string;
  companyType:             string;
  operationLicenseNo?:     string;
  operationLicenseExpiry?: string;
  sagiaNumber?:            string;
}

// Merchant company extends buyer company with extra fields
interface MerchantCompanyPayload extends BuyerCompanyPayload {
  companyPresence:  string;
  ecommerceUrl?:    string;
  annualTurnover:   number | undefined;
  numberOfEmployees:number | undefined;
}

interface BuyerAttorneyPayload {
  title:           string;
  firstName:       string;
  lastName:        string;
  mobileNumber:    string;
  homeAddress:     string;
  city:            string;
  district:        string;
  postalCode:      string;
  nationalIdNumber:string;
}

// Merchant attorney extends buyer attorney with extra fields
interface MerchantAttorneyPayload extends BuyerAttorneyPayload {
  nationality: string;
  dateOfBirth: string;
  placeOfBirth:string;
}

interface GNPLPayload {
  invoicingEmail:  string;
  invoicingMobile: string;
  payoutPlan:      string;
}

// ─── Create Payloads ──────────────────────────────────────────────────────────
export interface CreateBuyerPayload {
  name:     string;
  email:    string;
  password: string;
}

export interface CreateMerchantPayload {
  name:     string;
  email:    string;
  password: string;
}

// CreateMerchantResponse stays the same

// ─── Update Payloads ──────────────────────────────────────────────────────────
export interface UpdateBuyerPayload {
  id:           number;
  status?:      string;
  companyData?: BuyerCompanyPayload;
  attorneyData?:BuyerAttorneyPayload;
  eligiblePlanIds?: number[];                             

}

export interface UpdateMerchantPayload {
  id:           number;
  name?:         string;
  status?:      string;
  companyData?: MerchantCompanyPayload;
  attorneyData?:MerchantAttorneyPayload;
  gnplData?:    GNPLPayload;
}

// ─── API Response Types ───────────────────────────────────────────────────────
interface BuyerListResponse {
  message: string;
  count:   number;
  buyers:  Buyer[];
}

interface MerchantListResponse {
  message:   string;
  count:     number;
  merchants: Merchant[];
}

interface CreateBuyerResponse {
  message: string;
  user:    UserInfo & { buyer: Buyer };
}

interface CreateMerchantResponse {
  message: string;
  user:    UserInfo & { merchant: Merchant };
}

interface UpdateBuyerResponse {
  message: string;
  buyer:   Buyer;
}

interface UpdateMerchantResponse {
  message:  string;
  merchant: Merchant;
}

//  Roles
// ─── Role Types ───────────────────────────────────────────────────────────────
export interface AccessRole {
  id:          number;
  roleName:    string;
  status:      string;
  permissions: Record<string, boolean>;
  createdAt:   string;
  updatedAt:   string;
  _count?:     { users: number };
}

interface RoleListResponse {
  message: string;
  count:   number;
  roles:   AccessRole[];
}

interface RoleResponse {
  message: string;
  role:    AccessRole;
}

interface DeleteRoleResponse {
  message: string;
}

export interface CreateRolePayload {
  roleName:    string;
  status:      string;
  permissions: Record<string, boolean>;
}

export interface UpdateRolePayload {
  id:           number;
  roleName?:    string;
  status?:      string;
  permissions?: Record<string, boolean>;
}

export interface AdminUser {
  id:          number;
  email:       string;
  name:        string | null;
  staffId:     string | null;
  department:  string | null;
  dateOfBirth: string | null;
  isDisabled:  boolean;
  createdAt:   string;
  updatedAt:   string;
  accessRole:  { id: number; roleName: string } | null;
}

export interface UserListResponse {
  message: string;
  count:   number;
  users:   AdminUser[];
}

export interface UserResponse {
  message: string;
  user:    AdminUser;
}

export interface CreateUserPayload {
  email:        string;
  password:     string;
  name?:        string;
  staffId?:     string;
  dateOfBirth?: string;
  department?:  string;
  accessRoleId?: number;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {
  id:         number;
  isDisabled?: boolean;
}

export interface PaymentPlan {
  id:                number;
  planName:          string;
  status:            "Active" | "Inactive";
  termType:          "Daily" | "Weekly" | "Biweekly" | "Monthly";
  termValue:         number;
  minimumAmount:     string; // Because Decimal is "5.00" in Prisma decimal
  maximumAmount:     string;
  profitRate:        string;
  termDescription:   string | null;
  arabicDescription: string | null;
  additionalNotes:   string | null;
  currency:          string;
  createdAt:         string;
  updatedAt:         string;
}

export interface PaymentPlanListResponse {
  message:      string;
  count:        number;
  paymentPlans: PaymentPlan[];
}

export interface CreatePaymentPlanResponse {
  message:     string;
  paymentPlan: PaymentPlan;
}

export interface DeletePaymentPlanResponse {
  message: string;
}

export interface CreatePaymentPlanPayload {
  planName:          string;
  termValue:         number;
  minimumAmount:     number;
  maximumAmount:     number;
  profitRate:        number;
  status?:           "Active" | "Inactive";
  termType?:         "Daily" | "Weekly" | "Biweekly" | "Monthly";
  termDescription?:  string;
  arabicDescription?:string;
  additionalNotes?:  string;
  currency?:         string;
}

export interface UpdatePaymentPlanPayload extends Partial<CreatePaymentPlanPayload> {
  id: number;
}

export interface AuthUser {
  id:         number;
  email:      string;
  name:       string | null;
  role:       string;
  staffId:    string | null;
  department: string | null;
  isDisabled: boolean;
  accessRole: { id: number; roleName: string; permissions: Record<string, boolean> } | null;
}

export interface LoginPayload {
  email:    string;
  password: string;
  role: string
}

export interface LoginResponse {
  message: string;
  token:   string;
  user:    AuthUser;
}

// ── Types ──
interface DeleteDocumentResponse {
  message: string;
}

type EmailOtpPayload = {
  email: string;
  code?: string;
  purpose?: string
  role?: string
};

type EmailOtpResponse = {
  message: string;
  sent?: boolean;
  verified?: boolean;
  resetPasswordToken?: string
};

// ─── State ────────────────────────────────────────────────────────────────────
interface AdminState {
  buyers:           Buyer[];
  merchants:        Merchant[];
  roles:            AccessRole[];   // ← add
  users:            AdminUser[];
  paymentPlan:      PaymentPlan[];  // ← you started renaming but missed the array name
  authUser:         AuthUser | null;


  buyersLoading:    boolean;
  merchantsLoading: boolean;
  actionLoading:    boolean; // shared loading for all create/update actions
  rolesLoading:     boolean;        // ← add
  usersLoading:     boolean;
  paymentPlanLoading:    boolean;
  authLoading:  boolean;

  buyersError:      string | null;
  merchantsError:   string | null;
  actionError:      string | null;
  rolesError:       string | null;  // ← add
  usersError:       string | null;
  paymentPlanError:    string | null;
  authError:    string | null;

}

const initialState: AdminState = {
  buyers:           [],
  merchants:        [],
  roles:            [], 
  users:            [],
  paymentPlan:            [],
  authUser:    null,


  buyersLoading:    false,
  merchantsLoading: false,
  actionLoading:    false,
  rolesLoading:     false,          // ← add
  usersLoading:     false,
  paymentPlanLoading:     false,
  authLoading: false,


  buyersError:      null,
  merchantsError:   null,
  actionError:      null,
  rolesError:       null,  // ← add
  usersError:       null,
  paymentPlanError:       null,
  authError:   null,
  
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

// ── Fetch ──
export const fetchAllBuyers = createAsyncThunk<BuyerListResponse, void, { rejectValue: string }>(
  "admin/fetchAllBuyers",
  async (_, { rejectWithValue }) => {
    try {
      const res  = await apiFetch("/api/buyer/buyers/all");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch buyers");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

export const fetchAllMerchants = createAsyncThunk<MerchantListResponse, void, { rejectValue: string }>(
  "admin/fetchAllMerchants",
  async (_, { rejectWithValue }) => {
    try {
      const res  = await apiFetch("/api/merchant/merchants/all");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch merchants");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Create ──
export const createNewBuyer = createAsyncThunk<CreateBuyerResponse, CreateBuyerPayload, { rejectValue: string }>(
  "admin/createNewBuyer",
  async (payload, { rejectWithValue }) => {
    try {
      const res  = await apiFetch("/api/buyer/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create buyer");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

export const createNewMerchant = createAsyncThunk<CreateMerchantResponse, CreateMerchantPayload, { rejectValue: string }>(
  "admin/createNewMerchant",
  async (payload, { rejectWithValue }) => {
    try {
      const res  = await apiFetch("/api/merchant/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create merchant");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Update ──
export const updateBuyer = createAsyncThunk<UpdateBuyerResponse, UpdateBuyerPayload, { rejectValue: string }>(
  "admin/updateBuyer",
  async (payload, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const res  = await apiFetch(`/api/buyer/update/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update buyer");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

export const updateMerchant = createAsyncThunk<UpdateMerchantResponse, UpdateMerchantPayload, { rejectValue: string }>(
  "admin/updateMerchant",
  async (payload, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const res  = await apiFetch(`/api/merchant/update/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update merchant");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Fetch Roles ──
export const fetchAllRoles = createAsyncThunk<RoleListResponse, void, { rejectValue: string }>(
  "admin/fetchAllRoles",
  async (_, { rejectWithValue }) => {
    try {
      const res  = await apiFetch("/api/role/all");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch roles");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Create Role ──
export const createNewRole = createAsyncThunk<RoleResponse, CreateRolePayload, { rejectValue: string }>(
  "admin/createNewRole",
  async (payload, { rejectWithValue }) => {
    try {
      const res  = await apiFetch("/api/role/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create role");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Update Role ──
export const updateRole = createAsyncThunk<RoleResponse, UpdateRolePayload, { rejectValue: string }>(
  "admin/updateRole",
  async (payload, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const res  = await apiFetch(`/api/role/update/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update role");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Delete Role ──
export const deleteRole = createAsyncThunk<DeleteRoleResponse & { id: number }, number, { rejectValue: string }>(
  "admin/deleteRole",
  async (id, { rejectWithValue }) => {
    try {
      const res  = await apiFetch(`/api/role/delete/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete role");
      return { ...data, id }; // pass id back so we can remove from state
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);


// ── Fetch All Admin Users ──
export const fetchAllAdminUsers = createAsyncThunk<UserListResponse, void, { rejectValue: string }>(
  "admin/fetchAllAdminUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res  = await apiFetch("/api/adminUser/all");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Create Admin User ──
export const createAdminUser = createAsyncThunk<UserResponse, CreateUserPayload, { rejectValue: string }>(
  "admin/createAdminUser",
  async (payload, { rejectWithValue }) => {
    try {
      const res  = await apiFetch("/api/adminUser/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create user");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Update Admin User ──
export const updateAdminUser = createAsyncThunk<UserResponse, UpdateUserPayload, { rejectValue: string }>(
  "admin/updateAdminUser",
  async (payload, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const res  = await apiFetch(`/api/adminUser/update/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update user");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);


// Payment Plan

// ── Fetch All Payment Plan ──
export const fetchAllPaymentPlans = createAsyncThunk<PaymentPlanListResponse, void, { rejectValue: string }>(
  "admin/fetchAllPaymentPlans",
  async (_, { rejectWithValue }) => {
    try {
      const res  = await apiFetch("/api/payment-plan/all");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch payment plans!");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Create Payment Plan ──
export const createPaymentPlan = createAsyncThunk<CreatePaymentPlanResponse, CreatePaymentPlanPayload, { rejectValue: string }>(
  "admin/createPaymentPlan",
  async (payload, { rejectWithValue }) => {
    try {
      const res  = await apiFetch("/api/payment-plan/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create payment plan!");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Update Payment Plan ──
export const updatePaymentPlan = createAsyncThunk<CreatePaymentPlanResponse, UpdatePaymentPlanPayload, { rejectValue: string }>(
  "admin/updatePaymentPlan",
  async (payload, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const res  = await apiFetch(`/api/payment-plan/update/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update payment plan!");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

// ── Delete Payment Plan ──
export const deletePaymentPlan = createAsyncThunk<DeletePaymentPlanResponse & { id: number }, number, { rejectValue: string }>(
  "admin/deletePaymentPlan",
  async (id, { rejectWithValue }) => {
    try {
      const res  = await apiFetch(`/api/payment-plan/delete/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete payment plan!");
      return { ...data, id }; // pass id back so we can remove from state
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);


export const loginAdmin = createAsyncThunk<LoginResponse, LoginPayload, { rejectValue: string }>(
  "admin/loginAdmin",
  async (payload, { rejectWithValue }) => {
    try {
      const res  = await apiFetch("/api/auth/login", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

export const logoutAdmin = createAsyncThunk<void, void, { rejectValue: string }>(
  "admin/logoutAdmin",
  async (_, { rejectWithValue }) => {
    try {
      await apiFetch("/api/auth/logout/admin", {
        method:      "POST",
      });

    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

export const verifyOtpForLogin = createAsyncThunk<LoginResponse, { email: string; role: string; code: string }, { rejectValue: string }>(
  "admin/verifyOtpForLogin",
  async (payload, { rejectWithValue }) => {
    try {
      const res  = await apiFetch("/api/auth/login/verify-otp", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);
// ── Thunk ──
export const deleteDocument = createAsyncThunk<
  DeleteDocumentResponse & { id: number },
  number,
  { rejectValue: string }
>(
  "admin/deleteDocument",
  async (id, { rejectWithValue }) => {
    try {
      const res  = await apiFetch(`/api/document/delete/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete document");
      return { ...data, id };
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

export const emailOtpSendAndVerify = createAsyncThunk<
  EmailOtpResponse,
  EmailOtpPayload,
  { rejectValue: string }
>(
  "auth/emailOtpSendAndVerify",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "OTP request failed"
        );
      }

      return data;

    } catch (err: any) {
      return rejectWithValue(
        err.message || "Something went wrong"
      );
    }
  }
);


export const forgotPassword =
  createAsyncThunk<
    { message: string },
    { password: string },
    { rejectValue: string }
  >(
    "auth/forgotPassword",

    async (
      payload,
      { rejectWithValue }
    ) => {

      try {

        const res = await apiFetch(
          "/api/auth/forgot-password",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(payload),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
            "Password reset failed"
          );
        }

        return data;

      } catch (err: any) {

        return rejectWithValue(
          err.message ||
          "Something went wrong"
        );

      }
    }
  );


// ─── Slice ────────────────────────────────────────────────────────────────────
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearBuyersError:   (state) => { state.buyersError   = null; },
    clearMerchantsError:(state) => { state.merchantsError = null; },
    clearActionError:   (state) => { state.actionError   = null; },
    setAuthUser: (state, action) => {
      state.authUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Buyers ──
    builder
      .addCase(fetchAllBuyers.pending,   (state) => { state.buyersLoading = true;  state.buyersError = null; })
      .addCase(fetchAllBuyers.fulfilled, (state, action) => { state.buyersLoading = false; state.buyers = action.payload.buyers; })
      .addCase(fetchAllBuyers.rejected,  (state, action) => { state.buyersLoading = false; state.buyersError = action.payload ?? "Something went wrong"; });

    // ── Fetch Merchants ──
    builder
      .addCase(fetchAllMerchants.pending,   (state) => { state.merchantsLoading = true;  state.merchantsError = null; })
      .addCase(fetchAllMerchants.fulfilled, (state, action) => { state.merchantsLoading = false; state.merchants = action.payload.merchants; })
      .addCase(fetchAllMerchants.rejected,  (state, action) => { state.merchantsLoading = false; state.merchantsError = action.payload ?? "Something went wrong"; });

    // ── Create Buyer ──
    builder
      .addCase(createNewBuyer.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
      .addCase(createNewBuyer.fulfilled, (state) => { state.actionLoading = false; })
      .addCase(createNewBuyer.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });

    // ── Create Merchant ──
    builder
      .addCase(createNewMerchant.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
      .addCase(createNewMerchant.fulfilled, (state) => { state.actionLoading = false; })
      .addCase(createNewMerchant.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });

    // ── Update Buyer ──
    builder
      .addCase(updateBuyer.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
      .addCase(updateBuyer.fulfilled, (state, action) => {
        state.actionLoading = false;
        const idx = state.buyers.findIndex((b) => b.id === action.payload.buyer.id);
        if (idx !== -1) state.buyers[idx] = action.payload.buyer;
      })
      .addCase(updateBuyer.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });

    // ── Update Merchant ──
    builder
      .addCase(updateMerchant.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
      .addCase(updateMerchant.fulfilled, (state, action) => {
        state.actionLoading = false;
        const idx = state.merchants.findIndex((m) => m.id === action.payload.merchant.id);
        if (idx !== -1) state.merchants[idx] = action.payload.merchant;
      })
      .addCase(updateMerchant.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });
  
    // roles
    // ── Fetch Roles ──
      builder
        .addCase(fetchAllRoles.pending,   (state) => { state.rolesLoading = true;  state.rolesError = null; })
        .addCase(fetchAllRoles.fulfilled, (state, action) => { state.rolesLoading = false; state.roles = action.payload.roles; })
        .addCase(fetchAllRoles.rejected,  (state, action) => { state.rolesLoading = false; state.rolesError = action.payload ?? "Something went wrong"; });

      // ── Create Role ──
      builder
        .addCase(createNewRole.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
        .addCase(createNewRole.fulfilled, (state, action) => {
          state.actionLoading = false;
          state.roles.unshift(action.payload.role); // add to top of list
        })
        .addCase(createNewRole.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });

      // ── Update Role ──
      builder
        .addCase(updateRole.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
        .addCase(updateRole.fulfilled, (state, action) => {
          state.actionLoading = false;
          const idx = state.roles.findIndex((r) => r.id === action.payload.role.id);
          if (idx !== -1) state.roles[idx] = action.payload.role;
        })
        .addCase(updateRole.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });

      // ── Delete Role ──
      builder
        .addCase(deleteRole.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
        .addCase(deleteRole.fulfilled, (state, action) => {
          state.actionLoading = false;
          state.roles = state.roles.filter((r) => r.id !== action.payload.id);
        })
        .addCase(deleteRole.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; }); 
    
    // ── Fetch All Admin Users ──
      builder
        .addCase(fetchAllAdminUsers.pending,   (state) => { state.usersLoading = true;  state.usersError = null; })
        .addCase(fetchAllAdminUsers.fulfilled, (state, action) => { state.usersLoading = false; state.users = action.payload.users; })
        .addCase(fetchAllAdminUsers.rejected,  (state, action) => { state.usersLoading = false; state.usersError = action.payload ?? "Something went wrong"; });

      // ── Create Admin User ──
      builder
        .addCase(createAdminUser.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
        .addCase(createAdminUser.fulfilled, (state, action) => {
          state.actionLoading = false;
          state.users.unshift(action.payload.user); // add to top of list
        })
        .addCase(createAdminUser.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });

      // ── Update Admin User ──
      builder
        .addCase(updateAdminUser.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
        .addCase(updateAdminUser.fulfilled, (state, action) => {
          state.actionLoading = false;
          const idx = state.users.findIndex((u) => u.id === action.payload.user.id);
          if (idx !== -1) state.users[idx] = action.payload.user;
        })
        .addCase(updateAdminUser.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });


        // Payment Plan
          builder
            .addCase(fetchAllPaymentPlans.pending,   (state) => { state.paymentPlanLoading = true;  state.paymentPlanError = null; })
            .addCase(fetchAllPaymentPlans.fulfilled, (state, action) => { state.paymentPlanLoading = false; state.paymentPlan = action.payload.paymentPlans; })
            .addCase(fetchAllPaymentPlans.rejected,  (state, action) => { state.paymentPlanLoading = false; state.paymentPlanError = action.payload ?? "Something went wrong"; });

          // ── Create Payment Plan ──
          builder
            .addCase(createPaymentPlan.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
            .addCase(createPaymentPlan.fulfilled, (state, action) => {
              state.actionLoading = false;
              state.paymentPlan.unshift(action.payload.paymentPlan); // add to top of list
            })
            .addCase(createPaymentPlan.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });

          // ── Update Payment Plan ──
          builder
            .addCase(updatePaymentPlan.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
            .addCase(updatePaymentPlan.fulfilled, (state, action) => {
              state.actionLoading = false;
              const idx = state.paymentPlan.findIndex((p) => p.id === action.payload.paymentPlan.id);
              if (idx !== -1) state.paymentPlan[idx] = action.payload.paymentPlan;
            })
            .addCase(updatePaymentPlan.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });

          // ── Delete Payment Plan ──
          builder
            .addCase(deletePaymentPlan.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
            .addCase(deletePaymentPlan.fulfilled, (state, action) => {
              state.actionLoading = false;
              state.paymentPlan = state.paymentPlan.filter((p) => p.id !== action.payload.id);
            })
            .addCase(deletePaymentPlan.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload ?? "Something went wrong"; });


            // ── Login (step 1 — just sends OTP, no user yet) ──
            builder
              .addCase(loginAdmin.pending,   (state) => { state.authLoading = true;  state.authError = null; })
              .addCase(loginAdmin.fulfilled, (state) => {
                state.authLoading = false;
                // no user yet — OTP hasn't been verified
              })
              .addCase(loginAdmin.rejected,  (state, action) => {
                state.authLoading = false;
                state.authError   = action.payload ?? "Login failed";
              });

            // ── Verify OTP (step 2 — this is where user is set) ──
            builder
              .addCase(verifyOtpForLogin.pending,   (state) => { state.authLoading = true;  state.authError = null; })
              .addCase(verifyOtpForLogin.fulfilled, (state, action) => {
                state.authLoading = false;
                state.authUser    = action.payload.user; // ← user set here now, not in loginAdmin
              })
              .addCase(verifyOtpForLogin.rejected,  (state, action) => {
                state.authLoading = false;
                state.authError   = action.payload ?? "OTP verification failed";
              });

            // ── Logout ──
            builder
              .addCase(logoutAdmin.fulfilled, (state) => {
                state.authUser  = null;
                state.authError = null;
              });


      },
});

export const { setAuthUser, clearBuyersError, clearMerchantsError, clearActionError } = adminSlice.actions;
export default adminSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectBuyers           = (state: { admin: AdminState }) => state.admin.buyers;
export const selectMerchants        = (state: { admin: AdminState }) => state.admin.merchants;
export const selectBuyersLoading    = (state: { admin: AdminState }) => state.admin.buyersLoading;
export const selectMerchantsLoading = (state: { admin: AdminState }) => state.admin.merchantsLoading;
export const selectActionLoading    = (state: { admin: AdminState }) => state.admin.actionLoading;
export const selectBuyersError      = (state: { admin: AdminState }) => state.admin.buyersError;
export const selectMerchantsError   = (state: { admin: AdminState }) => state.admin.merchantsError;
export const selectActionError      = (state: { admin: AdminState }) => state.admin.actionError;

export const selectRoles        = (state: { admin: AdminState }) => state.admin.roles;
export const selectRolesLoading = (state: { admin: AdminState }) => state.admin.rolesLoading;
export const selectRolesError   = (state: { admin: AdminState }) => state.admin.rolesError;

export const selectUsers        = (state: { admin: AdminState }) => state.admin.users;
export const selectUsersLoading = (state: { admin: AdminState }) => state.admin.usersLoading;
export const selectUsersError   = (state: { admin: AdminState }) => state.admin.usersError;


export const selectPaymentPlan        = (state: { admin: AdminState }) => state.admin.paymentPlan;
export const selectPaymentPlanLoading = (state: { admin: AdminState }) => state.admin.paymentPlanLoading;
export const selectPaymentPlanError   = (state: { admin: AdminState }) => state.admin.paymentPlanError;

export const selectAuthUser    = (state: { admin: AdminState }) => state.admin.authUser;
export const selectAuthLoading = (state: { admin: AdminState }) => state.admin.authLoading;
export const selectAuthError   = (state: { admin: AdminState }) => state.admin.authError;

