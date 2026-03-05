import jwt from "jsonwebtoken";
import Question from "../models/Question.js";
import User from "../models/User.js";

/* ===============================
   VERIFY USER
================================= */
export const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/* ===============================
   VERIFY ADMIN
================================= */
export const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.admin) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to perform this operation!",
    });
  }
};

/* ===============================
   VERIFY AUTHOR
================================= */
export const verifyAuthor = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (question.author.toString() === req.user._id.toString()) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not the author of this question",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
