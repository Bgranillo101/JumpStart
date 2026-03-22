import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faHandshake } from '@fortawesome/free-solid-svg-icons';
import { StepIndicator } from '../../components/stepindicator';
import { useWizard } from '../../context/WizardContext';
import '../../../css/auth.css';

const STEPS = [{ label: 'Choose Path' }, { label: 'Set Up' }];

export default function Register() {
  const navigate = useNavigate();
  const { state, setPath } = useWizard();

  const handleChoice = (choice: 'create' | 'join') => {
    setPath(choice);
    if (choice === 'create') navigate('/auth/create-profile');
    else navigate('/auth/join-team');
  };

  return (
    <div className="register-page">
      <StepIndicator steps={STEPS} currentStep={1} />

      <h1 className="register-heading">How do you want to get started?</h1>
      <p className="register-subheading">Choose your path — you can always change this later.</p>

      <div className="register-cards">
        <div
          className={`register-choice-card ${state.path === 'create' ? 'selected' : ''}`}
          onClick={() => handleChoice('create')}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && handleChoice('create')}
        >
          <div className="choice-icon"><FontAwesomeIcon icon={faRocket} /></div>
          <h2 className="choice-title">Create a Company</h2>
          <p className="choice-desc">
            Start your own startup, build your team from scratch, and get a recommended tech stack.
          </p>
        </div>

        <div
          className={`register-choice-card ${state.path === 'join' ? 'selected' : ''}`}
          onClick={() => handleChoice('join')}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && handleChoice('join')}
        >
          <div className="choice-icon"><FontAwesomeIcon icon={faHandshake} /></div>
          <h2 className="choice-title">Join a Team</h2>
          <p className="choice-desc">
            Search for an existing startup and request to join their team with your skills.
          </p>
        </div>
      </div>
    </div>
  );
}
