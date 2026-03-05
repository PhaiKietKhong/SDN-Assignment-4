import express from "express";
import * as controller from "../controllers/questionController.js";
import { verifyUser, verifyAuthor } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/", controller.getAllQuestions);
router.get("/:questionId", controller.getQuestionById);

router.post("/", verifyUser, controller.createQuestion);

router.put(
  "/:questionId",
  verifyUser,
  verifyAuthor,
  controller.updateQuestionById,
);

router.delete(
  "/:questionId",
  verifyUser,
  verifyAuthor,
  controller.deleteQuestionById,
);

router.delete("/", (req, res) => {
  res.status(403).json({
    success: false,
    message: "You are not allowed to delete all questions",
  });
});

export default router;
