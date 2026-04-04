/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { TypeAnimation } from "react-type-animation";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Pagination, Autoplay } from "swiper/modules";
import { HiSparkles } from "react-icons/hi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const slidesData = [
  {
    mode: "HR MODE",
    question: "Tell me about yourself.",
    answer: "I am a full-stack developer with strong problem-solving skills...",
  },
  {
    mode: "TECHNICAL",
    question: "Explain useEffect in React.",
    answer:
      "useEffect is used to handle side effects in functional components...",
  },
  {
    mode: "RESUME AI",
    question: "Explain your AI project.",
    answer: "I built an AI interview platform with voice and evaluation...",
  },
];

const Hero = ({ handleStart }) => {
  const userData = useSelector((state) => state.user);
  const { showAuth, setShowAuth } = useState(false);
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#0b0f14] text-white overflow-hidden">
      <div className="absolute w-125 h-125 bg-amber-500/20 blur-[120px] rounded-full -top-25 -left-25" />
      <div className="absolute w-100 h-100 bg-emerald-500/10 blur-[120px] rounded-full -bottom-25 -right-25" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <HiSparkles className="text-amber-400" />
            <span className="text-amber-400 text-sm">AI Powered</span>
            <span className="text-gray-400 text-sm">Interview Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-4xl mx-auto">
            Crack Interviews with{" "}
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full"></span>
              <span className="relative px-5 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                AI Precision
              </span>
            </span>
          </h1>

          <p className="text-gray-400 mt-6 max-w-xl mx-auto">
            Practice HR, Technical, and Resume-based interviews with real-time
            AI feedback and voice interaction.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <motion.button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                navigate("/interview");
              }}
              whileHover={{ opacity: 0.9, scale: 1.03 }}
              whileTap={{ opacity: 1, scale: 0.98 }}
              className="cursor-pointer flex gap-3 items-center justify-center bg-amber-500 text-black px-10 py-3 rounded-full hover:opacity-90  transition shadow-md"
            >
              Start Interview <ArrowRight size={18} />
            </motion.button>

            <motion.button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                navigate("/history");
              }}
              whileHover={{ opacity: 0.9, scale: 1.03 }}
              whileTap={{ opacity: 1, scale: 0.98 }}
              className="cursor-pointer border border-gray-300 px-10 py-3 rounded-full hover:gray-100 transition"
            >
              View History
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-20 w-full max-w-5xl relative"
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
              LIVE INTERVIEW
            </div>

            <div className="text-xs text-gray-400">
              AI Evaluation Running...
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-linear-to-b from-white/5 to-transparent backdrop-blur-2xl shadow-[0_0_80px_rgba(251,191,36,0.08)]">
            <div className="absolute inset-0 bg-amber-400/5 blur-2xl opacity-30"></div>

            <Swiper
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000 }}
              modules={[Pagination, Autoplay]}
              className="relative z-10"
            >
              {slidesData.map((slide, index) => (
                <SwiperSlide key={index}>
                  <div className="p-8 h-105 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full">
                        {slide.mode}
                      </span>

                      <span className="text-xs text-gray-500">⏱ 00:32</span>
                    </div>

                    <div className="flex flex-col gap-6 mt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 text-sm">
                          🤖
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 max-w-md text-sm">
                          <TypeAnimation
                            key={index}
                            sequence={[slide.question, 1000]}
                            speed={55}
                            cursor={true}
                          />
                        </div>
                      </div>

                      <div className="ml-12 flex items-center gap-2 text-xs text-gray-400">
                        Listening...
                        <Waveform />
                      </div>

                      <div className="flex items-start justify-end gap-3">
                        <div className="bg-amber-500/10 border border-amber-400/20 text-amber-300 rounded-2xl px-4 py-3 max-w-md text-sm">
                          <TypeAnimation
                            key={slide.answer}
                            sequence={[slide.answer, 1500]}
                            speed={65}
                            cursor={false}
                          />
                        </div>

                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs">
                          You
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <div className="flex gap-3 text-xs">
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                          Confidence 82%
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                          Clarity 90%
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                          Tech 85%
                        </div>
                      </div>

                      <div className="text-amber-400 text-sm font-semibold">
                        Score: 8.5
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="absolute -bottom-6 left-6 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs backdrop-blur-md">
            Resume AI Analysis
          </div>

          <div className="absolute -bottom-6 right-6 bg-amber-500/10 border border-amber-400/20 px-4 py-2 rounded-xl text-xs text-amber-300 backdrop-blur-md">
            Adaptive Questions
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

const Waveform = () => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          animate={{ height: [6, 18, 6] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          className="w-0.75 bg-amber-400 rounded-full"
        />
      ))}
    </div>
  );
};
