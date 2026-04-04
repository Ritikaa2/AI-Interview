/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { BsRobot } from "react-icons/bs";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative mt-32 text-white">
      {/* 🔥 TOP GRADIENT LINE */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-amber-400/40 to-transparent mb-10" />

      <div className="max-w-7xl mx-auto px-6 pb-10">
        {/* 🪟 GLASS CONTAINER */}
        <div className="relative rounded-3xl p-px bg-linear-to-br from-white/20 via-white/5 to-transparent">
          {/* glow */}
          <div className="absolute inset-0 bg-amber-400/10 blur-2xl opacity-30 rounded-3xl"></div>

          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10">
            {/* 🧩 GRID */}
            <div className="grid md:grid-cols-4 gap-10">
              {/* LOGO */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                    <BsRobot size={20} />
                  </div>
                  <h1 className="font-semibold text-lg">AI Interview Agent</h1>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed">
                  Practice smarter. Improve faster. Crack interviews with
                  AI-powered simulations and real-time feedback.
                </p>

                {/* SOCIAL */}
                <div className="flex gap-4 mt-5">
                  {[FaGithub, FaLinkedin, FaTwitter].map((Icon, i) => (
                    <motion.div
                      whileHover={{ scale: 1.2, y: -2 }}
                      key={i}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition"
                    >
                      <Icon size={16} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* PRODUCT */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-white">
                  Product
                </h3>

                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="hover:text-white cursor-pointer">
                    Mock Interviews
                  </li>
                  <li className="hover:text-white cursor-pointer">Voice AI</li>
                  <li className="hover:text-white cursor-pointer">Analytics</li>
                  <li className="hover:text-white cursor-pointer">Resume AI</li>
                </ul>
              </div>

              {/* COMPANY */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-white">
                  Company
                </h3>

                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="hover:text-white cursor-pointer">About</li>
                  <li className="hover:text-white cursor-pointer">Careers</li>
                  <li className="hover:text-white cursor-pointer">Blog</li>
                  <li className="hover:text-white cursor-pointer">Contact</li>
                </ul>
              </div>

              {/* RESOURCES */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-white">
                  Resources
                </h3>

                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="hover:text-white cursor-pointer">Docs</li>
                  <li className="hover:text-white cursor-pointer">
                    Help Center
                  </li>
                  <li className="hover:text-white cursor-pointer">
                    Privacy Policy
                  </li>
                  <li className="hover:text-white cursor-pointer">Terms</li>
                </ul>
              </div>
            </div>

            {/* 🔻 BOTTOM */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <p>
                © {new Date().getFullYear()} AI Interview Agent. All rights
                reserved.
              </p>

              <div className="flex gap-6">
                <span className="hover:text-white cursor-pointer">Privacy</span>
                <span className="hover:text-white cursor-pointer">Terms</span>
                <span className="hover:text-white cursor-pointer">
                  Security
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
