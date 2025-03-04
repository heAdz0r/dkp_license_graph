import React, { useMemo } from 'react';
import { Edition, Feature, editions, features, CATEGORIES } from '@/data/licenseData';

interface ComparisonTableProps {
  selectedEditions?: Edition[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ selectedEditions }) => {
  const editionsToShow = useMemo(() => {
    return selectedEditions?.length ? selectedEditions : editions;
  }, [selectedEditions]);

  const renderFeatureStatus = (edition: Edition, featureId: string) => {
    const status = edition.features[featureId];
    
    switch (status) {
      case 'present':
        return (
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'absent':
        return (
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'planned':
        return (
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'conditionally-available':
        return (
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="py-3 px-6">
              Функция
            </th>
            {editionsToShow.map(edition => (
              <th key={edition.id} scope="col" className="py-3 px-6 text-center">
                {edition.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.values(CATEGORIES).map(category => (
            <React.Fragment key={category}>
              <tr className="bg-blue-100">
                <th colSpan={editionsToShow.length + 1} className="py-2 px-6 font-medium text-gray-900">
                  {category}
                </th>
              </tr>
              
              {features
                .filter(feature => feature.category === category)
                .sort((a, b) => b.importance - a.importance)
                .map(feature => (
                  <tr key={feature.id} className="bg-white border-b hover:bg-gray-50">
                    <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                      <div>
                        <div>{feature.name}</div>
                        <div className="text-xs text-gray-500">{feature.description}</div>
                      </div>
                    </th>
                    
                    {editionsToShow.map(edition => (
                      <td key={`${edition.id}-${feature.id}`} className="py-4 px-6">
                        {renderFeatureStatus(edition, feature.id)}
                      </td>
                    ))}
                  </tr>
                ))
              }
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
