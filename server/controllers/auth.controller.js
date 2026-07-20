import axios from "axios";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import genToken from "../config/token.js";
import User from "../models/user.model.js";

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

const getClearCookieOptions = () => {
  const { maxAge, ...clearCookieOptions } = getCookieOptions();
  return clearCookieOptions;
};

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizeEmailPassword = (password = "") => password.replace(/\s/g, "");

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 40;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 64;
const PASSWORD_RESET_OTP_EXPIRY_MINUTES = 15;
const EMAIL_CONFIGURATION_ERROR =
  "Email service login failed. Set EMAIL_USER to your Gmail address and EMAIL_PASS to a valid Gmail App Password in server .env, then restart the server.";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-z][A-Za-z\s'.-]*$/;

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

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = normalizeEmailPassword(process.env.EMAIL_PASS);

  if (!emailUser || !emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

const isEmailAuthError = (error) =>
  error?.code === "EAUTH" ||
  /535|Username and Password not accepted|Invalid login/i.test(
    error?.message || "",
  );

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  credits: user.credits,
  authProvider: user.authProvider,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const forgotPasswordSuccessMessage =
  "OTP sent successfully. If an account exists for this email, you will receive a password reset OTP shortly.";

const createPasswordResetOtp = () =>
  crypto.randomInt(100000, 1000000).toString();

const hashPasswordResetOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const issueAuthResponse = async (user, res, statusCode = 200) => {
  const token = await genToken(user._id);
  res.cookie("token", token, getCookieOptions());
  return res.status(statusCode).json(sanitizeUser(user));
};

const verifyGoogleAccount = async (idToken) => {
  if (!process.env.FIREBASE_WEB_API_KEY) {
    throw new Error(
      "Google auth is not configured. Add FIREBASE_WEB_API_KEY in server .env",
    );
  }

  const response = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_WEB_API_KEY}`,
    { idToken },
  );

  const googleUser = response.data?.users?.[0];

  if (!googleUser?.email) {
    throw new Error("Unable to verify the Google account");
  }

  if (!googleUser.emailVerified) {
    throw new Error("Google account email is not verified");
  }

  return {
    email: normalizeEmail(googleUser.email),
    name: googleUser.displayName?.trim() || googleUser.email.split("@")[0],
  };
};

export const googleAuth = async (req, res) => {
  try {
    const idToken = req.body.idToken;
    if (!idToken) {
      return res.status(400).json({ message: "Google ID token is required" });
    }

    const googleAccount = await verifyGoogleAccount(idToken);
    let user = await User.findOne({ email: googleAccount.email });

    if (!user) {
      user = await User.create({
        name: googleAccount.name,
        email: googleAccount.email,
        authProvider: "google",
      });
    } else if (!user.name && googleAccount.name) {
      user.name = googleAccount.name;
      await user.save();
    }
    return issueAuthResponse(user, res, 200);
  } catch (error) {
    const message =
      error?.response?.data?.error?.message === "INVALID_ID_TOKEN"
        ? "Google sign-in could not be verified. Please try again."
        : error.message || "Google sign-in failed";

    const statusCode = error?.response?.data?.error ? 401 : 500;
    return res.status(statusCode).json({ message });
  }
};

export const register = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const nameError = validateName(name);
    if (nameError) {
      return res.status(400).json({ message: nameError });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "An account already exists with this email. Sign in or use forgot password.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      authProvider: "local",
    });

    return issueAuthResponse(user, res, 201);
  } catch (error) {
    return res.status(500).json({ message: `Register Error ${error}` });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({
        message:
          "Invalid email or password. If you used Google before, continue with Google or reset your password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return issueAuthResponse(user, res, 200);
  } catch (error) {
    return res.status(500).json({ message: `Login Error ${error}` });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: forgotPasswordSuccessMessage });
    }

    const transporter = createTransporter();
    if (!transporter) {
      return res.status(500).json({
        message: "Email service is not configured. Add EMAIL_USER and EMAIL_PASS in server .env",
      });
    }

    const resetOtp = createPasswordResetOtp();

    user.resetPasswordToken = hashPasswordResetOtp(resetOtp);
    user.resetPasswordExpires =
      Date.now() + 1000 * 60 * PASSWORD_RESET_OTP_EXPIRY_MINUTES;
    await user.save();

    try {
      await transporter.sendMail({
        from: `"AI Interview Agent" <${process.env.EMAIL_USER?.trim()}>`,
        to: email,
        subject: "Reset your AI Interview password",
        text: `Your AI Interview password reset OTP is ${resetOtp}. This OTP expires in ${PASSWORD_RESET_OTP_EXPIRY_MINUTES} minutes.`,
        html: `
<div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;font-family:Arial,sans-serif;overflow:hidden">
  
  <div style="background:#111827;padding:24px;text-align:center">
    <h2 style="margin:0;color:#ffffff;">🤖 AI Interview Agent</h2>
  </div>

  <div style="padding:32px">
    <h2 style="margin:0 0 16px;color:#111827;">Reset Your Password</h2>

    <p style="color:#4b5563;line-height:1.7;">
      We received a request to reset your password for your
      <strong>AI Interview Agent</strong> account.
    </p>

    <div style="margin:30px 0;text-align:center;">
      <div style="display:inline-block;background:#f3f4f6;border:2px dashed #f59e0b;
      padding:18px 36px;border-radius:12px;font-size:34px;font-weight:bold;
      letter-spacing:10px;color:#111827;">
        ${resetOtp}
      </div>
    </div>

    <p style="text-align:center;color:#6b7280;">
      This OTP will expire in
      <strong>${PASSWORD_RESET_OTP_EXPIRY_MINUTES} minutes</strong>.
    </p>

    <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb">

    <p style="font-size:13px;color:#9ca3af;line-height:1.6;">
      If you didn't request a password reset, you can safely ignore this email.
      Never share this OTP with anyone.
    </p>
  </div>

</div>
`
      });
    } catch (sendError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      throw sendError;
    }

    return res.status(200).json({ message: forgotPasswordSuccessMessage });
  } catch (error) {
    const message = isEmailAuthError(error)
      ? EMAIL_CONFIGURATION_ERROR
      : `Forgot Password Error ${error.message || error}`;

    return res.status(500).json({ message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp ?? "").trim();
    const password = req.body.password;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, OTP and password are required" });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "Enter a valid 6-digit OTP" });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: hashPasswordResetOtp(otp),
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "OTP is invalid or expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.authProvider = "local";
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.clearCookie("token", getClearCookieOptions());
    return res.status(200).json({
      message: "Password updated successfully. Please login with your new password.",
    });
  } catch (error) {
    return res.status(500).json({ message: `Reset Password Error ${error}` });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", getClearCookieOptions());
    return res.status(200).json({ message: "LogOut Successfully!" });
  } catch (error) {
    return res.status(500).json({ message: `Logout Error ${error}` });
  }
};























