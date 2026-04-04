/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/interview/get-interview",
          { withCredentials: true },
        );
        setInterviews(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    getMyInterviews();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white py-20 px-6 relative overflow-hidden">
      {/* 🔥 BACKGROUND GLOW */}
      <div className="absolute w-[500px] h-[500px] bg-amber-500/20 blur-[140px] -top-20 -left-20 rounded-full" />
      <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] -bottom-20 -right-20 rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="mb-16 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => navigate("/")}
            className="p-3 cursor-pointer rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            <FaArrowLeft className="text-gray-300" />
          </button>

          <div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Interview <span className="text-amber-400">History</span>
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Review your past AI interviews and performance insights
            </p>
          </div>
        </div>

        {/* EMPTY STATE */}
        {interviews.length === 0 ? (
          <div className="rounded-3xl p-px bg-gradient-to-br from-white/20 via-white/5 to-transparent">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-14 text-center">
              <p className="text-gray-400 text-lg">🚀 No interviews yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Start your first AI interview and track your growth here
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {interviews.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -6 }}
                transition={{ duration: 0.25 }}
                onClick={() => navigate(`/report/${item._id}`)}
                className="group relative cursor-pointer"
              >
                {/* GRADIENT BORDER */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

                {/* CARD */}
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-xl">
                  {/* TOP ROW */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* LEFT */}
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {item.role}
                      </h3>

                      <p className="text-sm text-gray-400 mt-1">
                        {item.experience} • {item.mode}
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-8">
                      {/* SCORE */}
                      <div className="text-right">
                        <p className="text-3xl font-bold text-amber-400">
                          {item.finalScore || 0}/10
                        </p>
                        <p className="text-xs text-gray-400">Overall Score</p>
                      </div>

                      {/* STATUS */}
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md
                        ${
                          item.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-400/20"
                            : "bg-amber-500/10 text-amber-300 border-amber-400/20"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* DIVIDER */}
                  <div className="h-px bg-white/10 my-5" />

                  {/* BOTTOM TAGS */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      🤖 AI Evaluation
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      🎤 Voice Mode
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      ⚡ Adaptive Questions
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewHistory;
