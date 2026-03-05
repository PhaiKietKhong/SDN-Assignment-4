import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthMessages, loginUser } from "../store/slices/authSlice";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.auth);

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearAuthMessages());
    setValidationError("");

    if (!username.trim() || !password) {
      setValidationError("Username và password là bắt buộc");
      return;
    }

    const resultAction = await dispatch(
      loginUser({
        username,
        password,
      }),
    );

    if (loginUser.fulfilled.match(resultAction)) {
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
      return;
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card border login-card">
        <div className="card-body p-4">
          <h4 className="text-center fw-semibold mb-4">Login</h4>

          <form onSubmit={handleSubmit}>
            {validationError && (
              <div className="alert alert-danger py-2" role="alert">
                {validationError}
              </div>
            )}
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="alert alert-success py-2" role="alert">
                {successMessage}
              </div>
            )}

            <div className="mb-3 text-start">
              <label htmlFor="username" className="form-label mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="John"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="mb-3 text-start">
              <label htmlFor="password" className="form-label mb-1">
                Password
              </label>
              <div className="input-group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="•••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-center small mb-0">
              <a href="#" className="text-decoration-none">
                Don&apos;t have an account? Register here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
