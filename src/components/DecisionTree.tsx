import React, { Suspense, lazy } from "react";
import { Edition } from "@/data/licenseData";

// Динамический импорт клиентского компонента
const DecisionTreeClient = lazy(() => import("./DecisionTreeClient"));

interface DecisionTreeProps {
  onEditionSelect: (edition: Edition | null) => void;
}

const DecisionTree: React.FC<DecisionTreeProps> = ({ onEditionSelect }) => {
  return (
    <Suspense 
      fallback={
        <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
          <div className="h-4 bg-gray-200 rounded mb-3 w-5/6"></div>
          
          <div className="flex space-x-4 mb-6">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
          
          <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center">
              <svg 
                className="w-12 h-12 text-gray-300 mb-4 animate-spin" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <div className="text-gray-500 text-sm font-medium">
                Загрузка визуализации графа решений...
              </div>
              <div className="text-gray-400 text-xs mt-2">
                Подготовка интерактивной диаграммы выбора редакции DKP
              </div>
            </div>
          </div>
        </div>
      }
    >
      <DecisionTreeClient onEditionSelect={onEditionSelect} />
    </Suspense>
  );
};

export default DecisionTree;
