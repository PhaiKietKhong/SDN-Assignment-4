import { getUsers, login, register } from "../controllers/userController.js";
import express from "express";
import { verifyAdmin, verifyUser } from "../middleware/authenticate.js";

const router = express.Router();
router.post("/login", login);
router.post("/register", register);
router.use("/", verifyUser, verifyAdmin, getUsers);

export default router;
