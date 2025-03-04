import React from 'react';
import { Edition, Feature, FeatureStatus, features } from '@/data/licenseData';

interface EditionCardProps {
  edition: Edition;
  features: Feature[];
}

const statusLabels: Record<FeatureStatus, { label: string, color: string }> = {
  'present': { label: 'Есть', color: 'bg-green-100 text-green-800 border-green-200' },
  'absent': { label: 'Нет', color: 'bg-red-100 text-red-800 border-red-200' },
  'planned': { label: 'Планируется', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'conditionally-available': { label: 'Условно', color: 'bg-blue-100 text-blue-800 border-blue-200' }
};

const EditionCard: React.FC<EditionCardProps> = ({ edition, features }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">{edition.name}</h2>
        <p className="text-sm text-gray-600 mt-1">{edition.description}</p>
      </div>
      
      <div className="p-4">
        <h3 className="text-md font-semibold mb-2">Ключевые функции:</h3>
        <ul className="space-y-2">
          {features
            .filter(feature => feature.importance >= 7) // Показываем только важные функции
            .sort((a, b) => b.importance - a.importance)
            .map(feature => {
              const status = edition.features[feature.id] || 'absent';
              const { label, color } = statusLabels[status];
              
              return (
                <li key={feature.id} className="flex items-center justify-between">
                  <span className="text-sm">{feature.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${color}`}>
                    {label}
                  </span>
                </li>
              );
            })}
        </ul>
      </div>
      
      <div className="p-4 bg-gray-50">
        <button 
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
          onClick={() => window.open('https://deckhouse.ru/products/kubernetes-platform/pricing/', '_blank')}
        >
          Подробнее о редакции
        </button>
      </div>
    </div>
  );
};

export default EditionCard;
