/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginAdmin, verifyOtpForLogin, selectAuthLoading, emailOtpSendAndVerify } from "../store/slices/adminSlice";
import { toast } from "react-toastify";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import { Input } from "../components/Input";
import { ERROR_MESSAGES } from "../constants/ERROR_MESSAGES";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 90;

// ─── OTP Dialog ───────────────────────────────────────────────────────────────
interface OtpDialogProps {
  open:     boolean;
  email:    string;
  loading:  boolean;
  onVerify: (code: string) => void;
  onResend: () => void;
  onClose:  () => void;
}

type ForgotPasswordDialogProps = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
};


const OtpDialog = ({ open, email, loading, onVerify, onResend, onClose }: OtpDialogProps) => {
  const [digits,    setDigits]    = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError,  setOtpError]  = useState<string>("");
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
      setCountdown(RESEND_SECONDS);
      setCanResend(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (!open) return;
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, open]);

  const formatTime = (s: number) =>
    `${ String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0") }`;

  const handleChange = (index: number, value: string) => {
    // Allow only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next  = [...digits];
    next[index] = digit;
    setDigits(next);
    setOtpError("");

    // Auto-advance
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }  
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next  = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      const code = digits.join("");
      if (code.length === OTP_LENGTH) onVerify(code);
    }
  };

  // Handle paste across all boxes
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === OTP_LENGTH) onVerify(pasted);
  };

  const handleSubmit = () => {
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError("Please enter all 6 digits.");
      return;
    }
    onVerify(code);
  };

  const handleResend = () => {
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setCountdown(RESEND_SECONDS);
    setCanResend(false);
    onResend();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const filled = digits.filter(Boolean).length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
          },
        },
        paper: {
          sx: {
            borderRadius: "20px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
            padding: "8px",
            overflow: "visible",

          },
        },
      }}

    >
      <DialogContent sx={{ p: "32px 36px 36px", position: "relative" }}>

        {/* Close button */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute", top: 12, right: 12,
            color: "#9CA3AF",
            "&:hover": { color: "#374151", background: "#F3F4F6" },
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>

        {/* Lock icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e8f0fe 0%, #dbeafe 100%)" }}>
            <svg className="w-8 h-8 text-[#1a3a6a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#1a2a4a] text-center mb-1">Enter OTP</h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          Enter 6-digit code sent to{" "}
          <span className="font-semibold text-[#1a3a6a]">{email}</span>
        </p>

        {/* 6 digit boxes */}
        <div className="flex items-center justify-center gap-2.5 mb-2" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`
                w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none
                transition-all duration-150 bg-gray-50
                ${digit
                  ? "border-[#1a3a6a] bg-white text-[#1a2a4a]"
                  : otpError
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 text-gray-800 focus:border-[#1a3a6a] focus:bg-white"
                }
              `}
              style={{ caretColor: "transparent" }}
            />
          ))}
        </div>

        {/* Error */}
        {otpError && (
          <p className="text-xs text-red-500 text-center mt-1 mb-3">{otpError}</p>
        )}

        {/* Resend */}
        <div className="flex justify-center mt-4 mb-6">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-sm font-semibold text-[#1a3a6a] hover:text-[#0d2a4a] transition-colors"
            >
              Resend Code
            </button>
          ) : (
            <p className="text-sm text-gray-400">
              Resend{" "}
              <span className="font-semibold text-[#1a3a6a]">{formatTime(countdown)}</span>
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || filled < OTP_LENGTH}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(90deg, #1a2a4a 0%, #2a4a7a 100%)", boxShadow: "0 4px 16px rgba(26,42,74,0.35)" }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Verifying...
            </span>
          ) : "Next"}
        </button>

      </DialogContent>
    </Dialog>
  );
};


