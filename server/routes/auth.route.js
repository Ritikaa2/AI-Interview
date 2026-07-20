import express from "express";
//this is for file uploading by users to upload  resume pdf 
import {
  forgotPassword,
  googleAuth,
  logOut,
  login,
  register,
  resetPassword,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/google", googleAuth);
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/logout", logOut);

export default authRouter;
