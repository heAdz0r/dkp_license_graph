"use client";

import React, { useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import StepCalculator from "@/components/StepCalculator";
import EnhancedCalculator from "@/components/EnhancedCalculator";
import EditionCard from "@/components/EditionCard";
import ComparisonTable from "@/components/ComparisonTable";
import { Edition, features } from "@/data/licenseData";

// Динамический импорт компонентов визуализации для оптимизации производительности
const DecisionTree = dynamic(() => import("@/components/DecisionTree"), {
  ssr: false,
  loading: () => <LoadingVisualizer />
});

const EnhancedDecisionTree = dynamic(() => import("@/components/EnhancedDecisionTree"), {
  ssr: false,
  loading: () => <LoadingVisualizer />
});

// Компонент для отображения загрузки визуализации
const LoadingVisualizer = () => (
  <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="flex flex-col items-center text-gray-500">
      <svg className="w-10 h-10 text-gray-300 mb-3 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <div>Загрузка визуализации графа решений...</div>
    </div>
  </div>
);

export default function Home() {
  // Состояние для выбранной редакции
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  
  // Состояние для отображения полного сравнения
  const [showFullComparison, setShowFullComparison] = useState(false);
  
  // Состояние для переключения между калькулятором и визуализацией
  const [viewMode, setViewMode] = useState<'calculator' | 'visualization'>('calculator');
  
  // Состояние для переключения между базовыми и улучшенными компонентами
  const [useEnhanced, setUseEnhanced] = useState(true);
  
  // Функция для выбора редакции
  const handleEditionSelect = useCallback((edition: Edition | null) => {
    setSelectedEdition(edition);
  }, []);

  return (
    <div className="flex flex-col space-y-8">
      {/* Верхняя информационная секция */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Выбор редакции Deckhouse Kubernetes Platform
        </h1>
        <p className="text-gray-600 mb-4">
          Подберите оптимальную редакцию Deckhouse Kubernetes Platform для ваших требований с помощью 
          интерактивного калькулятора или визуализации графа принятия решений.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setViewMode('calculator')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center ${
              viewMode === 'calculator' 
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <svg className="w-5 h-5 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Пошаговый калькулятор
          </button>
          
          <button
            onClick={() => setViewMode('visualization')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center ${
              viewMode === 'visualization' 
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <svg className="w-5 h-5 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Визуализация графа
          </button>
          
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600">Улучшенный интерфейс:</span>
            <button
              onClick={() => setUseEnhanced(!useEnhanced)}
              className={`w-12 h-6 flex items-center rounded-full p-1 ${
                useEnhanced ? 'bg-indigo-600 justify-end' : 'bg-gray-300 justify-start'
              } transition-all duration-300`}
              aria-label={useEnhanced ? "Отключить улучшенный интерфейс" : "Включить улучшенный интерфейс"}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Основная секция с калькулятором/визуализацией и карточкой редакции */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка (2/3 ширины на больших экранах) */}
        <div className={`${viewMode === 'visualization' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          {viewMode === 'calculator' ? (
            useEnhanced ? (
              <EnhancedCalculator 
                onEditionSelect={handleEditionSelect} 
                selectedEdition={selectedEdition}
              />
            ) : (
              <StepCalculator onEditionSelect={handleEditionSelect} />
            )
          ) : (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-xl font-bold mb-2">Интерактивный граф принятия решений</h2>
                <p className="text-gray-600">
                  Визуализация процесса выбора редакции на основе ваших требований. Взаимодействуйте с графом,
                  используя масштабирование, перемещение и клики по узлам для навигации по вариантам выбора.
                </p>
              </div>
              {useEnhanced ? (
                <EnhancedDecisionTree 
                  onEditionSelect={handleEditionSelect}
                  width={1000}
                  height={700}
                />
              ) : (
                <DecisionTree onEditionSelect={handleEditionSelect} />
              )}
            </div>
          )}
        </div>
        
        {/* Правая колонка (1/3 ширины на больших экранах) */}
        {viewMode === 'calculator' && (
          <div>
            {selectedEdition ? (
              <div className="space-y-6">
                <EditionCard edition={selectedEdition} features={features} />
                
                <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
                  <button
                    onClick={() => setShowFullComparison(!showFullComparison)}
                    className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg shadow transition duration-200 flex items-center justify-center"
                  >
                    <svg 
                      className="w-5 h-5 mr-2" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={showFullComparison 
                          ? "M5 15l7-7 7 7" 
                          : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                    {showFullComparison
                      ? "Скрыть полное сравнение"
                      : "Показать полное сравнение"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 shadow-lg rounded-lg border border-gray-200">
                <div className="flex items-center mb-4 text-blue-600">
                  <svg className="w-8 h-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-bold">Как выбрать редакцию?</h2>
                </div>
                
                <p className="mb-4 text-gray-700">
                  Используйте интерактивный калькулятор слева, чтобы получить рекомендацию по выбору оптимальной редакции
                  Deckhouse Kubernetes Platform на основе ваших требований.
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Основные критерии выбора:</h3>
                  <ul className="space-y-2 text-blue-700">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Требования к сертификации ФСТЭК
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Наличие в реестре российского ПО
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Возможность работы в закрытом контуре
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Необходимость интерфейса администратора
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Расширенные функции безопасности
                    </li>
                  </ul>
                </div>
                
                <p className="text-gray-700">
                  После получения рекомендации вы увидите подробную информацию о выбранной редакции и сможете сравнить её с другими
                  вариантами для принятия оптимального решения.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Результаты выбора в режиме визуализации */}
      {viewMode === 'visualization' && selectedEdition && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 animate-fadeIn">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="lg:w-2/3">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Выбранная редакция</h2>
              <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                    <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">{selectedEdition.name}</h3>
                    <p className="text-indigo-700">{selectedEdition.description}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={() => setShowFullComparison(!showFullComparison)}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition duration-200 flex items-center justify-center"
                  >
                    <svg 
                      className="w-5 h-5 mr-2" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={showFullComparison 
                          ? "M5 15l7-7 7 7" 
                          : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                    {showFullComparison
                      ? "Скрыть полное сравнение"
                      : "Показать полное сравнение"}
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:w-1/3">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Ключевые характеристики</h3>
              <ul className="space-y-2">
                {features
                  .filter(feature => feature.importance >= 8 && selectedEdition.features[feature.id] === 'present')
                  .map(feature => (
                    <li key={feature.id} className="flex items-start p-2 border border-green-100 rounded-md bg-green-50">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">{feature.name}</div>
                        <div className="text-xs text-gray-600">{feature.description}</div>
                      </div>
                    </li>
                  ))}
                  
                {features
                  .filter(feature => feature.importance >= 8 && selectedEdition.features[feature.id] === 'absent')
                  .map(feature => (
                    <li key={feature.id} className="flex items-start p-2 border border-red-100 rounded-md bg-red-50">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">{feature.name}</div>
                        <div className="text-xs text-gray-600">{feature.description}</div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Секция полного сравнения (отображается, если включено) */}
      {showFullComparison && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Полное сравнение редакций</h2>
            <button
              onClick={() => setShowFullComparison(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <ComparisonTable
            selectedEditions={selectedEdition ? [selectedEdition] : undefined}
          />
        </div>
      )}
      
      {/* Информационная плашка о улучшенном интерфейсе */}
      {useEnhanced && (
        <div className="fixed bottom-4 left-4 max-w-xs bg-blue-600 text-white p-3 rounded-lg shadow-lg animate-fadeIn flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium">Включен улучшенный интерфейс</p>
            <p className="text-xs mt-1 text-blue-100">Используются новые компоненты с расширенными возможностями навигации, зумирования и визуализации</p>
          </div>
          <button 
            className="ml-2 text-blue-200 hover:text-white" 
            onClick={() => setUseEnhanced(false)}
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
