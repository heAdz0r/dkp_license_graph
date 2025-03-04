import React, { useMemo, useState } from 'react';
import { Edition, Feature, editions, features, CATEGORIES } from '@/data/licenseData';

interface ComparisonTableProps {
  selectedEditions?: Edition[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ selectedEditions }) => {
  // Фильтр по категориям
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Фильтр по важности функций
  const [minImportance, setMinImportance] = useState<number>(0);
  
  // Эффективно вычисляем редакции для отображения
  const editionsToShow = useMemo(() => {
    return selectedEditions?.length ? selectedEditions : editions;
  }, [selectedEditions]);
  
  // Фильтруем функции по активной категории и важности
  const filteredFeatures = useMemo(() => {
    return features.filter(feature => 
      (activeCategory === null || feature.category === activeCategory) &&
      feature.importance >= minImportance
    ).sort((a, b) => {
      // Сначала сортируем по категории
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      // Затем по важности (более важные сверху)
      return b.importance - a.importance;
    });
  }, [activeCategory, minImportance]);
  
  // Рендер значка статуса функции
  const renderFeatureStatus = (edition: Edition, featureId: string) => {
    const status = edition.features[featureId];
    
    switch (status) {
      case 'present':
        return (
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'absent':
        return (
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'planned':
        return (
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'conditionally-available':
        return (
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  // Функция для отображения категории в виде заголовка с учетом сортировки
  const renderCategoryHeader = (category: string) => {
    const categoryFeatures = filteredFeatures.filter(feature => feature.category === category);
    if (categoryFeatures.length === 0) return null;
    
    return (
      <tr key={`header-${category}`} className="bg-indigo-50">
        <th colSpan={editionsToShow.length + 1} className="py-3 px-4 font-medium text-indigo-800 text-left">
          <div className="flex items-center">
            <span>{category}</span>
            <span className="ml-2 text-xs text-indigo-600 font-normal">
              {categoryFeatures.length} функций
            </span>
          </div>
        </th>
      </tr>
    );
  };

  // Группировка функций по категориям для отображения
  const categoriesWithFeatures = useMemo(() => {
    const result: Record<string, Feature[]> = {};
    
    filteredFeatures.forEach(feature => {
      if (!result[feature.category]) {
        result[feature.category] = [];
      }
      result[feature.category].push(feature);
    });
    
    return result;
  }, [filteredFeatures]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Фильтры и легенда */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Фильтры категорий */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Фильтр по категориям:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1 text-xs rounded-full ${
                  activeCategory === null
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                Все
              </button>
              
              {Object.values(CATEGORIES).map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    activeCategory === category
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Фильтр важности */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Важность функций:</h3>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={minImportance}
                onChange={e => setMinImportance(parseInt(e.target.value))}
                className="w-40 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="ml-3 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                {minImportance > 0 ? `≥ ${minImportance}` : 'Все'}
              </span>
            </div>
          </div>
          
          {/* Легенда */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Обозначения:</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center text-xs">
                <svg className="w-4 h-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Есть</span>
              </div>
              
              <div className="flex items-center text-xs">
                <svg className="w-4 h-4 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Нет</span>
              </div>
              
              <div className="flex items-center text-xs">
                <svg className="w-4 h-4 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Планируется</span>
              </div>
              
              <div className="flex items-center text-xs">
                <svg className="w-4 h-4 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Условно</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Таблица сравнения */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
            <tr>
              <th scope="col" className="py-3 px-6 bg-white sticky left-0 z-20 shadow-sm">
                Функция
              </th>
              {editionsToShow.map(edition => (
                <th key={edition.id} scope="col" className="py-3 px-6 text-center">
                  <div>
                    <div className="font-bold">{edition.name}</div>
                    <div className="text-gray-500 text-xs font-normal mt-1">{edition.description}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {/* Если нет функций после фильтрации */}
            {filteredFeatures.length === 0 && (
              <tr className="bg-white">
                <td colSpan={editionsToShow.length + 1} className="py-10 px-6 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Нет функций, соответствующих выбранным фильтрам</p>
                    <button 
                      onClick={() => {
                        setActiveCategory(null);
                        setMinImportance(0);
                      }}
                      className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                </td>
              </tr>
            )}
            
            {/* Отображаем функции, сгруппированные по категориям */}
            {Object.entries(categoriesWithFeatures).map(([category, categoryFeatures]) => (
              <React.Fragment key={category}>
                {renderCategoryHeader(category)}
                
                {categoryFeatures.map(feature => (
                  <tr key={feature.id} className="bg-white border-b hover:bg-gray-50">
                    <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap bg-white sticky left-0 z-10">
                      <div>
                        <div className="font-medium">{feature.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{feature.description}</div>
                        {feature.importance >= 8 && (
                          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Высокая важность
                          </span>
                        )}
                      </div>
                    </th>
                    
                    {editionsToShow.map(edition => (
                      <td key={`${edition.id}-${feature.id}`} className="py-4 px-6">
                        {renderFeatureStatus(edition, feature.id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
