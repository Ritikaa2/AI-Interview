import React, { useEffect, useState } from "react";
import { BsCheckCircleFill, BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { auth, provider } from "../utils/firebase";
import { ServerUrl } from "../config/api.js";
import { setUserData } from "../redux/userSlice.js";

const defaultLoginForm = {
  email: "",
  password: "",
};

const defaultRegisterForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const defaultResetForm = {
  otp: "",
  password: "",
  confirmPassword: "",
};

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 40;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 64;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-z][A-Za-z\s'.-]*$/;
const passwordHint =
  "Use 8-64 characters with uppercase, lowercase, number, and special character.";

const validateEmail = (email) => {
  if (!email) {
    return "Email is required";
  }

  if (email.length > 254) {
    return "Email must be 254 characters or fewer";
  }

  if (!emailRegex.test(email)) {
    return "Enter a valid email address";
  }

  return null;
};

const validateName = (name) => {
  if (!name) {
    return "Name is required";
  }

  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    return `Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`;
  }

  if (!nameRegex.test(name)) {
    return "Name can contain only letters, spaces, apostrophes, periods, and hyphens";
  }

  return null;
};

const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }

  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    return `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`;
  }

  if (/\s/.test(password)) {
    return "Password cannot contain spaces";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number";
  }

  if (!/[^A-Za-z0-9\s]/.test(password)) {
    return "Password must include at least one special character";
  }

  return null;
};

