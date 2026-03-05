import express from "express";
import * as controller from "../controllers/quizController.js";
import { verifyUser, verifyAdmin } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/", controller.getAllQuizzes);
router.get("/:id", controller.getQuizById);

router.post("/", verifyUser, verifyAdmin, controller.createQuiz);

router.put("/:id", verifyUser, verifyAdmin, controller.updateQuizById);

router.delete("/:id", verifyUser, verifyAdmin, controller.deleteQuizById);

router.delete("/", verifyUser, verifyAdmin, controller.deleteAllQuizzes);
export default router;
