import { Container, Card, Button } from "react-bootstrap";
import { useSelector } from "react-redux"; // Assuming you're using Redux for state management

const Hero = () => {
  // Get the user's role from Redux (or another state management solution)
  const { userInfo } = useSelector((state) => state.auth);

  // Check if user exists and determine role
  const isAdmin = userInfo?.role === "admin";

  return (
    <div className="py-5">
      <Container className="d-flex justify-content-center">
        <Card className="p-5 d-flex flex-column align-items-center hero-card bg-light w-75">
          <h1 className="text-center mb-4">MERN Authentication</h1>
          <p className="text-center mb-4">
            This is a boilerplate for MERN authentication that stores a JWT in
            an HTTP-Only cookie. It also uses Redux Toolkit and the React
            Bootstrap library.
          </p>

          {/* Conditional rendering based on user role */}
          {isAdmin ? (
            <div className="d-flex flex-column align-items-center">
              <h2>Welcome, Admin!</h2>
              <p>You have full access to manage the system.</p>
              <Button variant="primary" href="/admin/dashboard">
                Go to Admin Dashboard
              </Button>
            </div>
          ) : userInfo ? (
            <div className="d-flex flex-column align-items-center">
              <h2>Welcome, {userInfo.name}!</h2>
              <p>You are logged in as a regular user.</p>
              <Button variant="primary" href="/user/dashboard">
                Go to User Dashboard
              </Button>
            </div>
          ) : (
            <div className="d-flex">
              <Button variant="primary" href="/login" className="me-3">
                Sign In
              </Button>
              <Button variant="secondary" href="/register">
                Register
              </Button>
            </div>
          )}
        </Card>
      </Container>
    </div>
  );
};

export default Hero;
