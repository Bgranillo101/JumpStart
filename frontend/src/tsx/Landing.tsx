import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import '../css/landing.css';
import '../css/cards.css'
import { Button } from './components/buttons';
import { Card } from './components/cards';
import OrgChartBackground from './components/OrgChartBackground';
import { tryDemo, decodeJwt, getUser, getUserStartup } from './api';
import { useAuth } from './context/AuthContext';
import type { User } from './types';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTryDemo = async () => {
    setDemoLoading(true);
    try {
      const result = await tryDemo();
      if (!result.success || !result.token) throw new Error('backend unavailable');
      const { userId } = decodeJwt(result.token);
      const fullUser = await getUser(userId);
      const startup = await getUserStartup(userId);
      authLogin(fullUser, result.token, startup?.id);
      navigate('/dashboard');
    } catch {
      // Backend not running — log in with offline demo data
      const demoUser: User = {
        userId: 0,
        username: 'demo',
        email: 'demo@jumpstart.app',
        name: 'Demo User',
        headline: 'Full-Stack Developer',
        preferredRole: 'CTO',
        experienceYears: 3,
        skills: [
          { id: 1, name: 'React', category: 'TECHNICAL', proficiencyLevel: 8 },
          { id: 2, name: 'Java', category: 'TECHNICAL', proficiencyLevel: 7 },
          { id: 3, name: 'Figma', category: 'DESIGN', proficiencyLevel: 6 },
          { id: 4, name: 'SEO', category: 'MARKETING', proficiencyLevel: 5 },
        ],
      };
      const fakeToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.${btoa(JSON.stringify({ sub: 'demo', userId: 0 }))}.demo`;
      authLogin(demoUser, fakeToken, undefined);
      navigate('/dashboard');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="landing-container" role="main">
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
            <Button variant="secondary" size="lg" onClick={handleTryDemo} disabled={demoLoading}>
              {demoLoading ? 'Loading...' : 'Try Demo'}
            </Button>
            <Button variant="outline" size="lg" onClick={scrollToAbout}>
              Learn More
            </Button>
          </div>
        </div>
        <div className="hero-arrow">
          <button className="hero-arrow-btn" onClick={scrollToAbout} aria-label="Scroll down">
            <FontAwesomeIcon icon={faChevronDown} />
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section className="getting-started-section">
        <div className="steps-header">
          <h2 className="section-title">How It Works</h2>
          <div className="about-accent-line" />
        </div>
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
        <div className="about-container">

          <div className="about-intro">
            <span className="about-eyebrow">About JumpStart</span>
            <h2 className="about-headline">
              Turn raw talent into<br />
              <span className="about-headline-accent">structured excellence.</span>
            </h2>
          </div>

          <div className="about-rows">
            <div className="about-row">
              <div className="about-row-meta">
                <span className="about-row-num">01</span>
                <span className="about-row-tag">The Platform</span>
              </div>
              <div className="about-row-content">
                <h3 className="about-row-heading">The JumpStart Platform</h3>
                <p className="about-row-copy">
                  JumpStart is an intelligent platform designed exclusively for tech startup founders.
                  We seamlessly transition your vision into reality by evaluating your team's
                  proficiencies, bridging critical skill gaps, and mapping out scalable technical
                  architectures based on AI-driven insights.
                </p>
              </div>
            </div>

            <div className="about-row">
              <div className="about-row-meta">
                <span className="about-row-num">02</span>
                <span className="about-row-tag">Our Mission</span>
              </div>
              <div className="about-row-content">
                <h3 className="about-row-heading">Our Mission</h3>
                <p className="about-row-copy">
                  Early-stage team building and technical planning are fraught with friction and
                  costly misalignments. We exist to eliminate the guesswork. By translating raw
                  talent into structured, highly-functioning teams, we empower founders to focus
                  entirely on product development and market growth rather than administrative overhead.
                </p>
              </div>
            </div>

            <div className="about-row">
              <div className="about-row-meta">
                <span className="about-row-num">03</span>
                <span className="about-row-tag">The Advantage</span>
              </div>
              <div className="about-row-content">
                <h3 className="about-row-heading">The JumpStart Advantage</h3>
                <p className="about-row-copy">
                  We replace intuition with data. Our platform provides clear, visual skill heatmaps,
                  objective role assignments, and customized tech stack recommendations tailored
                  precisely to the actual capabilities of your team. You get a blueprint for success
                  before a single line of code is written.
                </p>
              </div>
            </div>
          </div>

          <div className="about-footer-row">
            <Button variant="primary" size="md" onClick={() => navigate('/auth/register')}>
              Join the Platform
            </Button>
          </div>

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
            <Link to="/auth/sign-in" className="footer-link">Sign In</Link>
            <Link to="/auth/register" className="footer-link">Register</Link>
          </nav>
          <span className="footer-copy">© {new Date().getFullYear()} JumpStart. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
