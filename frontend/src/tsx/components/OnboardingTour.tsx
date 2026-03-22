import { useEffect, useState, useCallback } from 'react';
import '../../css/onboarding.css';

interface TourStep {
  target: string; // data-tour attribute value or CSS selector
  title: string;
  text: string;
}

const STEPS: TourStep[] = [
  {
    target: '[data-tour="sidebar-nav"]',
    title: 'Navigation',
    text: 'Use the sidebar to switch between Overview, Team, Analysis, Tech Stack, and Settings.',
  },
  {
    target: '[data-tour="team-overview"]',
    title: 'Team Overview',
    text: 'See your startup details, team size, and product description at a glance.',
  },
  {
    target: '[data-tour="run-analysis"]',
    title: 'AI Analysis',
    text: 'Run an AI-powered analysis to assign roles, identify skill gaps, and get a team readiness score.',
  },
  {
    target: '[data-id="techstack"]',
    title: 'Tech Stack',
    text: 'Get AI recommendations for the best technologies based on your team\'s skills.',
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);

  const updateRect = useCallback(() => {
    const el = document.querySelector(STEPS[step]?.target);
    if (el) {
      const r = el.getBoundingClientRect();
      setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    const completed = localStorage.getItem('jumpstart_tour_completed');
    if (completed) return;
    // Wait for dashboard to finish loading
    const timer = setTimeout(() => {
      const el = document.querySelector(STEPS[0].target);
      if (el) setActive(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!active) return;
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [active, updateRect]);

  const dismiss = () => {
    setActive(false);
    localStorage.setItem('jumpstart_tour_completed', 'true');
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  if (!active || !targetRect) return null;

  const pad = 8;
  const spotStyle = {
    top: targetRect.top - pad,
    left: targetRect.left - pad,
    width: targetRect.width + pad * 2,
    height: targetRect.height + pad * 2,
  };

  // Position tooltip below or above target
  const tooltipBelow = targetRect.top < 300;
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed' as const,
    top: tooltipBelow ? targetRect.top + targetRect.height + pad + 12 : undefined,
    bottom: tooltipBelow ? undefined : window.innerHeight - targetRect.top + pad + 12,
    left: Math.min(Math.max(targetRect.left, 16), window.innerWidth - 340),
  };

  return (
    <div className="tour-overlay">
      <div className="tour-spotlight" style={spotStyle} />
      <div className="tour-tooltip" style={tooltipStyle}>
        <p className="tour-tooltip-title">{STEPS[step].title}</p>
        <p className="tour-tooltip-text">{STEPS[step].text}</p>
        <div className="tour-tooltip-actions">
          <div className="tour-dots">
            {STEPS.map((_, i) => (
              <span key={i} className={`tour-dot ${i === step ? 'active' : ''}`} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="tour-btn-skip" onClick={dismiss}>Skip</button>
            <button className="tour-btn-next" onClick={next}>
              {step === STEPS.length - 1 ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
