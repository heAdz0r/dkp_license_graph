import React, { memo } from 'react';

interface StepNavigationProps {
  activeStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  isProcessing?: boolean;
}

export const StepNavigation = memo(({
  activeStep,
  totalSteps,
  onNext,
  onBack,
  nextLabel = "Далее",
  backLabel = "Назад",
  isNextDisabled = false,
  isBackDisabled = false,
  isProcessing = false,
}: StepNavigationProps) => {
  const isLastStep = activeStep === totalSteps - 1;
  const isFirstStep = activeStep === 0;

  return (
    <div
      className="sticky bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 p-4 flex justify-between shadow-md mt-6"
    >
      <button
        className={`
          flex items-center px-4 py-2 rounded-lg font-medium transition-all
          ${isFirstStep || isBackDisabled || isProcessing 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
        `}
        onClick={onBack}
        disabled={isFirstStep || isBackDisabled || isProcessing}
      >
        <svg 
          className="w-4 h-4 mr-1.5" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
            clipRule="evenodd" 
          />
        </svg>
        {backLabel}
      </button>

      <button
        className={`
          flex items-center px-4 py-2 rounded-lg font-medium text-white
          ${isNextDisabled || isProcessing 
            ? 'bg-indigo-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700'}
          transition-all min-w-[120px] justify-center
        `}
        onClick={onNext}
        disabled={isNextDisabled || isProcessing}
      >
        {isProcessing ? (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : null}
        
        {isLastStep ? "Завершить" : nextLabel}
        
        {!isProcessing && (
          <svg 
            className="w-4 h-4 ml-1.5" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
      </button>
    </div>
  );
});

StepNavigation.displayName = 'StepNavigation';

export default StepNavigation;
