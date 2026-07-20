/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaChartLine,
  FaCheckCircle,
  FaExclamationCircle,
  FaFileUpload,
  FaMicrophoneAlt,
  FaUserTie,
} from "react-icons/fa";
import { ServerUrl } from "../config/api.js";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
//It collects user details, uploads and analyzes the resume using AI, 
// and sends all information to the backend
const Step1SetUp = ({ onStart }) => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const getErrorMessage = (requestError) =>
    requestError.response?.data?.message ||
    requestError.message ||
    "Something went wrong. Please try again.";

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;

    if (resumeFile.type !== "application/pdf") {
      setError("Please upload a PDF resume.");
      return;
    }

    setError("");
    setNotice("");
    setAnalyzing(true);

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/resume",
        formData,
        { withCredentials: true },
      );

      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || "");
      setAnalysisDone(true);
      setNotice("Resume analyzed successfully. Review the details and start your interview.");
    } catch (error) {
      console.log(error);
      setError(getErrorMessage(error));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    if (!userData) {
      setError("Please login before starting an interview.");
      return;
    }

    if (!role.trim() || !experience.trim()) {
      setError("Role and experience are required to start the interview.");
      return;
    }

    setError("");
    setNotice("");
    setLoading(true);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/generate-questions",
        {
          role: role.trim(),
          experience: experience.trim(),
          mode,
          resumeText,
          projects,
          skills,
        },
        { withCredentials: true },
      );

      if (!result.data?.questions?.length) {
        throw new Error("Interview questions were not generated. Please try again.");
      }

      dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }));
      onStart(result.data);
    } catch (error) {
      console.log(error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-[#0b0f14] text-white flex items-center justify-center px-4 relative overflow-hidden"
    >
      <div className="absolute w-[500px] h-[500px] bg-amber-500/20 blur-[140px] -top-20 -left-20 rounded-full" />
      <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] -bottom-20 -right-20 rounded-full" />

      <div className="relative w-full max-w-6xl grid md:grid-cols-2 rounded-3xl overflow-hidden">
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 p-12 flex flex-col justify-center"
        >
          <h2 className="text-4xl font-semibold mb-6">
            Start Your <span className="text-amber-400">AI Interview</span>
          </h2>

          <p className="text-gray-400 mb-10">
            Practice real interview scenarios powered by AI and improve faster.
          </p>

          <div className="space-y-5">
            {[
              {
                icon: <FaUserTie />,
                text: "Choose Role & Experience",
              },
              {
                icon: <FaMicrophoneAlt />,
                text: "Voice Interview Simulation",
              },
              {
                icon: <FaChartLine />,
                text: "AI Performance Feedback",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl"
              >
                <div className="text-amber-400">{item.icon}</div>
                <span className="text-gray-300 text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 p-12"
        >
          <h2 className="text-3xl font-bold mb-8">Interview Setup</h2>

          <div className="space-y-6">
            <div className="relative">
              <FaUserTie className="absolute top-4 left-4 text-amber-400" />
              <input
                type="text"
                placeholder="Experience (e.g. 2 years)"
                className="w-full pl-12 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm placeholder:text-gray-500 focus:border-amber-400 outline-none"
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
              />
            </div>

            <div className="relative">
              <FaUserTie className="absolute top-4 left-4 text-amber-400" />
              <input
                type="text"
                placeholder="Enter role"
                className="w-full pl-12 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm placeholder:text-gray-500 focus:border-amber-400 outline-none"
                onChange={(e) => setRole(e.target.value)}
                value={role}
              />
            </div>

            {/* MODE */}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:border-amber-400 outline-none"
            >
              <option value="Technical" className="bg-[#0b0f14]">
                Technical Interview
              </option>
              <option value="HR" className="bg-[#0b0f14]">
                HR Interview
              </option>
            </select>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <FaExclamationCircle className="mt-0.5 shrink-0 text-red-300" />
                <span>{error}</span>
              </div>
            )}

            {notice && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-300" />
                <span>{notice}</span>
              </div>
            )}

            {!analysisDone && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => document.getElementById("resumeUpload").click()}
                className="border border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 transition"
              >
                <FaFileUpload className="text-3xl mx-auto text-amber-400 mb-3" />

                <input
                  type="file"
                  accept="application/pdf"
                  id="resumeUpload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setResumeFile(file);
                    setAnalysisDone(false);
                    setResumeText("");
                    setProjects([]);
                    setSkills([]);
                    setError("");
                    setNotice("");
                  }}
                />

                <p className="text-gray-400 text-sm">
                  {resumeFile ? resumeFile.name : "Upload Resume (Optional)"}
                </p>

                {resumeFile && (
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume();
                    }}
                    disabled={analyzing}
                    whileHover={{ scale: 1.02 }}
                    className="mt-4 bg-amber-500 text-black px-5 py-2 rounded-lg text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {analyzing ? "Analyzing..." : "Analyze Resume"}
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* RESULT */}
            {analysisDone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4"
              >
                <h3 className="text-sm text-amber-400 font-medium">
                  Resume Insights
                </h3>

                {projects.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Projects</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {projects.map((p, i) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <span
                        key={i}
                        className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs border border-emerald-400/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            <motion.button
              onClick={handleStart}
              disabled={!role || !experience || loading || analyzing}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="w-full cursor-pointer bg-amber-500 text-black py-3 rounded-xl font-semibold disabled:cursor-not-allowed disabled:bg-gray-600 transition"
            >
              {loading ? "Starting..." : "Start Interview"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Step1SetUp;
