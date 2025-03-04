"use client";

import React, { useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import StepCalculator from "@/components/StepCalculator";
import EditionCard from "@/components/EditionCard";
import ComparisonTable from "@/components/ComparisonTable";
import { Edition, features } from "@/data/licenseData";

// Динамический импорт компонента визуализации графа для оптимизации производительности
const DecisionTree = dynamic(() => import("@/components/DecisionTree"), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="text-gray-500">Загрузка визуализации графа решений...</div>
  </div>
});

export default function Home() {
  // Состояние для выбранной редакции
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  
  // Состояние для отображения полного сравнения
  const [showFullComparison, setShowFullComparison] = useState(false);
  
  // Состояние для переключения между калькулятором и визуализацией
  const [viewMode, setViewMode] = useState<'calculator' | 'visualization'>('calculator');
  
  // Функция для выбора редакции
  const handleEditionSelect = useCallback((edition: Edition | null) => {
    setSelectedEdition(edition);
  }, []);
  
  // Функция для переключения режима просмотра
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'calculator' ? 'visualization' : 'calculator');
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
        </div>
      </div>
      
      {/* Основная секция с калькулятором/визуализацией и карточкой редакции */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка (2/3 ширины на больших экранах) */}
        <div className="lg:col-span-2">
          {viewMode === 'calculator' ? (
            <StepCalculator onEditionSelect={handleEditionSelect} />
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Граф принятия решений</h2>
              <p className="text-gray-600 mb-4">
                Визуализация процесса выбора редакции на основе ваших требований. Вы можете взаимодействовать с графом,
                кликая на узлы для перехода между вопросами.
              </p>
              <DecisionTree onEditionSelect={handleEditionSelect} />
            </div>
          )}
        </div>
        
        {/* Правая колонка (1/3 ширины на больших экранах) */}
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
      </div>
      
      {/* Секция полного сравнения (отображается, если включено) */}
      {showFullComparison && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
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
    </div>
  );
}
