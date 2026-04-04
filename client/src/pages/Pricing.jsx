/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { ServerUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const dispatch = useDispatch();

  const plans = [
    {
      id: "free",
      name: "Free Pack",
      price: "₹0",
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History Tracking",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 650,
      description: "Best value for serious job preparation.",
      features: [
        "100 AI Interview credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
  ];

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id);
      const amount = plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0;

      const result = await axios.post(
        ServerUrl + "/api/payment/order",
        { planId: plan.id, amount: amount, credits: plan.credits },
        { withCredentials: true },
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: "INR",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.data.id,

        handler: async function (response) {
          const verifyPay = await axios.post(
            ServerUrl + "/api/payment/verify",
            response,
            { withCredentials: true },
          );

          dispatch(setUserData(verifyPay.data.user));
          alert("Payment Successful! Credits Added");
          navigate("/");
        },
        theme: { color: "#f59e0b" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      setLoadingPlan(null);
    } catch (error) {
      console.log(error);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white py-24 px-6 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-amber-500/20 blur-[140px] -top-20 -left-20 rounded-full" />
      <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] -bottom-20 -right-20 rounded-full" />

      <div className="max-w-6xl mx-auto mb-20 flex items-center gap-4 relative z-10">
        <button
          onClick={() => navigate("/")}
          className="p-3 cursor-pointer rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
        >
          <FaArrowLeft className="text-gray-300" />
        </button>

        <div className="text-center w-full">
          <h1 className="text-5xl font-bold tracking-tight">
            Upgrade Your <span className="text-amber-400">AI Power</span>
          </h1>
          <p className="text-gray-400 mt-3">
            Choose a plan and unlock smarter interview practice
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto relative z-10">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -8 }}
              onClick={() => !plan.default && setSelectedPlan(plan.id)}
              className={`relative rounded-[28px] p-[1px] transition-all duration-300
              ${
                isSelected
                  ? "bg-gradient-to-br from-amber-400/60 via-white/10 to-transparent"
                  : "bg-white/10"
              }`}
            >
              <div className="relative h-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[28px] p-8 shadow-xl">
                {plan.badge && (
                  <div className="absolute top-5 right-5 bg-amber-500 text-black text-xs px-3 py-1 rounded-full font-medium">
                    {plan.badge}
                  </div>
                )}

                {plan.default && (
                  <div className="absolute top-5 right-5 bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full">
                    Default
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-amber-400">
                    {plan.price}
                  </span>
                  <p className="text-gray-400 text-sm mt-1">
                    {plan.credits} Credits
                  </p>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {plan.description}
                </p>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <FaCheckCircle className="text-emerald-400 text-sm" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {!plan.default && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    disabled={loadingPlan === plan.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSelected) {
                        setSelectedPlan(plan.id);
                      } else {
                        handlePayment(plan);
                      }
                    }}
                    className={`w-full mt-8 py-3 rounded-xl font-medium transition
                      ${
                        isSelected
                          ? "bg-amber-500 cursor-pointer text-black shadow-lg hover:shadow-amber-500/40"
                          : "bg-white/5 cursor-pointer text-gray-300 hover:bg-white/10"
                      }`}
                  >
                    {loadingPlan === plan.id
                      ? "Processing..."
                      : isSelected
                        ? "Proceed to Pay"
                        : "Select Plan"}
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;
