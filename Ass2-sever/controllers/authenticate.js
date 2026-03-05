import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyUser = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.id);
    req.user = user;
    next();
  });
};

export const verifyAdmin = (req, res, next) => {
  if (req.user.admin) {
    next();
  } else {
    return res.status(403).json({
      message: "You are not authorized to perform this operation!",
    });
  }
};
