/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

const Newsletter = () => {
  return (
    <section className="relative mt-32 px-6">
      <div className="absolute w-125 h-125 bg-amber-500/10 blur-[120px] rounded-full -top-32 -left-32" />
      <div className="absolute w-100 h-100 bg-emerald-500/10 blur-[120px] rounded-full -bottom-32 -right-32" />

      <div className="max-w-6xl mx-auto relative">
        <div className="absolute -top-8 left-10 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs text-gray-300 backdrop-blur-md">
          🤖 AI Feedback
        </div>

        <div className="absolute -top-8 right-10 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs text-gray-300 backdrop-blur-md">
          🎤 Voice Practice
        </div>

        <div className="relative rounded-[2.5rem] p-px bg-linear-to-br from-white/20 via-white/5 to-transparent">
          <div className="absolute inset-0 bg-amber-400/10 blur-2xl opacity-40 rounded-[2.5rem]" />

          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-8 py-14 md:px-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none"></div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-semibold mb-4">
                Get Interview Ready Faster
              </h2>

              <p className="text-gray-400 max-w-xl mx-auto mb-10">
                Practice with AI, get real-time feedback, and improve your
                confidence before your next big opportunity.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
                <div className="relative w-full sm:flex-1">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="
                      w-full pl-10 pr-4 py-3 rounded-xl
                      bg-white/5 border border-white/10
                      text-sm text-white placeholder:text-gray-500
                      outline-none
                      focus:border-amber-400/50
                      focus:ring-2 focus:ring-amber-400/20
                      transition
                    "
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="
                    relative overflow-hidden
                    flex items-center gap-2
                    bg-linear-to-r from-amber-400 to-amber-500
                    text-black px-6 py-3 rounded-xl font-semibold
                    shadow-lg hover:shadow-amber-500/40
                    transition
                  "
                >
                  <span className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition"></span>

                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <ArrowRight size={18} />
                  </span>
                </motion.button>
              </div>

              <p className="text-xs text-gray-500 mt-5">
                No spam. Only useful interview tips & updates.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/5 px-4 py-2 rounded-xl text-xs border border-white/10 backdrop-blur-md">
          📊 Smart Analytics Included
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
