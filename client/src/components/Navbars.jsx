/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import AuthModel from "./AuthModel";

const Navbars = () => {
  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const popupRef = useRef();

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowUserPopup(false);
        setShowCreditPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-center px-4 pt-6 relative z-50">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl 
        bg-white/5 backdrop-blur-xl 
        border border-white/10 
        rounded-2xl 
        px-6 py-3 
        flex justify-between items-center 
        shadow-lg relative z-50"
      >
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="bg-amber-500 text-black p-2 rounded-lg shadow-md">
            <BsRobot size={18} />
          </div>
          <h1 className="font-semibold hidden md:block text-lg">
            AI Interview
          </h1>
        </div>

        <div className="flex items-center gap-4 relative" ref={popupRef}>
          <div className="relative">
            <button
              onClick={() => {
                if (!userData) return setShowAuth(true);
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 cursor-pointer
              bg-white/5 border border-white/10 
              px-4 py-2 rounded-full 
              hover:bg-white/10 transition"
            >
              <BsCoin />
              <span>{userData?.credits || 0}</span>
            </button>

            <AnimatePresence>
              {showCreditPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-64 
                  bg-[#0b0f14]/95 backdrop-blur-xl
                  border border-white/10 
                  rounded-xl p-5 shadow-xl z-100"
                >
                  <p className="text-sm text-gray-400 mb-4">
                    Need more credits to continue interviews?
                  </p>

                  <button
                    onClick={() => navigate("/pricing")}
                    className="w-full cursor-pointer bg-amber-500 text-black py-2 rounded-lg text-sm font-medium"
                  >
                    Buy Credits
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 👤 USER */}
          <div className="relative">
            <button
              onClick={() => {
                if (!userData) return setShowAuth(true);
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="w-9 h-9 cursor-pointer bg-white/10 border border-white/10 
              rounded-full flex items-center justify-center"
            >
              {userData ? (
                userData?.name?.slice(0, 1).toUpperCase()
              ) : (
                <FaUserAstronaut size={16} />
              )}
            </button>

            <AnimatePresence>
              {showUserPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-52 
                  bg-[#0b0f14]/95 backdrop-blur-xl
                  border border-white/10 
                  rounded-xl p-4 shadow-xl z-100"
                >
                  <p className="text-amber-400 font-medium mb-2">
                    {userData?.name}
                  </p>

                  <button
                    onClick={() => navigate("/history")}
                    className="w-full cursor-pointer text-left text-sm py-2 text-gray-300 hover:text-white transition"
                  >
                    Interview History
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full cursor-pointer text-left text-sm py-2 flex items-center gap-2 text-red-400 hover:text-red-300 transition"
                  >
                    <HiOutlineLogout size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {showAuth && <AuthModel onclose={() => setShowAuth(false)} />}
    </div>
  );
};

export default Navbars;
