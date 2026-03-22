import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import '../css/landing.css';
import '../css/cards.css'
import { Button } from './components/buttons';
import { Card } from './components/cards';
import OrgChartBackground from './components/OrgChartBackground';
import { tryDemo, decodeJwt, getUser, getUserStartup } from './api';
import { useAuth } from './context/AuthContext';
import {
  DEMO_USER, DEMO_STARTUP, DEMO_MEMBERS, DEMO_HEATMAP,
  DEMO_ANALYSIS, DEMO_TECH_STACK,
} from './data/demo';

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
      // Backend not running — seed offline demo data
      const fakeToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.${btoa(JSON.stringify({ sub: 'demo', userId: 1 }))}.demo`;
      authLogin(DEMO_USER, fakeToken, DEMO_STARTUP.id);
      // Set demo data AFTER authLogin (which clears old demo keys)
      localStorage.setItem('demo_mode', 'true');
      localStorage.setItem('demo_startup', JSON.stringify(DEMO_STARTUP));
      localStorage.setItem('demo_members', JSON.stringify(DEMO_MEMBERS));
      localStorage.setItem('demo_heatmap', JSON.stringify(DEMO_HEATMAP));
      localStorage.setItem('demo_analysis', JSON.stringify(DEMO_ANALYSIS));
      localStorage.setItem('demo_techstack', JSON.stringify(DEMO_TECH_STACK));
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
            
          </div>
        </div>
        <div className="hero-arrow">
          <button className="hero-arrow-btn" onClick={scrollToAbout} aria-label="Scroll down">
            <FontAwesomeIcon icon={faArrowDown} />
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
            <span className="brand-gradient" >
            <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 1024 337" width="128" height="42">
              <path id="JumpStart" fill="var(--logo-fill)" aria-label="JumpStart" d="m48.3 210.7c29.4 0 47.1-18.8 47.1-48.4v-88.8h-46.1v23h35.7l-12.6 4.3v60.9c0 16.7-9.6 25.9-24.1 25.9-14.6 0-24-9.2-24-26.3v-3.1h-23v4.5c0 28.4 18.2 48 47 48zm100.7-46.7v-53h-23v57.4c0 27.1 14.4 39.6 38.2 39.6 13.5 0 31.7-12.5 31.7-28.1v28.1h23.1v-97h-23.1v47.6c0 19.2-10.9 31.1-24.9 31.1-13.7 0-22-7.1-22-25.7zm100 44h23v-50.3c0-17.3 10.4-26.2 22.7-26.2 11.7 0 18.7 6 18.7 22.3v54.2h23v-50.3c0-17.1 10-26.2 22.1-26.2 12.3 0 19.2 6 19.2 22.3v54.2h23.1v-59.8c0-25.3-14.4-37-36.3-37-13.7 0-26 3.2-33.5 13.8-5.9-10.8-16.7-13.8-30.1-13.8-12.3 0-28.9 12.3-28.9 25.5v-25.7h-23zm235.9 0c28.8 0 50.2-18.7 50.2-48.5 0-29.9-21.4-48.4-50.2-48.4-22.1 0-32.9 9.6-32.9 29.4v-29.6h-23v113.8l-7.7 2.9 7.9 109.7 15.2-92.4 7.6-2.9v-42.9c8.7 7.3 20 8.9 32.9 8.9zm-23.6-48.5c0-15.3 8.2-25.3 23.6-25.3 15.4 0 27.1 10 27.1 25.3 0 15.4-9.8 25.4-27.1 25.4-15.4 0-23.6-10-23.6-25.4zm145.2 51.2c31.5 0 49.5-18.1 49.5-41.9 0-29.1-24.8-35.8-45.5-41-15.4-3.6-28.3-7.3-28.3-18.6 0-8.7 7-15.6 22.1-15.6 15.4 0 23.7 8.1 23.7 19.6 8.6 1.6 16.1 4.1 24.4 9.6v-9.6c0-25.7-16.5-42.4-47.3-42.4-30.9 0-47.6 16.7-47.6 39.2 0 27.4 23.6 34.4 44 39.4 15.9 4 29.7 7.6 29.7 20.5 0 10-7.8 17.9-24.7 17.9-17.7 0-26.8-9-26.8-22.5-10.3-1.2-15.5-2.7-24.7-9.6v9.6c0 26.7 18.8 45.4 51.5 45.4zm120.6-2.7h17.1l-9.8-21h-4.4c-12.1 0-18.3-6.3-18.3-18.4v-37.3h32.1v-20.4h-44.7l12.6-4.2v-20.4h-22.6l0.2 24.6h-20.4v20.4h19.8v37.8c0 25.2 13.6 38.9 38.4 38.9zm37.7-26.7c0 18.2 10.2 26.7 32.3 26.7 17.3 0 30.4-7.7 30.4-26.7v26.7h23v-59.8c0-24.8-15.9-37.3-42.4-37.3-24.6 0-39.8 10-43.3 30h23.1c1.9-8.1 12.3-9.6 19.8-9.6 8.6 0 19.8 3.3 19.8 16.5v3.5h-28.8c-23.9 0-33.9 11.5-33.9 30zm22.5-1c0-7.3 2.9-12.5 13.5-12.5h26.7v1.3c0 12.7-9.8 22-26.5 22-10.8 0-13.7-3.5-13.7-10.8zm91.7 27.7h23v-47.5c0-17.9 8.3-29.2 25-29.2h12.7v-20.4h-9.8c-17.1 0-27.9 9.2-27.9 24.4v-24.2l-23-0.2zm127.1 0h17.1l-9.8-20.9h-4.4c-12.1 0-18.3-6.4-18.3-18.5v-37.2h32.1v-20.4h-44.7l12.6-4.2v-20.4h-22.6l0.2 24.6h-20.4v20.4h19.8v37.8c0 25.2 13.6 38.8 38.4 38.8z" />
            </svg>
          </span>
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
