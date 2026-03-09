import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import apiClient from "../apiClient";
import { fetchQuizById, fetchQuizzes } from "../store/slices/quizSlice";

function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizModalMode, setQuizModalMode] = useState("add");
  const [quizForm, setQuizForm] = useState({
    id: "",
    title: "",
    description: "",
  });
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = useSelector((state) => state.auth.token);
  const { quizzes, selectedQuiz, questions, loading, error } = useSelector(
    (state) => state.quiz,
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchQuizzes());
    }
  }, [dispatch, isAuthenticated]);

  const handleSelectQuiz = async (quizId) => {
    await dispatch(fetchQuizById(quizId));
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setSelectedOption(null);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;

    const currentQuestion = questions[currentIndex];
    if (selectedOption === currentQuestion.correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setFinished(true);
    }
  };

  const handleFinishQuiz = () => {
    setFinished(true);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setSelectedOption(null);
  };

  const handleBackToList = () => {
    dispatch(fetchQuizzes());
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setSelectedOption(null);
  };

  const openAddQuizModal = () => {
    setQuizModalMode("add");
    setQuizForm({ id: "", title: "", description: "" });
    setActionError("");
    setShowQuizModal(true);
  };

  const openEditQuizModal = (quiz) => {
    setQuizModalMode("edit");
    setQuizForm({
      id: quiz._id,
      title: quiz.title || "",
      description: quiz.description || "",
    });
    setActionError("");
    setShowQuizModal(true);
  };

  const closeQuizModal = () => {
    setShowQuizModal(false);
    setQuizForm({ id: "", title: "", description: "" });
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) {
      setActionError("Quiz title is required.");
      return;
    }

    setActionLoading(true);
    setActionError("");
    try {
      const payload = {
        title: quizForm.title.trim(),
        description: quizForm.description.trim(),
      };
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (quizModalMode === "edit" && quizForm.id) {
        await apiClient.put(`/quizzes/${quizForm.id}`, payload, { headers });
      } else {
        await apiClient.post("/quizzes", payload, { headers });
      }

      closeQuizModal();
      dispatch(fetchQuizzes());
    } catch (err) {
      setActionError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save quiz.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (quiz) => {
    setQuizToDelete(quiz);
    setActionError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setQuizToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!quizToDelete?._id) return;

    setActionLoading(true);
    setActionError("");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await apiClient.delete(`/quizzes/${quizToDelete._id}`, { headers });
      closeDeleteModal();
      dispatch(fetchQuizzes());
    } catch (err) {
      setActionError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to delete quiz.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  // Quiz completed screen
  if (finished) {
    return (
      <div className="text-center mt-5">
        <h2 className="fw-bold">Quiz Completed</h2>
        <p className="fs-5">
          Your score: {score}/{questions.length}
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-primary" onClick={handleRestart}>
            Restart Quiz
          </button>
          <button className="btn btn-secondary" onClick={handleBackToList}>
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Quiz list screen
  if (!selectedQuiz) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-center fw-bold mb-0">Quizzes</h2>
          <button className="btn btn-success" onClick={openAddQuizModal}>
            Add Quiz
          </button>
        </div>
        {actionError && (
          <div className="alert alert-danger" role="alert">
            {actionError}
          </div>
        )}
        {quizzes.length === 0 ? (
          <p className="text-center text-muted">No quizzes available.</p>
        ) : (
          <div className="row g-3">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{quiz.title}</h5>
                    {quiz.description && (
                      <p className="card-text text-muted">{quiz.description}</p>
                    )}
                    <p className="card-text mt-auto">
                      <small className="text-muted">
                        {quiz.question?.length || 0} questions
                      </small>
                    </p>
                    <button
                      className="btn btn-primary mb-2"
                      onClick={() => handleSelectQuiz(quiz._id)}
                    >
                      Start Quiz
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showQuizModal && (
          <>
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              aria-modal="true"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {quizModalMode === "edit" ? "Edit Quiz" : "Add Quiz"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={closeQuizModal}
                    />
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={quizForm.title}
                        onChange={(e) =>
                          setQuizForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={quizForm.description}
                        onChange={(e) =>
                          setQuizForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeQuizModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveQuiz}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show" />
          </>
        )}

        {showDeleteModal && (
          <>
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Delete Quiz</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={closeDeleteModal}
                    />
                  </div>
                  <div className="modal-body">
                    Are you sure you want to delete{" "}
                    <strong>{quizToDelete?.title}</strong>?
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeDeleteModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleConfirmDelete}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show" />
          </>
        )}
      </div>
    );
  }

  // Active quiz screen - show one question at a time
  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="text-center mt-5">
        <p>This quiz has no questions.</p>
        <button className="btn btn-secondary" onClick={handleBackToList}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="text-center">
        <h2 className="fw-bold">{selectedQuiz.title}</h2>
        <p className="text-muted mb-4">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>

      <div className="card mx-auto" style={{ maxWidth: "600px" }}>
        <div className="card-body">
          <h5 className="card-title mb-3">{currentQuestion.text}</h5>

          {currentQuestion.options.map((option, index) => (
            <div className="form-check mb-2" key={index}>
              <input
                className="form-check-input"
                type="radio"
                name="quizOption"
                id={`option-${index}`}
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
              />
              <label className="form-check-label" htmlFor={`option-${index}`}>
                {option}
              </label>
            </div>
          ))}

          <button
            className="btn btn-primary mt-3"
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
          >
            Submit Answer
          </button>
        </div>
      </div>

      <div className="text-center mt-3">
        <button
          className="btn btn-link text-decoration-none"
          onClick={handleFinishQuiz}
        >
          Finish Quiz
        </button>
      </div>
    </div>
  );
}

export default QuizPage;
