/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { BsRobot, BsMic, BsClock } from "react-icons/bs";

const Feature = () => {
  return (
    <div className="flex-1 flex flex-col items-center px-6">
      <div className="mt-2 flex flex-wrap justify-center gap-4 text-gray-500 text-sm">
        <span>5,000+ interviews conducted</span>
        <span>•</span>
        <span>AI-driven evaluation</span>
        <span>•</span>
        <span>Real-time feedback</span>
      </div>

      <div className="w-full max-w-4xl h-px bg-white/10 my-12" />

      <h2 className="text-2xl font-semibold mb-12 text-center">How It Works</h2>

      <div className="pt-15 flex flex-col md:flex-row justify-center items-center gap-10 mb-28">
        {[
          {
            icon: <BsRobot size={22} />,
            step: "STEP 1",
            title: "Role & Experience",
            desc: "AI adapts difficulty based on your role.",
          },
          {
            icon: <BsMic size={22} />,
            step: "STEP 2",
            title: "Voice Interview",
            desc: "Speak naturally with dynamic AI follow-ups.",
          },
          {
            icon: <BsClock size={22} />,
            step: "STEP 3",
            title: "Timed Simulation",
            desc: "Experience real interview pressure.",
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.2 }}
            whileHover={{ scale: 1.05, rotate: 0 }}
            className={`
                    relative w-80 p-6 rounded-3xl
                    bg-white/5 backdrop-blur-xl
                    border border-amber-500/30 hover:border-2 hover:border-amber-500
                    transition-all duration-300
                    hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]
    
                    ${index === 0 ? "rotate-[-5deg]" : ""}
                    ${index === 1 ? "rotate-2 md:-mt-6" : ""}
                    ${index === 2 ? "-rotate-3" : ""}
                  `}
          >
            <div className="absolute -top-15 left-1/2 -translate-x-1/2 w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              {item.icon}
            </div>

            <div className="pt-10 pb-10 text-center">
              <div className="text-xs text-amber-400 mb-2">{item.step}</div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center max-w-3xl mb-20">
        <h2 className="text-2xl font-semibold mb-4">Why AI Interview Agent?</h2>
        <p className="text-gray-400">
          Unlike static platforms, our AI adapts in real-time — challenging you
          like a real interviewer and helping you improve faster.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full text-center">
        <h2 className="text-2xl font-semibold mb-3">
          AI-Powered Feedback Engine
        </h2>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
          Get instant evaluation on communication, technical accuracy, and
          confidence.
        </p>
      </div>
    </div>
  );
};

export default Feature;
