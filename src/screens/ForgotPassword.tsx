import { useEffect, useState } from "react";
import { Input } from "../components/Input";
import { useAppDispatch } from "../store/hooks";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../store/slices/adminSlice";
import { toast } from "react-toastify";
import { ERROR_MESSAGES } from "../constants/ERROR_MESSAGES";
import { apiFetch } from "../utils/apiFetch";

const ForgotPassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    const checkResetAccess = async () => {
      try {
        const res = await apiFetch("/api/auth/check-reset-access");

        if (!res.ok) {
          navigate("/");
        }
      } catch {
        navigate("/");
      }
    };

    checkResetAccess();
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          toast.error("Reset password session expired");

          navigate("/");

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      setError("Fill all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password Length should be minimum of 8 characters");
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setError("Passwords do not match");
      return;
    }

    setError("");

    const result = await dispatch(
      forgotPassword({
        password,
      }),
    );

    if (forgotPassword.fulfilled.match(result)) {
      toast.success("Password changed successfully");

      navigate("/");
    } else {
      const raw = result.payload ?? "Failed to change password";

      const message = ERROR_MESSAGES[raw] ?? raw;

      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      {/* Navbar */}
      <nav className="bg-white px-8 h-[70px] flex items-center justify-between border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none">
                R
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-secondary rounded-sm" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-black text-sm tracking-widest text-secondary">
              RUFAAD <span className="text-primary">Trading</span>
            </span>
            <span
              className="text-[11px] text-gray-500 tracking-wide"
              style={{ fontFamily: "serif" }}
            >
              Invest In Future.
            </span>
          </div>
        </div>
        <button className="border-2 border-primary text-primary font-semibold text-sm px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-200">
          Contact Us
        </button>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* subtle depth accents */}
        <div className="absolute top-[-120px] right-[-120px] w-[360px] h-[360px] rounded-full bg-white/[0.03]" />
        <div className="absolute bottom-[-140px] left-[-100px] w-[320px] h-[320px] rounded-full bg-secondary/[0.06]" />

        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl shadow-black/30 p-9 relative z-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary mb-1.5">
              Change Password
            </h1>
            <p className="text-sm text-gray-400">
              Reset session expires in{" "}
              <span className="font-bold text-red-500">
                {formatTime(timeLeft)}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              required
              value={password}
              onChange={(v) => {
                setPassword(v);
                setError("");
              }}
              error={error}
            />

            <Input
              label="Confirm New Password"
              name="confirmNewPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(v) => {
                setConfirmPassword(v);
                setError("");
              }}
              error={error}
            />

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full mt-2 py-3.5 rounded-xl bg-primary text-white font-bold text-base tracking-wide transition-all duration-200 hover:bg-[#22335a] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-white/40 pb-6 flex-shrink-0">
        ©2026 Powered by RUFAAD
      </p>
    </div>
  );
};

export default ForgotPassword;
