'use client';

import React, { useState, useMemo } from 'react';
import ComparisonTable from '@/components/ComparisonTable';
import { editions } from '@/data/licenseData';
import Link from 'next/link';

export default function ComparePage() {
  // Состояние для выбранных редакций
  const [selectedEditions, setSelectedEditions] = useState(
    editions.map(e => e.id)
  );

  // Обработчик переключения редакций
  const handleEditionToggle = (editionId: string) => {
    setSelectedEditions(prev => {
      if (prev.includes(editionId)) {
        return prev.filter(id => id !== editionId);
      } else {
        return [...prev, editionId];
      }
    });
  };

  // Обработчик выбора всех редакций
  const handleSelectAll = () => {
    setSelectedEditions(editions.map(e => e.id));
  };

  // Обработчик сброса выбора редакций
  const handleClearAll = () => {
    setSelectedEditions([]);
  };

  // Фильтрованные редакции для отображения
  const editionsToShow = useMemo(() => {
    return selectedEditions.length > 0
      ? editions.filter(e => selectedEditions.includes(e.id))
      : undefined;
  }, [selectedEditions]);

  // Группировка редакций по типам
  const editionGroups = useMemo(() => {
    const groups = {
      certified: editions.filter(e => e.id.includes('cert')),
      commercial: editions.filter(e => !e.id.includes('cert') && e.id !== 'community'),
      community: editions.filter(e => e.id === 'community')
    };
    
    return groups;
  }, []);

  return (
    <div className="space-y-8">
      {/* Секция выбора редакций для сравнения */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-blue-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">
            Сравнение редакций Deckhouse Kubernetes Platform
          </h2>
          <p className="text-indigo-100 mt-1">
            Выберите редакции, которые хотите сравнить, и исследуйте их функциональные возможности
          </p>
        </div>
        
        <div className="p-6">
          {/* Управление выбором */}
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              Выбрано {selectedEditions.length} из {editions.length} редакций
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={handleSelectAll}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-md hover:bg-indigo-200 transition-colors text-sm"
              >
                Выбрать все
              </button>
              
              <button 
                onClick={handleClearAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors text-sm"
                disabled={selectedEditions.length === 0}
              >
                Очистить выбор
              </button>
            </div>
          </div>
          
          {/* Группы редакций для выбора */}
          <div className="space-y-6">
            {/* Сертифицированные редакции */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Сертифицированные редакции
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {editionGroups.certified.map(edition => (
                  <EditionCheckbox 
                    key={edition.id}
                    edition={edition}
                    isChecked={selectedEditions.includes(edition.id)}
                    onChange={() => handleEditionToggle(edition.id)}
                    highlight={true}
                  />
                ))}
              </div>
            </div>
            
            {/* Коммерческие редакции */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Коммерческие редакции
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {editionGroups.commercial.map(edition => (
                  <EditionCheckbox 
                    key={edition.id}
                    edition={edition}
                    isChecked={selectedEditions.includes(edition.id)}
                    onChange={() => handleEditionToggle(edition.id)}
                  />
                ))}
              </div>
            </div>
            
            {/* Открытые редакции */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Открытые редакции
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {editionGroups.community.map(edition => (
                  <EditionCheckbox 
                    key={edition.id}
                    edition={edition}
                    isChecked={selectedEditions.includes(edition.id)}
                    onChange={() => handleEditionToggle(edition.id)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Кнопка возврата */}
          <div className="mt-8 flex justify-between items-center">
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors"
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Вернуться к выбору редакции
            </Link>
            
            {/* Количество выбранных редакций */}
            {selectedEditions.length === 0 ? (
              <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-200 text-sm flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Выберите хотя бы одну редакцию для сравнения
              </div>
            ) : (
              <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg border border-green-200 text-sm flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Выбрано {selectedEditions.length} редакций для сравнения
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Секция таблицы сравнения */}
      {selectedEditions.length > 0 ? (
        <ComparisonTable selectedEditions={editionsToShow} />
      ) : (
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-12 text-center">
          <svg 
            className="w-16 h-16 mx-auto text-gray-300 mb-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" 
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Не выбрано ни одной редакции</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Выберите хотя бы одну редакцию выше, чтобы увидеть таблицу сравнения функциональных возможностей
          </p>
          <button 
            onClick={handleSelectAll}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors"
          >
            Выбрать все редакции
          </button>
        </div>
      )}
    </div>
  );
}

// Компонент для выбора редакции с красивым оформлением
interface EditionCheckboxProps {
  edition: { id: string; name: string; description: string };
  isChecked: boolean;
  onChange: () => void;
  highlight?: boolean;
}

const EditionCheckbox: React.FC<EditionCheckboxProps> = ({ 
  edition, 
  isChecked, 
  onChange,
  highlight = false
}) => {
  return (
    <label 
      className={`
        block p-4 rounded-lg border cursor-pointer transition-all relative overflow-hidden
        ${isChecked 
          ? 'border-indigo-300 bg-indigo-50 shadow-sm' 
          : 'border-gray-200 bg-white hover:bg-gray-50'
        }
        ${highlight ? 'ring-2 ring-indigo-100 ring-opacity-50' : ''}
      `}
    >
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={onChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <div className="font-medium text-gray-800">{edition.name}</div>
          <p className="text-gray-500 text-xs mt-1">{edition.description}</p>
          
          {/* Бейдж для специальных редакций */}
          {edition.id.includes('cert') && (
            <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              Сертифицировано ФСТЭК
            </span>
          )}
          {edition.id === 'community' && (
            <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Открытый исходный код
            </span>
          )}
        </div>
      </div>
      
      {/* Подсветка для отмеченных редакций */}
      {isChecked && (
        <div className="absolute top-0 right-0 px-2 py-1 bg-indigo-500 text-white text-xs font-medium shadow-sm transform rotate-12 translate-x-2 -translate-y-1">
          Выбрано
        </div>
      )}
    </label>
  );
};
