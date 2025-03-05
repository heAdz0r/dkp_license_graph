import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

export interface StepConfig {
  key: string;
  label: string;
  component: ReactNode;
  canUndo?: boolean;
  isOptional?: boolean;
  subtitle?: string;
}

interface StepsContextType {
  steps: StepConfig[];
  setSteps: (newSteps: StepConfig[]) => void;
  activeStep: number;
  goToStep: (step: number) => void;
  goNext: () => void;
  goBack: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  totalSteps: number;
  setCanGoNext: (canProceed: boolean) => void;
  currentStepConfig: StepConfig | null;
}

interface StepsProviderProps {
  children: ReactNode;
  initialSteps: StepConfig[];
  onChange?: (activeStep: number, prevStep: number) => void;
  allowSkipAhead?: boolean;
}

const StepsContext = createContext<StepsContextType | null>(null);

export function StepsProvider({
  children,
  initialSteps,
  onChange,
  allowSkipAhead = false,
}: StepsProviderProps) {
  const [steps, setSteps] = useState<StepConfig[]>(initialSteps);
  const [activeStep, setActiveStep] = useState(0);
  const [canGoNext, setCanGoNext] = useState(true);
  const totalSteps = steps.length;
  
  // Для отслеживания предыдущего шага
  const [prevStep, setPrevStep] = useState(0);
  
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === totalSteps - 1;
  
  // Navigate to specific step - оптимизировано для предотвращения циклических обновлений
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      // Проверяем, совпадает ли новый шаг с активным - если да, не производим обновления
      if (step === activeStep) {
        return; // Предотвращаем ненужное обновление
      }
      
      // Only allow navigating to completed steps or the next available step
      if (allowSkipAhead || step <= activeStep + 1) {
        // Сохраняем предыдущий шаг
        setPrevStep(activeStep);
        
        // Обновляем текущий шаг
        setActiveStep(step);
        
        if (onChange) {
          onChange(step, activeStep);
        }
      }
    }
  }, [totalSteps, activeStep, allowSkipAhead, onChange]);
  
  // Go to next step
  const goNext = useCallback(() => {
    if (!isLastStep && canGoNext) {
      goToStep(activeStep + 1);
    }
  }, [isLastStep, canGoNext, goToStep, activeStep]);
  
  // Go to previous step
  const goBack = useCallback(() => {
    if (!isFirstStep) {
      goToStep(activeStep - 1);
    }
  }, [isFirstStep, goToStep, activeStep]);
  
  // Обработчик для обновления всей последовательности шагов
  const handleSetSteps = useCallback((newSteps: StepConfig[]) => {
    if (newSteps.length === 0) {
      console.warn('Attempt to set empty steps array, ignoring');
      return;
    }

    setSteps(newSteps);
    
    // Если текущий шаг больше, чем количество новых шагов, сбрасываем на последний доступный
    if (activeStep >= newSteps.length) {
      setActiveStep(0); // Возвращаемся к первому шагу при изменении конфигурации
      setPrevStep(0);
    }
  }, [activeStep]);
  
  // Current step configuration
  const currentStepConfig = useMemo(() => steps[activeStep] || null, [steps, activeStep]);
  
  // Additional utilities
  const canGoBack = !isFirstStep;
  
  // Context value - мемоизирован для предотвращения ненужных перерендеров
  const contextValue = useMemo(() => ({
    steps,
    setSteps: handleSetSteps,
    activeStep,
    goToStep,
    goNext,
    goBack,
    canGoNext,
    canGoBack,
    isFirstStep,
    isLastStep,
    totalSteps,
    setCanGoNext,
    currentStepConfig
  }), [
    steps,
    handleSetSteps,
    activeStep,
    goToStep,
    goNext,
    goBack,
    canGoNext,
    canGoBack,
    isFirstStep,
    isLastStep,
    totalSteps,
    currentStepConfig
  ]);
  
  return (
    <StepsContext.Provider value={contextValue}>
      {children}
    </StepsContext.Provider>
  );
}

// Custom hook to use the steps context
export function useSteps() {
  const context = useContext(StepsContext);
  
  if (!context) {
    throw new Error('useSteps must be used within a StepsProvider');
  }
  
  return context;
}
