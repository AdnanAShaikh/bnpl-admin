import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutAdmin, selectAuthUser } from "../store/slices/adminSlice";
import { persistor } from "../store/persistor";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

interface SidebarItems {
  label: string;
  path: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: SidebarItems[] = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    label: "User",
    path: "/admin/user/all",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    label: "Roles",
    path: "/admin/role/all",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    label: "Merchants",
    path: "/admin/merchant/all",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    label: "Buyers",
    path: "/admin/buyer/all",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    label: "Payment Plans",
    path: "/admin/payment-plan/all",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  // {
  //   label: "GNPL Configuration",
  //   path: "/admin/gnpl",
  //   disabled: true,
  //   icon: (
  //     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
  //       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  //     </svg>
  //   ),
  // },
  // {
  //   label: "Notification Setup",
  //   path: "/admin/notifications",
  //   disabled: true,
  //   icon: (
  //     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
  //       <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  //     </svg>
  //   ),
  // },
];

// ─── Logout Confirmation Dialog ───────────────────────────────────────────────
interface LogoutDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutDialog = ({ open, onConfirm, onCancel }: LogoutDialogProps) => (
  <Dialog
    open={open}
    onClose={onCancel}
    maxWidth="xs"
    fullWidth
    slotProps={{
      backdrop: {
        sx: {
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(3px)",
        },
      },
      paper: {
        sx: {
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          padding: "8px",
        },
      },
    }}
  >
    <DialogContent sx={{ p: "32px 32px 28px" }}>
      {/* Icon */}
      <div className="flex justify-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>
      </div>

      {/* Text */}
      <h2 className="text-lg font-bold text-[#1a2a4a] text-center mb-1">
        Sign Out
      </h2>
      <p className="text-sm text-gray-400 text-center mb-7">
        Are you sure you want to sign out of your account?
      </p>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-[#1a2a4a] hover:text-[#1a2a4a] transition-all duration-200"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white font-semibold text-sm transition-all duration-200 shadow-sm"
        >
          Sign Out
        </button>
      </div>
    </DialogContent>
  </Dialog>
);

// ─── Sidebar Component ────────────────────────────────────────────────────────
interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar = ({ children }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [notifCount] = useState(3);
  const [logoutOpen, setLogoutOpen] = useState(false); // ← dialog state
  const authUser = useAppSelector(selectAuthUser);

  console.log(authUser);

  const handleLogout = async () => {
    await dispatch(logoutAdmin());
    await persistor.purge();
    persistor.flush();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">
      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        open={logoutOpen}
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className="w-[245px] flex-shrink-0 flex flex-col sticky top-0 h-screen bg-primary">
        {/* Logo */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center">
                <span className="text-white font-black text-lg">R</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-secondary rounded-sm" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-black text-xs tracking-widest text-secondary">
                RUFAAD <span className="text-white">Trading</span>
              </span>
              <span
                className="text-[10px] text-white/50 tracking-wide"
                style={{ fontFamily: "serif" }}
              >
                Invest In Future.
              </span>
            </div>
          </div>
          <div className="mt-4 border-b border-white/10" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item: SidebarItems) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => !item.disabled && navigate(item.path)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all duration-200 group
                  ${
                    active
                      ? "bg-secondary text-white"
                      : item.disabled
                        ? "text-white/30 cursor-not-allowed"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <span
                  className={`flex-shrink-0 transition-colors ${active ? "text-white" : item.disabled ? "text-white/30" : "text-white/60 group-hover:text-white"}`}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
                {active && (
                  <span className="ml-auto w-1 h-5 bg-white/40 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-[64px] bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>/</span>
            <span className="text-gray-600 font-medium capitalize">
              {location.pathname.split("/").pop() ?? "Dashboard"}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <p className="font-medium text-primary cursor-default">
              <span className="text-secondary">Hi,</span> {authUser?.name || ""}
            </p>

            {/* Logout button → opens dialog */}
            <button
              onClick={() => setLogoutOpen(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-red-500 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              LOGOUT
            </button>

            <button className="text-gray-400 hover:text-primary transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            <button className="relative text-gray-400 hover:text-primary transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default Sidebar;
