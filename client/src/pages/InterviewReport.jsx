/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import Step3Report from "../components/Step3Report";
import { motion } from "framer-motion";

const InterviewReport = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/interview/report/" + id,
          { withCredentials: true },
        );
        setReport(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchReport();
  }, []);

  /* 🔥 LOADING UI */
  if (!report) {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center relative overflow-hidden">
        {/* GLOW */}
        <div className="absolute w-[400px] h-[400px] bg-amber-500/20 blur-[120px] -top-20 -left-20 rounded-full" />
        <div className="absolute w-[300px] h-[300px] bg-emerald-500/10 blur-[120px] -bottom-20 -right-20 rounded-full" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center"
        >
          {/* LOADING CARD */}
          <div className="rounded-3xl p-px bg-gradient-to-br from-amber-400/40 via-white/10 to-transparent">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl px-10 py-8 shadow-xl">
              {/* Spinner */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              </div>

              <p className="text-gray-300 text-lg font-medium">
                Generating your AI Report...
              </p>

              <p className="text-gray-500 text-sm mt-2">
                Analyzing performance, confidence & answers
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ✅ REPORT UI WRAPPER */
  return (
    <div className="min-h-screen bg-[#0b0f14] text-white relative overflow-hidden">
      {/* BACKGROUND GLOW */}
      <div className="absolute w-[500px] h-[500px] bg-amber-500/20 blur-[140px] -top-20 -left-20 rounded-full" />
      <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] -bottom-20 -right-20 rounded-full" />

      <div className="relative z-10">
        <Step3Report report={report} />
      </div>
    </div>
  );
};

export default InterviewReport;
