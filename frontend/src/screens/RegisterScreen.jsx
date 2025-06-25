import { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import Loader from "../components/Loader";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useRegisterMutation } from "../slices/userApiSlice";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate("/dashboard");
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await register({
        name,
        email,
        password,
        role: "superadmin",
      }).unwrap();

      if (!res?.token) {
        toast.error("Registration failed. No token received.");
        return;
      }

      dispatch(setCredentials({ success: true, data: res }));
      toast.success("Registration successful", { autoClose: 2000 });
      navigate("/");
    } catch (err) {
      const errorMsg =
        err?.data?.errors?.length > 0
          ? err.data.errors.join(", ")
          : err?.message || "Registration failed";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-90 bg-light">
      <FormContainer className="p-4 shadow-sm rounded-3 bg-white">
        <div className="text-center mb-4">
          <h1 className="fw-bold">Create Account</h1>
          <p className="text-muted">Fill in your details to register</p>
        </div>

        <Form onSubmit={submitHandler} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            className="w-100 mt-3 py-2"
            disabled={isLoading}
          >
            {isLoading ? "Registering" : "Register"}
          </Button>
        </Form>

        <Row className="text-center">
          <Col>
            Already have an account?{" "}
            <Link to="/login" className="text-primary fw-semibold">
              Login
            </Link>
          </Col>
        </Row>
      </FormContainer>
    </div>
  );
};

export default RegisterScreen;
