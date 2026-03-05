import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { clearQuizState } from "../store/slices/quizSlice";

function DashboardLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, username } = useSelector((state) => state.auth);

  const dashboardConfig = {
    user: [
      { label: "Home", path: "/dashboard" },
      { label: "Quiz", path: "/dashboard/quiz" },
      { label: "Article", path: "/dashboard/article" },
    ],
    admin: [
      { label: "Home", path: "/admin" },
      { label: "Manage Questions", path: "/dashboard/questions" },
      { label: "Mangage Article", path: "/dashboard/articles" },
    ],
  };
  let decoded = { admin: false, username };

  if (token) {
    decoded = jwtDecode(token);
  }

  const menu = dashboardConfig[decoded.admin ? "admin" : "user"];

  const handleLogout = () => {
    dispatch(clearQuizState());
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center p-4 ">
        <div className="fs-2 fw-bold">Assignment</div>
        <div className="fs-5 fw-semibold text-primary">
          Welcome back, {decoded.username || username}
        </div>
      </div>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {menu.map((m, i) => (
                <Nav.Link
                  active={location.pathname === m.path}
                  key={i}
                  onClick={() => navigate(m.path)}
                >
                  {m.label}
                </Nav.Link>
              ))}
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Outlet />
    </div>
  );
}

export default DashboardLayout;
