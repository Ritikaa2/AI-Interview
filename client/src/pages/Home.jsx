/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthModel from "../components/AuthModel";
import Footer from "../components/Footer";
import MicButton from "../components/MicWave";
import Navbars from "../components/Navbars";
import { BsRobot, BsMic, BsClock } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import Hero from "../components/Hero";
import Newsletter from "../components/Newsletter";
import Feature from "../components/Feature";

const Home = () => {
  const userData = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    if (!userData) return setShowAuth(true);
    navigate("/interview");
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white flex flex-col relative overflow-hidden">
      <div className="absolute w-125 h-125 bg-amber-500/20 blur-[120px] rounded-full -top-20 -left-20" />
      <div className="absolute w-[100 h-100 bg-emerald-500/10 blur-[120px] rounded-full -bottom-20 -right-20" />

      <Navbars />

      <Hero handleStart={handleStart} />

      <Feature />

      {showAuth && <AuthModel onclose={() => setShowAuth(false)} />}
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Home;
