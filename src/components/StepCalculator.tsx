import React, { useState } from 'react';
import { DecisionNode, decisionTree, Edition, editions } from '@/data/licenseData';

interface StepCalculatorProps {
  onEditionSelect: (edition: Edition | null) => void;
}

const StepCalculator: React.FC<StepCalculatorProps> = ({ onEditionSelect }) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [history, setHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  // Current node в дереве решений
  const currentNode = decisionTree[currentNodeId];

  // Определяем, является ли текущий узел конечным (с результатом)
  const isEndNode = !!currentNode.result;
  
  // Обработчик ответов пользователя
  const handleAnswer = (answer: boolean) => {
    // Сохраняем ответ
    setAnswers(prev => ({ ...prev, [currentNodeId]: answer }));
    
    // Добавляем текущий узел в историю
    setHistory(prev => [...prev, currentNodeId]);
    
    // Определяем следующий узел на основе ответа
    const nextNodeId = answer 
      ? currentNode.yes 
      : currentNode.no;
    
    if (nextNodeId) {
      setCurrentNodeId(nextNodeId);
      
      // Если достигли узла с результатом, возвращаем выбранную редакцию
      const nextNode = decisionTree[nextNodeId];
      if (nextNode.result) {
        const edition = editions.find(e => e.id === nextNode.result) || null;
        onEditionSelect(edition);
      }
    }
  };

  // Функция для возврата на шаг назад
  const handleBack = () => {
    if (history.length > 0) {
      // Получаем предыдущий узел
      const prevNodeId = history[history.length - 1];
      
      // Удаляем последний узел из истории
      setHistory(prev => prev.slice(0, -1));
      
      // Устанавливаем предыдущий узел как текущий
      setCurrentNodeId(prevNodeId);
      
      // Очищаем выбор редакции если мы не на финальном узле
      if (!decisionTree[prevNodeId].result) {
        onEditionSelect(null);
      }
    } else {
      // Если истории нет, возвращаемся к корневому узлу
      handleReset();
    }
  };

  // Сброс калькулятора
  const handleReset = () => {
    setCurrentNodeId('root');
    setHistory([]);
    setAnswers({});
    onEditionSelect(null);
  };

  // Функция для получения прогресса (в процентах)
  const getProgress = () => {
    // Оценка максимальной глубины дерева (примерно)
    const maxDepth = 6;
    
    // Оценка текущей глубины на основе истории
    const currentDepth = history.length;
    
    // Если достигли конечного узла, возвращаем 100%
    if (isEndNode) return 100;
    
    // Иначе рассчитываем примерный процент прогресса
    return Math.min(Math.round((currentDepth / maxDepth) * 100), 95);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Шапка калькулятора */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <h2 className="text-2xl font-bold">
          Калькулятор редакции Deckhouse
        </h2>
        <p className="opacity-80 mt-1">
          {isEndNode 
            ? 'Мы подобрали подходящую редакцию для ваших требований' 
            : 'Ответьте на несколько вопросов для подбора оптимальной редакции'}
        </p>
      </div>
      
      {/* Индикатор прогресса */}
      <div className="px-6 pt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Начало</span>
          <span>Прогресс: {getProgress()}%</span>
          <span>Результат</span>
        </div>
      </div>
      
      {/* Тело калькулятора */}
      <div className="p-6">
        {/* Вопрос */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {currentNode.question}
          </h3>
          
          {currentNode.featureId && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-700">
              <p>
                Данный пункт влияет на выбор редакции и доступность ключевых функций платформы.
              </p>
            </div>
          )}
        </div>
        
        {/* Кнопки ответов */}
        {!isEndNode ? (
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
            {currentNode.yes && (
              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 py-3 px-5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow transition duration-200 flex items-center justify-center"
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
                className="flex-1 py-3 px-5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow transition duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Нет
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleReset}
            className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition duration-200"
          >
            Начать заново
          </button>
        )}
      </div>
      
      {/* Навигация и история */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
        <button
          onClick={handleBack}
          className={`flex items-center text-sm font-medium ${
            history.length > 0 
              ? 'text-blue-600 hover:text-blue-800' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          disabled={history.length === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Назад
        </button>
        
        <button
          onClick={handleReset}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Начать заново
        </button>
      </div>
    </div>
  );
};

export default StepCalculator;
