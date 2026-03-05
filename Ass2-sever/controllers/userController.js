import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  const user = await User.findOne({ username });

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    { _id: user._id, admin: user.admin, username: user.username },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );

  res.json({
    success: true,
    token,
  });
};
export const register = async (req, res) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    user,
  });
};
