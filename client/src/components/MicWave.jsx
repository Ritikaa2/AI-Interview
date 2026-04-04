/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";

const bars = [1, 2, 3, 4, 5, 6, 7];

const MicWave = () => {
  return (
    <div className="flex items-center gap-1">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: [10, 30, 10],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          className="w-1 bg-amber-400 rounded-full"
        />
      ))}
    </div>
  );
};

export default MicWave;
