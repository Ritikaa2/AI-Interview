/* eslint-disable no-unused-vars */
import React from "react";
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { ServerUrl } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";

const Auth = ({ isModel = false }) => {
  const dispatch = useDispatch();

  const handleGoogleAuth = async () => {
    try {
      const response = await signInWithPopup(auth, provider);

      const name = response.user.displayName;
      const email = response.user.email;

      const result = await axios.post(
        ServerUrl + "/api/auth/google",
        { name, email },
        { withCredentials: true },
      );

      dispatch(setUserData(result.data));
    } catch (error) {
      console.log(error);
      dispatch(setUserData(null));
    }
  };

  return (
    <div
      className={`w-full ${
        isModel
          ? "py-6"
          : "min-h-screen flex items-center justify-center bg-gray-100 px-6"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full ${
          isModel ? "max-w-md p-8" : "max-w-lg p-12"
        } bg-white rounded-3xl shadow-xl border border-gray-200`}
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={20} />
          </div>
          <h2 className="text-lg text-amber-700 font-semibold">
            AI Interview Agent
          </h2>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-black text-center mb-4 leading-snug">
          Continue with{" "}
          <span className="bg-amber-400/10 text-amber-300 border border-amber-400/20 px-3 py-1 rounded-full inline-flex items-center gap-2">
            <IoSparkles size={16} />
            AI Smart Interview
          </span>
        </h1>

        <p className="text-gray-500 text-center text-sm md:text-base mb-8 leading-relaxed">
          Sign in to start AI-powered mock interviews, track your progress, and
          unlock detailed performance insights.
        </p>

        <motion.button
          onClick={handleGoogleAuth}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-black text-white font-medium shadow hover:shadow-lg transition cursor-pointer"
        >
          <FcGoogle size={22} />
          Continue with Google
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Auth;
