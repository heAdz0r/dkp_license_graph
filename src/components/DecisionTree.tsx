import React, { Suspense, lazy } from "react";
import { Edition } from "@/data/licenseData";

const DecisionTreeClient = lazy(() => import("./DecisionTreeClient")); // Путь к DecisionTreeClient.tsx

interface DecisionTreeProps {
  onEditionSelect: (edition: Edition | null) => void;
}

const DecisionTree: React.FC<DecisionTreeProps> = ({ onEditionSelect }) => {
  return (
    <Suspense fallback={<div>Загрузка дерева решений...</div>}>
      <DecisionTreeClient onEditionSelect={onEditionSelect} />
    </Suspense>
  );
};

export default DecisionTree;