const ForgotPasswordDialog = ({
  open,
  loading = false,
  onClose,
  onSubmit,
}: ForgotPasswordDialogProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setEmail("");
      setError("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email");
      return;
    }

    setError("");
    onSubmit(email);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
          },
        },
        paper: {
          sx: {
            borderRadius: "20px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
            padding: "8px",
            overflow: "visible",
          },
        },
      }}
    >
      <DialogContent sx={{ p: "32px 36px 36px", position: "relative" }}>

        {/* Close button */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "#9CA3AF",
            "&:hover": {
              color: "#374151",
              background: "#F3F4F6",
            },
          }}
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
        </IconButton>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #e8f0fe 0%, #dbeafe 100%)",
            }}
          >
            <svg
              className="w-12 h-12 text-[#1a3a6a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#1a2a4a] text-center mb-1">
          Forgot Password
        </h2>

        <p className="text-sm text-gray-400 text-center mb-6">
          Enter your email address to receive an OTP code.
        </p>

        {/* Email Input */}
        <div className="mb-6">
          <Input
            label="Email Address"
            name="email"
            type="email"
            required
            value={email}
            onChange={(v) => {
              setEmail(v);
              setError("");
            }}
            error={error}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background:
              "linear-gradient(90deg, #1a2a4a 0%, #2a4a7a 100%)",
            boxShadow: "0 4px 16px rgba(26,42,74,0.35)",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-12 h-12 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Sending OTP...
            </span>
          ) : (
            "Send OTP"
          )}
        </button>

      </DialogContent>
    </Dialog>
  );
};

