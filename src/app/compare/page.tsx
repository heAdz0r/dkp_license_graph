'use client';

import React, { useState } from 'react';
import ComparisonTable from '@/components/ComparisonTable';
import { editions } from '@/data/licenseData';
import Link from 'next/link';

export default function ComparePage() {
  const [selectedEditions, setSelectedEditions] = useState(
    editions.map(e => e.id)
  );

  const handleEditionToggle = (editionId: string) => {
    setSelectedEditions(prev => {
      if (prev.includes(editionId)) {
        return prev.filter(id => id !== editionId);
      } else {
        return [...prev, editionId];
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-4 shadow rounded-lg">
        <h2 className="text-xl font-bold mb-4">Сравнение редакций Deckhouse Kubernetes Platform</h2>
        <p className="mb-4">
          Выберите редакции, которые хотите сравнить:
        </p>
        
        <div className="flex flex-wrap gap-3 mb-6">
          {editions.map(edition => (
            <div key={edition.id} className="flex items-center">
              <input
                type="checkbox"
                id={`edition-${edition.id}`}
                checked={selectedEditions.includes(edition.id)}
                onChange={() => handleEditionToggle(edition.id)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor={`edition-${edition.id}`} className="ml-2 text-sm text-gray-700">
                {edition.name}
              </label>
            </div>
          ))}
        </div>
        
        <Link 
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
        >
          &larr; Вернуться к выбору редакции
        </Link>
      </div>
      
      <ComparisonTable 
        selectedEditions={
          selectedEditions.length > 0 
            ? editions.filter(e => selectedEditions.includes(e.id))
            : undefined
        } 
      />
    </div>
  );
}
