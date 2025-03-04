'use client';

import React, { useState } from 'react';
import DecisionTree from '@/components/DecisionTree';
import EditionCard from '@/components/EditionCard';
import ComparisonTable from '@/components/ComparisonTable';
import { Edition, features } from '@/data/licenseData';

export default function Home() {
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  const [showFullComparison, setShowFullComparison] = useState(false);

  return (
    <div className="flex flex-col space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <DecisionTree onEditionSelect={setSelectedEdition} />
        </div>
        
        <div>
          {selectedEdition ? (
            <div className="space-y-6">
              <EditionCard edition={selectedEdition} features={features} />
              
              <div className="bg-white p-4 shadow rounded-lg">
                <button
                  onClick={() => setShowFullComparison(!showFullComparison)}
                  className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded"
                >
                  {showFullComparison ? 'Скрыть полное сравнение' : 'Показать полное сравнение'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 shadow rounded-lg">
              <h2 className="text-xl font-bold mb-4">Как выбрать редакцию?</h2>
              <p className="mb-4">
                Ответьте на вопросы в интерактивном графе слева, чтобы получить рекомендацию по выбору 
                оптимальной редакции Deckhouse Kubernetes Platform.
              </p>
              <p className="mb-4">
                В зависимости от ваших требований, система проанализирует доступные опции и 
                порекомендует наиболее подходящую для вас лицензию.
              </p>
              <h3 className="text-lg font-semibold mb-2">Основные критерии:</h3>
              <ul className="list-disc pl-5 mb-4">
                <li>Требования к сертификации и безопасности</li>
                <li>Наличие в реестре российского ПО</li>
                <li>Возможность работы в закрытом контуре</li>
                <li>Необходимость интерфейса администратора</li>
                <li>Централизованное управление кластерами</li>
              </ul>
              <p>
                После получения рекомендации вы сможете увидеть подробную информацию о выбранной 
                редакции и сравнить её с другими.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {showFullComparison && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Полное сравнение редакций</h2>
          <ComparisonTable selectedEditions={selectedEdition ? [selectedEdition] : undefined} />
        </div>
      )}
    </div>
  );
}
