'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const SubmittedPage = () => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (typeof window !== 'undefined') {
            router.push('/');
        }
    }, 10000);

    const interval = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [router]);

  if (typeof window === 'undefined') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">
            Thank You!
          </h2>
          <p className="text-gray-700 mb-6">
            Thank you for completing the process. Your submission has been
            successfully recorded.
          </p>
          <p className="text-gray-500 text-sm">
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 flex flex-col items-center justify-center"
    >
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <motion.h2
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-semibold text-green-600 mb-4"
        >
          Thank You!
        </motion.h2>
        <p className="text-gray-700 mb-6">
          Thank you for attending the examination. Your responses have been
          successfully submitted.
        </p>
        <motion.p
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5, duration: 0.5 }}
          className="text-gray-500 text-sm"
        >
          You will be redirected to the home page in {timeLeft} seconds...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default SubmittedPage;
