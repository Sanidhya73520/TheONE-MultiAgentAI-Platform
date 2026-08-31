import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import { createConnection } from "mongoose";
import redis from "../../../shared/redis/redis.js";
import crypto from "crypto";

export const login = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = await getAuth(app).verifyIdToken(token);
    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.picture,
      });
    }
    const sessionId = crypto.randomUUID();
    await redis.set(
      `user-session-${user?._id}`,
      sessionId,
      "EX",
      7 * 24 * 60 * 60,
    );
    await redis.set(
      `session-${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      }),
      "EX",
      7 * 24 * 60 * 60,
    );

    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "lax", //change to none while deployment.
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: `Login Error ${error}` });
  }
};

export const logout = async (req, res) => {
  try {
    const sessionId = req.cookies?.session;
    await redis.del(`session-${sessionId}`);
    res.clearCookie("session");

    return res.status(200).json({ message: "Logout Successful" });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return res.status(500).json({ message: `Logout Error ${error}` });
  }
};

export const updateUserPayment = async (req, res) => {
  try {
    const { plan, credits, userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.plan = plan;
    user.credits += credits;
    user.totalCredits += credits;
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await user.save();

    const sessionId = await redis.get(`user-session-${user?._id}`);
    console.log("sessionId", sessionId);

    await redis.set(
      `session-${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      }),
      "EX",
      7 * 24 * 60 * 60,
    );

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `updateUserPayment error ${error}` });
  }
};

// export const deductCredits = async (req, res) => {
//   try {
//     const { userId, agent } = req.body;
//     const COST={
//       chat:1,
//       search:5,
//       coding:10,
//       pdf:10,
//       ppt:10,
//       vision:10
//     };

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const requiredCredits = COST[agent] || 1;
//     if(user.credits<requiredCredits){
//       return res.status(400).json({ message: "Insufficient credits" });
//     }

//     user.credits -= requiredCredits;
//     await user.save();

//         const sessionId = await redis.get(`user-session-${user?._id}`);
//     console.log("sessionId", sessionId);

//     await redis.set(
//       `session-${sessionId}`,
//       JSON.stringify({
//         userId: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//         plan: user.plan,
//         credits: user.credits,
//         totalCredits: user.totalCredits,
//         planExpiresAt: user.planExpiresAt,
//       }),
//       "EX",
//       7 * 24 * 60 * 60,
//     );

//     return res.status(200).json({ success: true, credits: user.credits });
//   } catch (error) {
//     return res.status(500).json({ message: `deductCredits error ${error}` });
//   }
// };

export const deductCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;

    console.log("DEDUCT REQUEST:", {
      userId,
      agent,
    });

    const COST = {
      chat: 1,
      search: 5,
      coding: 10,
      pdf: 10,
      ppt: 10,
      vision: 10,
    };

    const user = await User.findById(userId);

    console.log("USER BEFORE:", user?.credits);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const requiredCredits = COST[agent] || 1;

    console.log("REQUIRED CREDITS:", requiredCredits);

    if (user.credits < requiredCredits) {
      return res.status(400).json({
        message: "Insufficient credits",
      });
    }

    user.credits -= requiredCredits;

    await user.save();

    console.log("USER AFTER:", user.credits);

    const sessionId = await redis.get(
      `user-session-${user._id}`
    );

    console.log("SESSION ID:", sessionId);

    if (sessionId) {
      await redis.set(
        `session-${sessionId}`,
        JSON.stringify({
          userId: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          plan: user.plan,
          credits: user.credits,
          totalCredits: user.totalCredits,
          planExpiresAt: user.planExpiresAt,
        }),
        "EX",
        7 * 24 * 60 * 60
      );
    }

    return res.status(200).json({
      success: true,
      credits: user.credits,
    });

  } catch (error) {
    console.error("DEDUCT CREDITS ERROR:", error);

    return res.status(500).json({
      message: `deductCredits error ${error.message}`,
    });
  }
};