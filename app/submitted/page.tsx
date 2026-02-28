"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const SubmittedPage = () => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(5);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          if (!hasRedirected.current) {
            hasRedirected.current = true;
            router.replace("/"); // 🔥 replace instead of push
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-100 flex items-center justify-center px-4"
    >
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
        <motion.h2
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-xl sm:text-2xl font-semibold text-green-600 mb-4"
        >
          Examination Submitted Successfully
        </motion.h2>

        <p className="text-gray-700 mb-6 text-sm sm:text-base">
          Thank you for attending the examination. Your responses have been
          successfully recorded.
        </p>

        <div className="bg-gray-100 py-2 px-4 rounded-md text-sm text-gray-600">
          Redirecting to home page in{" "}
          <span className="font-bold text-blue-600">{timeLeft}</span> seconds...
        </div>
      </div>
    </motion.div>
  );
};

export default SubmittedPage;
