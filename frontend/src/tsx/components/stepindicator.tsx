import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import '../../css/components.css';

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number; // 1-indexed
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="step-indicator">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
            )}
            <div className="step-item-wrapper">
              <div className={`step-dot ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                {isCompleted ? <FontAwesomeIcon icon={faCheck} /> : stepNum}
              </div>
              <span className={`step-label ${isActive ? 'active' : ''}`}>{step.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
