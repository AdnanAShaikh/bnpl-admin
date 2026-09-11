import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import UsersListingScreen from "./screens/Users/UsersListingScreen";
import RolesListingScreen from "./screens/Roles/RolesListingScreen";
import MerchantsListingScreen from "./screens/Merchants/MerchantsListingScreen";
import BuyersListingScreen from "./screens/Buyers/BuyersListingScreen";
import PaymentPlanListingScreen from "./screens/PaymentPlan/PaymentPlanListingScreen";
import OrdersListingScreen from "./screens/Orders/OrdersListingScreen";
import CreateNewBuyerScreen from "./screens/Buyers/CreateNewBuyerScreen";
import ViewBuyerScreen from "./screens/Buyers/ViewBuyerScreen";
import EditBuyerScreen from "./screens/Buyers/EditBuyerScreen";
import CreateNewMerchantScreen from "./screens/Merchants/CreateNewMerchantScreen";
import ViewMerchantScreen from "./screens/Merchants/ViewMerchantScreen";
import EditMerchantScreen from "./screens/Merchants/EditMerchantScreen";
import CreateNewRoleScreen from "./screens/Roles/CreateNewRoleScreen";
import EditRoleScreen from "./screens/Roles/EditRoleScreen";
import CreateUserScreen from "./screens/Users/CreateUserScreen";
import EditUserScreen from "./screens/Users/EditUserScreen";
import CreateNewPaymentPlanScreen from "./screens/PaymentPlan/CreateNewPaymentPlanScreen";
import EditPaymentPlanScreen from "./screens/PaymentPlan/EditPaymentPlanScreen";
import ViewPaymentPlanScreen from "./screens/PaymentPlan/ViewPaymentPlanScreen";
import NotFoundScreen from "./screens/NotFoundScreen";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  logoutAdmin,
  selectAuthUser,
  setAuthUser,
} from "./store/slices/adminSlice";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ForgotPassword from "./screens/ForgotPassword";
import { apiFetch } from "./utils/apiFetch";
import EditOrderScreen from "./screens/Orders/EditOrderScreen";

// ─── Permission Guard ─────────────────────────────────────────────────────────
// Wraps a route element and redirects to 404 if the user lacks the required permission.
// Super Admin bypasses all checks.

interface PermissionRouteProps {
  element: React.ReactElement;
  permission: string;
}

const PermissionRoute = ({ element, permission }: PermissionRouteProps) => {
  const authUser = useAppSelector(selectAuthUser);
  const navigate = useNavigate();
  const toasted = useRef(false); // prevent double-toast in StrictMode

  const isSuperAdmin = authUser?.accessRole?.roleName === "Super Admin";
  const hasPermission =
    isSuperAdmin || authUser?.accessRole?.permissions[permission] === true;

  useEffect(() => {
    if (!hasPermission && !toasted.current) {
      toasted.current = true;
      toast.error("You do not have permission to access this page.");
      navigate(-1);
    }
  }, [hasPermission, navigate]);

  // Render nothing while the effect fires (avoids a flash of the protected screen)
  if (!hasPermission) return null;

  return element;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const authUser = useAppSelector(selectAuthUser);
  const dispatch = useAppDispatch();
  const [booting, setBooting] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const boot = async () => {
      try {
        const res = await apiFetch("/api/auth/verify/adminToken");

        if (res.ok) {
          const data = await res.json();
          dispatch(setAuthUser(data.user));
        } else {
          dispatch(logoutAdmin());
        }
      } catch {
        dispatch(logoutAdmin());
      } finally {
        setBooting(false);
      }
    };

    boot();
  }, []); // run once on mount

  if (booting && location.pathname !== "/") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#1a2a4a] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Authenticating…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ── / → dashboard if logged in, login if not ── */}
      <Route
        path="/"
        element={
          authUser ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <LoginScreen />
          )
        }
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ── Admin routes — redirect to / if not logged in ── */}
      {authUser ? (
        <>
          {/* Dashboard & Orders — accessible to all authenticated users */}
          <Route path="/admin/dashboard" element={<DashboardScreen />} />
          <Route path="/admin/orders" element={<OrdersListingScreen />} />
          <Route path="/admin/orders/:id" element={<EditOrderScreen />} />

          {/* ── Products ── */}
          <Route
            path="/admin/payment-plan/all"
            element={<PaymentPlanListingScreen />}
          />
          <Route
            path="/admin/payment-plan/new"
            element={
              <PermissionRoute
                permission="products.create"
                element={<CreateNewPaymentPlanScreen />}
              />
            }
          />
          <Route
            path="/admin/payment-plan/view/:id"
            element={
              <PermissionRoute
                permission="products.view"
                element={<ViewPaymentPlanScreen />}
              />
            }
          />
          <Route
            path="/admin/payment-plan/edit/:id"
            element={
              <PermissionRoute
                permission="products.edit"
                element={<EditPaymentPlanScreen />}
              />
            }
          />

          {/* ── Admin Users ── */}
          <Route path="/admin/user/all" element={<UsersListingScreen />} />
          <Route
            path="/admin/user/new"
            element={
              <PermissionRoute
                permission="user.create"
                element={<CreateUserScreen />}
              />
            }
          />
          <Route
            path="/admin/user/edit/:id"
            element={
              <PermissionRoute
                permission="user.edit"
                element={<EditUserScreen />}
              />
            }
          />

          {/* ── Roles ── */}
          <Route path="/admin/role/all" element={<RolesListingScreen />} />
          <Route
            path="/admin/role/new"
            element={
              <PermissionRoute
                permission="roles.create"
                element={<CreateNewRoleScreen />}
              />
            }
          />
          <Route
            path="/admin/role/edit/:id"
            element={
              <PermissionRoute
                permission="roles.edit"
                element={<EditRoleScreen />}
              />
            }
          />

          {/* ── Buyers ── */}
          <Route path="/admin/buyer/all" element={<BuyersListingScreen />} />
          <Route
            path="/admin/buyer/new"
            element={
              <PermissionRoute
                permission="buyer.create"
                element={<CreateNewBuyerScreen />}
              />
            }
          />
          <Route
            path="/admin/buyer/:id"
            element={
              <PermissionRoute
                permission="buyer.view"
                element={<ViewBuyerScreen />}
              />
            }
          />
          <Route
            path="/admin/buyer/edit/:id"
            element={
              <PermissionRoute
                permission="buyer.edit"
                element={<EditBuyerScreen />}
              />
            }
          />

          {/* ── Merchants ── */}
          <Route
            path="/admin/merchant/all"
            element={<MerchantsListingScreen />}
          />
          <Route
            path="/admin/merchant/new"
            element={
              <PermissionRoute
                permission="merchant.create"
                element={<CreateNewMerchantScreen />}
              />
            }
          />
          <Route
            path="/admin/merchant/:id"
            element={
              <PermissionRoute
                permission="merchant.view"
                element={<ViewMerchantScreen />}
              />
            }
          />
          <Route
            path="/admin/merchant/edit/:id"
            element={
              <PermissionRoute
                permission="merchant.edit"
                element={<EditMerchantScreen />}
              />
            }
          />
        </>
      ) : (
        <Route path="/admin/*" element={<Navigate to="/" replace />} />
      )}

      {/* ── Catch-all → 404 ── */}
      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  );
}

export default App;
