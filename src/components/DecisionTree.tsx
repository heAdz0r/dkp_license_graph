import React, { Suspense, lazy } from "react";
import { Edition } from "@/data/licenseData";
import { CircularProgress, Box } from "@mui/material";

// Динамический импорт клиентского компонента
const DecisionTreeClient = lazy(() => import("./DecisionTreeClient"));

interface DecisionTreeProps {
  onEditionSelect: (edition: Edition | null) => void;
}

const DecisionTree: React.FC<DecisionTreeProps> = ({ onEditionSelect }) => {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            p: 6,
            bgcolor: "background.paper",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            height: "550px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CircularProgress size={48} sx={{ mb: 2 }} color="primary" />
            <Box
              sx={{
                typography: "body1",
                fontWeight: "medium",
                color: "text.primary",
                mb: 1,
              }}
            >
              Загрузка визуализации графа решений...
            </Box>
            <Box
              sx={{
                typography: "caption",
                color: "text.secondary",
              }}
            >
              Подготовка интерактивной диаграммы выбора редакции DKP
            </Box>
          </Box>
        </Box>
      }
    >
      <DecisionTreeClient onEditionSelect={onEditionSelect} />
    </Suspense>
  );
};

export default DecisionTree;
