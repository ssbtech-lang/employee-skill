import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Home.css";

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <span className="logo-big">🚀</span>
        <h1>Employee Skill Discovery Platform</h1>
        <p className="tagline">
          Unlock your team's potential. Discover skills, find talent, and grow together.
        </p>
        <div className="hero-buttons">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-hero-primary">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-hero-primary">
                Get Started →
              </Link>
              <Link to="/register" className="btn-hero-secondary">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>✨ Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">👤</span>
            <h4>Profile Management</h4>
            <p>Create and update your professional profile with department, designation, location, and education.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h4>Skill Management</h4>
            <p>Add, update, or remove skills with proficiency levels, years of experience, and endorsements.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔍</span>
            <h4>Talent Discovery</h4>
            <p>Search for employees by skills, experience, and proficiency level to find the right talent.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🏆</span>
            <h4>Smart Matching</h4>
            <p>Get match scores based on proficiency, experience, endorsements, and skill source.</p>
          </div>
        </div>
      </div>

      {/* How to Use Section */}
      <div className="how-to-section">
        <h2>📖 How to Use</h2>
        <div className="how-to-steps">
          <div className="step">
            <div className="step-number">1</div>
            <h5>Create Account</h5>
            <p>Register with your name, email, password, and role (Employee, Manager, HR, or L&D).</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h5>Set Up Profile</h5>
            <p>Fill in your professional details like department, designation, location, and education.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h5>Add Skills</h5>
            <p>List your skills with proficiency levels and years of experience to showcase your expertise.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h5>Discover Talent</h5>
            <p>Use the search feature to find employees based on skills, experience, and proficiency.</p>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="roles-section">
        <h2>👥 User Roles</h2>
        <div className="roles-grid">
          <div className="role-card">
            <span className="role-emoji">👔</span>
            <h5>Employee</h5>
            <p>Manage own profile and skills</p>
          </div>
          <div className="role-card">
            <span className="role-emoji">📊</span>
            <h5>Manager</h5>
            <p>Search and discover employees</p>
          </div>
          <div className="role-card">
            <span className="role-emoji">🏢</span>
            <h5>HR</h5>
            <p>Search and discover employees</p>
          </div>
          <div className="role-card">
            <span className="role-emoji">📚</span>
            <h5>L&D</h5>
            <p>Search and discover employees</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-section">
        <p>© 2026 Employee Skill Discovery Platform. Built with ❤️ for better talent management.</p>
      </div>
    </div>
  );
}

export default Home;