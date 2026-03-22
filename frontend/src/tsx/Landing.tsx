import { useNavigate } from 'react-router-dom';
import '../css/landing.css';
import '../css/cards.css'
import { Button } from './components/buttons';
import { Card } from './components/cards';
import OrgChartBackground from './components/OrgChartBackground';

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-container">
      {/* Hero */}
      <section className="hero-section">
        <OrgChartBackground />
        <div className="hero-content">
          <h1 className="hero-title">Bringing your ideas from 0 to 1</h1>
          <p className="hero-subtitle">
            Build your team, discover your tech stack, and launch your company today.
          </p>
          <div className="hero-cta">
            <Button variant="primary" size="lg" onClick={() => navigate('/auth/register')}>
              Start Building
            </Button>
            <Button variant="outline" size="lg" onClick={scrollToAbout}>
              Learn More
            </Button>
          </div>
        </div>
        <div className="hero-arrow">
          <button className="hero-arrow-btn" onClick={scrollToAbout} aria-label="Scroll down">
            ↓
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section className="getting-started-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <Card className="step-card">
            <h3 className="step-number">1</h3>
            <h4 className="step-title">Create Your Idea</h4>
            <p className="step-desc">Define your startup vision — the problem, the solution, and your goals.</p>
          </Card>
          <Card className="step-card">
            <h3 className="step-number">2</h3>
            <h4 className="step-title">Build Your Team</h4>
            <p className="step-desc">Add members with their skills and roles. Discover gaps in real time.</p>
          </Card>
          <Card className="step-card">
            <h3 className="step-number">3</h3>
            <h4 className="step-title">Get Your Stack</h4>
            <p className="step-desc">Receive a recommended tech stack tailored to your team's strengths.</p>
          </Card>
        </div>
      </section>

      {/* About */}
      <section id="about" className="about-section">
        <div className="about-inner">
          <div className="about-text-col">
            <h2 className="section-title">About JumpStart</h2>
            <p className="about-desc">
              JumpStart helps tech startup founders seamlessly go from idea to a functioning team.
              We evaluate your team's proficiencies, bridge skill gaps, and recommend technical
              architectures — so you can focus on building what matters.
            </p>
            <Button variant="primary" size="md" onClick={() => navigate('/auth/register')}>
              Join the Platform
            </Button>
          </div>
          <div className="about-graphic">🚀</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-logo">
            <span className="brand-gradient">JumpStart</span>
          </span>
          <nav className="footer-links">
            <a href="#about" className="footer-link">About</a>
            <a href="/auth/sign-in" className="footer-link">Sign In</a>
            <a href="/auth/register" className="footer-link">Register</a>
          </nav>
          <span className="footer-copy">© {new Date().getFullYear()} JumpStart. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