const modeContent = {
  login: {
    title: "Sign in to AI Smart Interview",
    description:
      "Use Google or your email and password to continue your interview journey.",
  },
  register: {
    title: "Create your account",
    description:
      "Register with email and password to save interview history and credits securely.",
  },
  forgot: {
    title: "Forgot your password?",
    description:
      "Enter your email address and we will send you a secure password reset OTP.",
  },
  reset: {
    title: "Reset your password",
    description:
      "Enter the OTP from your email and create a new password for your account.",
  },
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15";

const primaryButtonClassName =
  "w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/25 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70";

const Auth = ({ isModel = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userData } = useSelector((state) => state.user);

  const queryMode = searchParams.get("mode");
  const queryEmail = searchParams.get("email") || "";
  const mode = isModel
    ? null
    : queryMode === "reset" && queryEmail
      ? "reset"
      : queryMode === "register" || queryMode === "forgot"
        ? queryMode
        : "login";

  const [modalMode, setModalMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loginForm, setLoginForm] = useState(defaultLoginForm);
  const [registerForm, setRegisterForm] = useState(defaultRegisterForm);
  const [forgotEmail, setForgotEmail] = useState(queryEmail);
  const [resetEmail, setResetEmail] = useState(queryEmail);
  const [resetForm, setResetForm] = useState(defaultResetForm);

  useEffect(() => {
    if (userData && !isModel) {
      navigate("/", { replace: true });
    }
  }, [isModel, navigate, userData]);

  const getErrorMessage = (requestError) => {
    if (requestError?.code === "auth/popup-closed-by-user") {
      return "Google sign-in was cancelled before it finished.";
    }

    return (
      requestError.response?.data?.message ||
      "Something went wrong. Please try again."
    );
  };

  const switchMode = (nextMode) => {
    setError("");
    setMessage("");

    if (isModel) {
      setModalMode(nextMode);
      return;
    }

    if (nextMode === "login") {
      navigate("/auth", { replace: true });
      return;
    }

    if (nextMode === "reset") {
      const email = (resetEmail || forgotEmail).trim().toLowerCase();
      navigate(`/auth?mode=reset&email=${encodeURIComponent(email)}`, {
        replace: true,
      });
      return;
    }

    navigate(`/auth?mode=${nextMode}`, { replace: true });
  };

  const handleAuthSuccess = (data) => {
    dispatch(setUserData(data));
    setError("");
    setMessage("");

    if (!isModel) {
      navigate("/", { replace: true });
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await signInWithPopup(auth, provider);
      const idToken = await response.user.getIdToken();
      const result = await axios.post(
        `${ServerUrl}/api/auth/google`,
        { idToken },
        { withCredentials: true },
      );

      handleAuthSuccess(result.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      dispatch(setUserData(null));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const email = loginForm.email.trim().toLowerCase();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (!loginForm.password) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const result = await axios.post(
        `${ServerUrl}/api/auth/login`,
        {
          email,
          password: loginForm.password,
        },
        { withCredentials: true },
      );
      handleAuthSuccess(result.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const name = registerForm.name.trim();
    const email = registerForm.email.trim().toLowerCase();

    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const passwordError = validatePassword(registerForm.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await axios.post(
        `${ServerUrl}/api/auth/register`,
        {
          name,
          email,
          password: registerForm.password,
        },
        { withCredentials: true },
      );
      handleAuthSuccess(result.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const email = forgotEmail.trim().toLowerCase();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);

    try {
      const result = await axios.post(
        `${ServerUrl}/api/auth/forgot-password`,
        { email },
        { withCredentials: true },
      );
      setMessage(result.data.message);
      setResetEmail(email);
      setResetForm(defaultResetForm);

      if (isModel) {
        setModalMode("reset");
      } else {
        navigate(`/auth?mode=reset&email=${encodeURIComponent(email)}`, {
          replace: true,
        });
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const email = resetEmail.trim().toLowerCase();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const otp = resetForm.otp.trim();
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP from your email");
      return;
    }

    const passwordError = validatePassword(resetForm.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (resetForm.password !== resetForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await axios.post(
        `${ServerUrl}/api/auth/reset-password`,
        {
          email,
          otp,
          password: resetForm.password,
        },
        { withCredentials: true },
      );
      dispatch(setUserData(null));
      setLoginForm(defaultLoginForm);
      setResetForm(defaultResetForm);
      setResetEmail("");
      setMessage(
        result.data.message ||
          "Password updated successfully. Please login with your new password.",
      );

      if (isModel) {
        setModalMode("login");
      } else {
        navigate("/auth", { replace: true });
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const currentMode = isModel ? modalMode : mode;
  const content = modeContent[currentMode];
  const shellClassName = isModel
    ? "w-full"
    : "min-h-screen w-full overflow-y-auto bg-[#f7f4ee] px-4 py-16 text-slate-900 sm:px-6 sm:py-20 lg:flex lg:items-center lg:justify-center lg:px-8 lg:py-24";
  const panelClassName = isModel
    ? "w-full"
    : "mx-auto grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-2xl shadow-black/15 backdrop-blur-xl lg:min-h-[760px] lg:grid-cols-[minmax(0,0.95fr)_minmax(480px,520px)]";
  const formWrapClassName = isModel
    ? "w-full"
    : "flex items-center justify-center px-4 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-20";
  const formCardClassName = isModel
    ? "w-full max-w-[520px] rounded-[28px] border border-slate-200 bg-white p-8 shadow-2xl shadow-black/10 sm:p-10"
    : "w-full max-w-[520px] rounded-[30px] border border-slate-200/80 bg-white p-8 shadow-2xl shadow-black/10 sm:p-10 lg:px-12 lg:py-14";

  return (
    <div className={shellClassName}>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={panelClassName}
      >
        {!isModel && (
          <aside className="hidden bg-[#111827] p-10 text-white lg:flex lg:flex-col lg:justify-between lg:py-14 xl:p-14">
            <div>
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-amber-200 shadow-sm">
                <BsRobot size={18} />
                AI Interview Agent
              </div>

              <h2 className="max-w-md text-4xl font-semibold leading-tight xl:text-[2.7rem]">
                Practice interviews with context from your resume.
              </h2>

              <p className="mt-5 max-w-sm text-base leading-7 text-slate-300">
                Sign in once, upload your resume, and start a focused mock
                interview with AI-generated questions and feedback.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-10">
              {["Resume AI", "Voice Q&A", "Scorecard"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-xs font-semibold text-slate-200 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>
        )}

        <div className={formWrapClassName}>
          <div className={formCardClassName}>
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="rounded-2xl bg-black p-2.5 text-white shadow-lg shadow-black/20">
            <BsRobot size={20} />
          </div>
          <h2 className="text-lg font-bold text-amber-700">
            AI Interview Agent
          </h2>
        </div>

        <h1 className="mb-5 text-center text-3xl font-bold leading-tight text-black sm:text-[2.15rem]">
          {content.title}{" "}
          <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xl font-bold text-amber-500 sm:text-2xl md:mt-0">
            <IoSparkles size={16} />
            AI Smart Interview
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-sm text-center text-sm leading-6 text-slate-500 sm:text-base">
          {content.description}
        </p>

        {(currentMode === "login" || currentMode === "register") && (
          <>
            <div className="mb-6 flex rounded-2xl bg-slate-100 p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition duration-200 ${
                  currentMode === "login"
                    ? "bg-black text-white shadow-lg shadow-black/15"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition duration-200 ${
                  currentMode === "register"
                    ? "bg-black text-white shadow-lg shadow-black/15"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Register
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-black py-3.5 text-sm font-bold text-white shadow-xl shadow-black/15 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-2xl disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70"
            >
              <FcGoogle size={22} />
              {loading ? "Please wait..." : "Continue with Google"}
            </button>

            <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.22em] text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              <span>or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          </>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <BsCheckCircleFill
                size={20}
                className="mt-0.5 shrink-0 text-emerald-500"
              />
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  OTP sent successfully
                </p>
                <p className="mt-1 text-sm text-emerald-600">{message}</p>
              </div>
            </div>
          </div>
        )}

        {currentMode === "login" && (
          <motion.form
            key="login"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
            onSubmit={handleLogin}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </span>
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                placeholder="Enter your email"
                autoComplete="email"
                maxLength={254}
                required
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                maxLength={PASSWORD_MAX_LENGTH}
                required
                className={inputClassName}
              />
            </label>

            <div className="text-right">
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-sm font-medium text-amber-600 transition hover:text-amber-700"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={primaryButtonClassName}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </motion.form>
        )}

        {currentMode === "register" && (
          <motion.form
            key="register"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
            onSubmit={handleRegister}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </span>
              <input
                type="text"
                value={registerForm.name}
                onChange={(event) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="Enter your full name"
                autoComplete="name"
                minLength={NAME_MIN_LENGTH}
                maxLength={NAME_MAX_LENGTH}
                required
                className={inputClassName}
              />
              <span className="mt-2 block text-xs text-gray-500">
                {NAME_MIN_LENGTH}-{NAME_MAX_LENGTH} characters. Letters,
                spaces, apostrophes, periods, and hyphens only.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </span>
              <input
                type="email"
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                placeholder="Enter your email"
                autoComplete="email"
                maxLength={254}
                required
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </span>
              <input
                type="password"
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                required
                className={inputClassName}
              />
              <span className="mt-2 block text-xs text-gray-500">
                {passwordHint}
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Confirm Password
              </span>
              <input
                type="password"
                value={registerForm.confirmPassword}
                onChange={(event) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                required
                className={inputClassName}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className={primaryButtonClassName}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </motion.form>
        )}

        {currentMode === "forgot" && (
          <motion.form
            key="forgot"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
            onSubmit={handleForgotPassword}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </span>
              <input
                type="email"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
                placeholder="Enter your email address"
                autoComplete="email"
                maxLength={254}
                required
                className={inputClassName}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className={primaryButtonClassName}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <button
              type="button"
              onClick={() => switchMode("login")}
              className="w-full rounded-2xl py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-black"
            >
              Back to login
            </button>
          </motion.form>
        )}

        {currentMode === "reset" && (
          <motion.form
            key="reset"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
            onSubmit={handleResetPassword}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </span>
              <input
                type="email"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                maxLength={254}
                required
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                OTP
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                value={resetForm.otp}
                onChange={(event) =>
                  setResetForm((prev) => ({
                    ...prev,
                    otp: event.target.value.replace(/\D/g, "").slice(0, 6),
                  }))
                }
                placeholder="Enter 6-digit OTP"
                autoComplete="one-time-code"
                maxLength={6}
                required
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                New Password
              </span>
              <input
                type="password"
                value={resetForm.password}
                onChange={(event) =>
                  setResetForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="Create a new password"
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                required
                className={inputClassName}
              />
              <span className="mt-2 block text-xs text-gray-500">
                {passwordHint}
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Confirm Password
              </span>
              <input
                type="password"
                value={resetForm.confirmPassword}
                onChange={(event) =>
                  setResetForm((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Confirm your new password"
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                required
                className={inputClassName}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className={primaryButtonClassName}
            >
              {loading ? "Resetting password..." : "Reset Password"}
            </button>
          </motion.form>
        )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
