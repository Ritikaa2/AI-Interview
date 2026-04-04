/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import Auth from "../pages/Auth";
import { motion } from "framer-motion";

const AuthModel = ({ onclose }) => {
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (userData) {
      onclose();
    }
  }, [userData, onclose]);

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

      <div className="absolute w-96 h-96 bg-amber-500/20 blur-[120px] rounded-full -top-20 -left-20" />
      <div className="absolute w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full -bottom-20 -right-20" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md"
      >
        <div className="relative rounded-3xl p-px bg-linear-to-br from-amber-400/40 via-white/10 to-transparent">
          <div className="absolute inset-0 bg-amber-400/10 blur-xl opacity-40 rounded-3xl" />

          <div className="relative bg-[#0b0f14]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(251,191,36,0.15)]">
            <button
              onClick={onclose}
              className="absolute top-4 right-4 w-9 h-9 cursor-pointer flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition"
            >
              <FaTimes size={14} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white">Welcome Back</h2>

              <p className="text-gray-400 text-sm">
                Continue your AI interview journey
              </p>
            </div>

            <Auth isModel={true} />

            <p className="text-[11px] text-gray-500 text-center mt-5">
              Secure authentication • No spam • Privacy first
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModel;
