import razorpay from "../services/razorpay.service.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";

const PLANS = {
  basic: { amount: 100, credits: 150 },
  pro: { amount: 500, credits: 650 },
};

export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = PLANS[planId];

    if (!plan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const { amount, credits } = plan;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId: req.userId,
      planId,
      amount,
      credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to create order: ${error.message}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found!" });
    }

    if (payment.status === "paid") {
      return res.json({ message: "Already processed!" });
    }

    // ✅ mark paid
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    // ✅ add credits
    const updatedUser = await User.findByIdAndUpdate(
      payment.userId,
      { $inc: { credits: payment.credits } },
      { new: true },
    );

    res.json({
      success: true,
      message: "Payment verified and credits added.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to verify payment: ${error.message}` });
  }
};
