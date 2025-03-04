import React, { useMemo } from 'react';
import { Edition, Feature, FeatureStatus, features, CATEGORIES } from '@/data/licenseData';

interface EditionCardProps {
  edition: Edition;
  features: Feature[];
}

type StatusInfo = { label: string; color: string; icon: JSX.Element };

// Компонент для более наглядного отображения статуса функции
const EditionCard: React.FC<EditionCardProps> = ({ edition, features }) => {
  const statusConfig = useMemo<Record<FeatureStatus, StatusInfo>>(() => ({
    'present': {
      label: 'Доступно',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    },
    'absent': {
      label: 'Недоступно',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )
    },
    'planned': {
      label: 'Планируется',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    'conditionally-available': {
      label: 'Условно',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }
  }), []);

  // Фильтруем и группируем функции по категориям для лучшей организации
  const groupedFeatures = useMemo(() => {
    const result: Record<string, Feature[]> = {};
    
    // Создаем только те группы, функции которых есть в редакции
    Object.values(CATEGORIES).forEach(category => {
      const categoryFeatures = features
        .filter(feature => 
          feature.category === category && 
          feature.importance >= 7 // Только важные функции
        )
        .sort((a, b) => b.importance - a.importance);
      
      if (categoryFeatures.length > 0) {
        result[category] = categoryFeatures;
      }
    });
    
    return result;
  }, [features]);

  // Подсчет количества доступных функций
  const featureStats = useMemo(() => {
    const total = features.length;
    const available = Object.entries(edition.features)
      .filter(([_, status]) => status === 'present')
      .length;
    
    return {
      total,
      available,
      percentage: Math.round((available / total) * 100)
    };
  }, [edition.features, features.length]);

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
      {/* Шапка карточки */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{edition.name}</h2>
            <p className="text-indigo-100 mt-1">{edition.description}</p>
          </div>
          
          {/* Индикатор полноты функций */}
          <div className="flex flex-col items-center bg-white bg-opacity-20 p-2 rounded-lg">
            <svg className="w-12 h-12" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="3"
                strokeDasharray="100, 100"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeDasharray={`${featureStats.percentage}, 100`}
              />
              <text x="18" y="21" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                {featureStats.percentage}%
              </text>
            </svg>
            <span className="text-xs mt-1 text-center">Доступных функций</span>
          </div>
        </div>
        
        <div className="flex justify-between mt-4 text-xs text-indigo-100">
          <span>{featureStats.available} из {featureStats.total} функций</span>
          <span className="border border-indigo-300 px-2 py-1 rounded-full">
            ID: {edition.id}
          </span>
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="p-6">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <div key={category} className="mb-6 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {category}
            </h3>
            <ul className="space-y-3">
              {categoryFeatures.map(feature => {
                const status = edition.features[feature.id] || 'absent';
                const { label, color, icon } = statusConfig[status];
                
                return (
                  <li 
                    key={feature.id} 
                    className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mr-3">
                      {icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-800">{feature.name}</p>
                        <span className={`text-xs px-2 py-1 rounded-full border ${color}`}>
                          {label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      
      {/* Подвал карточки */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <a 
          href="https://deckhouse.ru/products/kubernetes-platform/pricing/" 
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-center shadow transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Подробнее о лицензировании
        </a>
      </div>
    </div>
  );
};

export default EditionCard;
