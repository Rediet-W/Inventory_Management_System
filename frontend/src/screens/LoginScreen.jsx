import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../slices/userApiSlice";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Loader";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate("/dashboard");
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();

      if (!res.token) {
        toast.error("Login failed. No token received.");
        return;
      }

      dispatch(setCredentials({ success: true, data: res }));
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Login failed");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <FormContainer className="p-4 shadow-sm rounded-3 bg-white">
        <div className="text-center mb-4">
          <h1 className="fw-bold">Welcome Back!</h1>
          <p className="text-muted">Please sign in to continue</p>
        </div>

        <Form onSubmit={submitHandler} className="mb-4">
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

          <Button
            type="submit"
            variant="primary"
            className="w-100 mt-3 py- h-10"
            disabled={isLoading}
          >
            {isLoading ? <Loader size="xs" /> : "Login"}
          </Button>
        </Form>

        <Row className="text-center">
          <Col>
            Don't have an account?{" "}
            <Link to="/register" className="text-primary fw-semibold">
              Register
            </Link>
          </Col>
        </Row>
      </FormContainer>
    </div>
  );
};

export default LoginScreen;
