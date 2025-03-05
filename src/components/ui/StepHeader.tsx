import React, { useCallback, memo } from 'react';
import { StepConfig } from '../providers/StepsProvider';

interface StepHeaderProps {
  steps: StepConfig[];
  activeStep: number;
  onStepChange: (step: number) => void;
  onUndo?: (step: number) => void;
  showDrafts?: boolean;
  onToggleDrafts?: () => void;
}

// Custom step icon component to show active, completed, and undo states
const StepIcon = memo(({ 
  step, 
  isActive, 
  isCompleted, 
  stepNumber, 
  canUndo, 
  onUndo 
}: { 
  step: StepConfig;
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
  canUndo?: boolean;
  onUndo?: () => void;
}) => {
  // Handle undo action
  const handleUndo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Предотвращаем лишние срабатывания
    if (onUndo) onUndo();
  }, [onUndo]);
  
  return (
    <div className="relative">
      {/* Undo button */}
      {canUndo && (
        <div 
          className="absolute -top-6 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center"
          onClick={handleUndo}
        >
          <svg 
            className="w-3.5 h-3.5 text-indigo-600" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          <span className="text-xs font-semibold text-indigo-600 leading-none">UNDO</span>
        </div>
      )}
      
      {/* Icon content */}
      <div 
        className={`
          w-8 h-8 rounded-full flex items-center justify-center
          ${isCompleted 
            ? 'bg-indigo-600 text-white' 
            : isActive 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-300 text-gray-700'}
          transition-all duration-200
        `}
      >
        {isCompleted ? (
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <span className="text-sm font-semibold">{stepNumber + 1}</span>
        )}
      </div>
    </div>
  );
});

StepIcon.displayName = 'StepIcon';

// Мемоизация необязательной части StepLabel для предотвращения лишних перерендеров
const StepDescription = memo(({ isOptional, subtitle, isActive }: { 
  isOptional?: boolean; 
  subtitle?: string; 
  isActive: boolean; 
}) => {
  if (isOptional) {
    return (
      <span className="text-xs text-gray-500">
        Optional
      </span>
    );
  }
  
  if (subtitle) {
    return (
      <span 
        className={`text-xs ${isActive ? 'text-indigo-600' : 'text-gray-500'} block max-w-[140px] truncate mx-auto`}
      >
        {subtitle}
      </span>
    );
  }
  
  return null;
});

StepDescription.displayName = 'StepDescription';

export const StepHeader = memo(({ 
  steps, 
  activeStep, 
  onStepChange, 
  onUndo,
  showDrafts = false,
  onToggleDrafts
}: StepHeaderProps) => {
  // Handle step click - мемоизирован для предотвращения лишних ре-рендеров
  const handleStepClick = useCallback((index: number) => (e: React.MouseEvent) => {
    // Предотвращаем всплытие события
    e.stopPropagation();
    e.preventDefault();
    
    // Проверяем, можно ли переходить на этот шаг
    if (index <= activeStep || index === activeStep + 1) {
      // Избегаем ненужного обновления, если кликаем на текущий шаг
      if (index !== activeStep) {
        onStepChange(index);
      }
    }
  }, [activeStep, onStepChange]);
  
  // Handle undo action for a specific step - мемоизирован
  const handleUndo = useCallback((step: number) => {
    if (onUndo) onUndo(step);
  }, [onUndo]);
  
  return (
    <div
      className="relative rounded-xl bg-gray-50 p-2 border border-gray-200 shadow-md backdrop-blur-sm overflow-x-auto"
    >
      {/* Кнопка черновиков в правом верхнем углу */}
      {onToggleDrafts && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={onToggleDrafts}
            className={`p-1.5 rounded-md ${showDrafts ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
            title={showDrafts ? "Скрыть черновики" : "Показать черновики"}
          >
            <svg 
              className="w-5 h-5" 
              xmlns="http://www.w3.org/2000/svg" 
              fill={showDrafts ? "currentColor" : "none"} 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
              />
            </svg>
          </button>
        </div>
      )}
    
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div 
            key={step.key} 
            className={`
              flex-1 flex flex-col items-center relative
              ${index < activeStep ? 'text-indigo-600' : index === activeStep ? 'text-indigo-600' : 'text-gray-500'}
              ${index === steps.length - 1 ? '' : 'after:content-[""] after:w-full after:h-0.5 after:border-t after:border-gray-300 after:absolute after:top-4 after:left-1/2 after:z-0'}
              cursor-pointer
            `}
            onClick={handleStepClick(index)}
          >
            <div className="z-10 flex justify-center items-center mb-2">
              <StepIcon 
                step={step}
                isActive={index === activeStep}
                isCompleted={index < activeStep}
                stepNumber={index}
                canUndo={step.canUndo}
                onUndo={() => handleUndo(index)}
              />
            </div>
            
            <div 
              className={`
                text-sm text-center transition-colors duration-200
                ${index === activeStep ? 'font-semibold' : 'font-medium'}
              `}
            >
              {step.label}
            </div>
            
            <StepDescription 
              isOptional={step.isOptional} 
              subtitle={step.subtitle} 
              isActive={index === activeStep} 
            />
          </div>
        ))}
      </div>
    </div>
  );
});

// Указываем displayName для отладки 
StepHeader.displayName = 'StepHeader';

export default StepHeader;
