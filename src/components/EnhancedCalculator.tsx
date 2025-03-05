import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  DecisionNode, 
  decisionTree, 
  Edition, 
  editions,
  Feature,
  features
} from '@/data/licenseData';
import { StepsProvider, useSteps, StepConfig } from './providers/StepsProvider';
import StepHeader from './ui/StepHeader';
import StepNavigation from './ui/StepNavigation';
import EditionCard from './EditionCard';

interface EnhancedCalculatorProps {
  onEditionSelect: (edition: Edition | null) => void;
  selectedEdition: Edition | null;
}

// Внутренний компонент для рендеринга шагов
const StepContent = ({ 
  onEditionSelect, 
  selectedEdition
}: EnhancedCalculatorProps) => {
  // Доступ к контексту шагов
  const { 
    activeStep, 
    goNext, 
    goBack, 
    totalSteps, 
    currentStepConfig,
    goToStep
  } = useSteps();

  // Состояние для текущего узла в дереве решений
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  
  // Состояние для отслеживания ответов пользователя
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  
  // Получаем текущий узел из дерева решений
  const currentNode = decisionTree[currentNodeId];
  
  // Определяем, является ли текущий узел конечным (с результатом)
  const isEndNode = !!currentNode.result;

  // Эффект для обновления выбранной редакции при изменении текущего узла
  useEffect(() => {
    if (isEndNode && currentNode.result) {
      const edition = editions.find(e => e.id === currentNode.result) || null;
      onEditionSelect(edition);
    } else {
      onEditionSelect(null);
    }
  }, [currentNodeId, isEndNode, currentNode, onEditionSelect]);

  // Обработчик ответов пользователя
  const handleAnswer = useCallback((answer: boolean) => {
    // Сохраняем ответ
    setAnswers(prev => ({ ...prev, [currentNodeId]: answer }));
    
    // Определяем следующий узел на основе ответа
    const nextNodeId = answer 
      ? currentNode.yes 
      : currentNode.no;
    
    if (nextNodeId) {
      setCurrentNodeId(nextNodeId);
      
      // Если это был финальный вопрос, переходим к шагу результата
      const nextNode = decisionTree[nextNodeId];
      if (nextNode.result) {
        goNext(); // Переходим к следующему шагу (результату)
      }
    }
  }, [currentNode, currentNodeId, goNext]);

  // Функция сброса калькулятора
  const handleReset = useCallback(() => {
    setCurrentNodeId('root');
    setAnswers({});
    onEditionSelect(null);
    goToStep(0); // Возвращаемся к первому шагу
  }, [goToStep, onEditionSelect]);

  // Рендерим содержимое активного шага
  return (
    <div className="flex flex-col h-full">
      {/* Контент шага - вопрос или результат */}
      <div className="flex-grow p-6">
        {activeStep === 0 && (
          <>
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {currentNode.question}
            </h3>
            
            {currentNode.featureId && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-sm text-blue-700">
                <p>
                  Данный выбор влияет на доступность ключевых функций платформы и рекомендуемую редакцию.
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
              {currentNode.yes && (
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 py-4 px-5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow transition duration-200 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Да
                </button>
              )}
              
              {currentNode.no && (
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 py-4 px-5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow transition duration-200 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Нет
                </button>
              )}
            </div>
          </>
        )}
        
        {activeStep === 1 && selectedEdition && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Результат подбора редакции
            </h3>
            <p className="text-gray-600 mb-6">
              На основе ваших ответов мы рекомендуем следующую редакцию Deckhouse Kubernetes Platform:
            </p>
            
            <EditionCard 
              edition={selectedEdition} 
              features={features} 
            />
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleReset}
                className="px-5 py-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium rounded-lg flex items-center"
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Начать заново
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Кнопки навигации */}
      {!isEndNode && (
        <StepNavigation
          activeStep={activeStep}
          totalSteps={totalSteps}
          onNext={goNext}
          onBack={goBack}
          isNextDisabled={activeStep === 0}
          isBackDisabled={activeStep === 0}
          nextLabel="Пропустить"
          backLabel="Назад"
        />
      )}
    </div>
  );
};

// Основной компонент калькулятора с провайдером шагов
const EnhancedCalculator: React.FC<EnhancedCalculatorProps> = (props) => {
  // Определяем шаги калькулятора
  const steps: StepConfig[] = useMemo(() => [
    {
      key: 'questions',
      label: 'Вопросы',
      subtitle: 'Ответьте на вопросы',
      component: <></>, // Содержимое указываем внутри StepContent
    },
    {
      key: 'result',
      label: 'Результат',
      subtitle: 'Рекомендуемая редакция',
      component: <></>, // Содержимое указываем внутри StepContent
    }
  ], []);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Шапка калькулятора */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <h2 className="text-2xl font-bold">
          Калькулятор редакции Deckhouse
        </h2>
        <p className="opacity-80 mt-1">
          Ответьте на несколько вопросов для подбора оптимальной редакции
        </p>
      </div>
      
      {/* Провайдер шагов и содержимое */}
      <StepsProvider initialSteps={steps}>
        <div className="p-4">
          <StepHeader 
            steps={steps} 
            activeStep={0}
            onStepChange={() => {}}
          />
        </div>
        
        <StepContent 
          onEditionSelect={props.onEditionSelect}
          selectedEdition={props.selectedEdition}
        />
      </StepsProvider>
    </div>
  );
};

export default EnhancedCalculator;