// ─── Login Screen ─────────────────────────────────────────────────────────────
const LoginScreen = () => {
  const navigate   = useNavigate();
  const dispatch   = useAppDispatch();
  const isLoading  = useAppSelector(selectAuthLoading);

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors,     setErrors]     = useState<{ email?: string; password?: string }>({});
  const [otpOpen,    setOtpOpen]    = useState(false);   // ← controls dialog
  
  const [otpPurpose, setOtpPurpose] = useState<"LOGIN" | "FORGOT_PASSWORD">("LOGIN");
  const [isForgotPasswordModalOpen,    setIsForgotPasswordModalOpen]    = useState(false);   // ← controls dialog
  const [forgotEmail, setForgotEmail] = useState('')


  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email)                            errs.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email    = "Enter a valid email";
    if (!password)                         errs.password = "Password is required";
    return errs;
  };

  // ── Step 1: validate credentials → open OTP dialog ──
  const handleLogin = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    const result = await dispatch(loginAdmin({ email, password, role:"ADMIN" }));

    if (loginAdmin.fulfilled.match(result)) {
      if (rememberMe) localStorage.setItem("rememberedEmail", email);
      setOtpOpen(true); // ← show the dialog
    } else {
      const raw     = result.payload ?? "Login failed. Please try again.";
      const message = ERROR_MESSAGES[raw] ?? raw;
      toast.error(message);
    }
  };

  // ── Step 2: verify OTP ──
  const handleVerifyOtpLogin = async (code: string) => {
    const result = await dispatch(verifyOtpForLogin({ email, code, role:"ADMIN" }));

    if (verifyOtpForLogin.fulfilled.match(result)) {
      setOtpOpen(false);
      toast.success("Welcome back!", { autoClose: 1000 });
      navigate("/admin/dashboard");
    } else {
      const raw     = result.payload ?? "Invalid OTP. Please try again.";
      const message = ERROR_MESSAGES[raw] ?? raw;
      toast.error(message);
    }
  };

  // ── Resend: re-dispatch login (server invalidates old OTP and sends new one) ──
  const handleResendForOtpLogin = async () => {
    const result = await dispatch(loginAdmin({ email, password, role:"ADMIN" }));
    if (loginAdmin.fulfilled.match(result)) {
      toast.info("A new code has been sent.", { autoClose: 2000 });
    } else {
      toast.error("Failed to resend code. Please try again.");
    }
  };



  // --------------------------------- //
  //      Forgot Password Handlers     //
  // --------------------------------- //
  const onSubmitForgotPasswordDialog = async (email: string) => {
    const result = await dispatch(emailOtpSendAndVerify({ email, role:'ADMIN', purpose: "RESET_PASSWORD", }));

    if (emailOtpSendAndVerify.fulfilled.match(result)) {
      setIsForgotPasswordModalOpen(false)
      setOtpOpen(true);
      setForgotEmail(email)
      setOtpPurpose('FORGOT_PASSWORD')

    } else {
      const raw     = result.payload ?? "Invalid OTP. Please try again.";
      const message = ERROR_MESSAGES[raw] ?? raw;
      toast.error(message);
    }
  };

  const handleVerifyForgotPasswordOtp = async (code: string) => {

    const result = await dispatch(
      emailOtpSendAndVerify({
        email: forgotEmail,
        code,
        purpose:"RESET_PASSWORD",
        role:'ADMIN'
      })
    );

    if (emailOtpSendAndVerify.fulfilled.match(result)) {
      setOtpOpen(false);
      navigate("/forgot-password");

    } else {

      const raw = result.payload ?? "Invalid OTP";
      const message = ERROR_MESSAGES[raw] ?? raw;

      toast.error(message);
    }
  };

  const handleResendForOtpChangePassword = async () => {
    const result = await dispatch(emailOtpSendAndVerify({ email: forgotEmail, purpose: "RESET_PASSWORD",role:'ADMIN' }));
    if (emailOtpSendAndVerify.fulfilled.match(result)) {
      toast.info("A new code has been sent.", { autoClose: 2000 });
    } else {
      toast.error("Failed to resend code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #0d2a4a 0%, #1a4a7a 50%, #2a5a8a 100%)" }}>

      {/* OTP Dialog */}
      <OtpDialog
        open={otpOpen}
        email={email}
        loading={isLoading}
        onVerify={
          otpPurpose === "LOGIN"
            ? handleVerifyOtpLogin
            : handleVerifyForgotPasswordOtp
        }        
        onResend={
          otpPurpose === "LOGIN"
            ? handleResendForOtpLogin
            : handleResendForOtpChangePassword
        }        
      onClose={() => setOtpOpen(false)}
      />

      <ForgotPasswordDialog
        open={isForgotPasswordModalOpen}
        loading={isLoading}
        onSubmit={onSubmitForgotPasswordDialog}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        />
        {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-sm px-8 h-[70px] flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="w-10 h-10 bg-[#1a3a6a] rounded-sm flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none">A</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#e8a020] rounded-sm" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-black text-sm tracking-widest" style={{ color: "#e8a020" }}>
              Adnan <span className="text-[#1a3a6a]">TRADING</span>
            </span>
            <span className="text-[11px] text-gray-500 tracking-wide" style={{ fontFamily: "serif" }}>
              Invest In Future.
            </span>
          </div>
        </div>
        <button className="border-2 border-[#1a3a6a] text-[#1a3a6a] font-semibold text-sm px-6 py-2 rounded-full hover:bg-[#1a3a6a] hover:text-white transition-all duration-200">
          Contact Us
        </button>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[620px] bg-white rounded-2xl shadow-2xl shadow-black/20 p-10">

          <h1 className="text-2xl font-bold text-[#1a2a4a] text-center mb-8">Welcome back</h1>

          {/* Email */}
          <div className="mb-4">
            <div className={`border rounded-xl px-4 pt-3 pb-2.5 transition-all duration-200 ${
              errors.email ? "border-red-500 border-2" : "border-gray-200 focus-within:border-[#1a3a6a] focus-within:shadow-sm"
            }`}>
              <label className="block text-sm text-gray-600 font-medium mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Please enter"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full text-sm text-gray-800 outline-none placeholder:text-gray-300 bg-transparent"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1 pl-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="mb-5">
            <div className={`border rounded-xl px-4 pt-3 pb-2.5 transition-all duration-200 ${
              errors.password ? "border-red-500 border-2" : "border-gray-200 focus-within:border-[#1a3a6a] focus-within:shadow-sm"
            }`}>
              <label className="block text-sm text-gray-600 font-medium mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Please enter"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-300 bg-transparent"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                  {showPass ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1 pl-1">{errors.password}</p>}
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between mb-7">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                  rememberMe ? "border-[#1a3a6a] bg-[#1a3a6a]" : "border-gray-300 bg-white group-hover:border-gray-400"
                }`}
              >
                {rememberMe && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="text-sm text-gray-500">Remember me</span>
            </label>
            <button onClick={()=>{setIsForgotPasswordModalOpen(true)}} type="button" className="cursor-pointer text-sm font-semibold text-[#1a3a6a] hover:text-[#0d2a4a] transition-colors">
              Forgot password
            </button>
          </div>

          {/* Login button */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-4 rounded-xl text-white font-bold text-base tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(90deg, #4a5a8a 0%, #6a7aaa 50%, #8a9aca 100%)", boxShadow: "0 4px 20px rgba(74,90,138,0.4)" }}
          >
            {isLoading ? "Sending code..." : "Login"}
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-white/40 pb-6">©2026 Powered by Rufaad</p>
    </div>
  );
};

export default LoginScreen;