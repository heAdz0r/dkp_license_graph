"use client";

import React, { useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import { 
  Grid, Typography, Box, Paper, Card, CardContent, 
  Tabs, Tab, Button, Alert, Collapse, IconButton 
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  ExpandLess as ExpandLessIcon,
  CompareArrows as CompareArrowsIcon,
  Calculate as CalculateIcon,
  GraphicEq as GraphicEqIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import StepCalculator from "@/components/StepCalculator";
import EditionCard from "@/components/EditionCard";
import ComparisonTable from "@/components/ComparisonTable";
import { Edition, features } from "@/data/licenseData";

// Динамический импорт компонента визуализации графа для оптимизации производительности
const DecisionTree = dynamic(() => import("@/components/DecisionTree"), {
  ssr: false,
  loading: () => (
    <Box 
      sx={{ 
        height: 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: 'background.paper', 
        borderRadius: 2 
      }}
    >
      <Typography color="text.secondary">Загрузка визуализации графа решений...</Typography>
    </Box>
  )
});

export default function Home() {
  // Состояние для выбранной редакции
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  
  // Состояние для отображения полного сравнения
  const [showFullComparison, setShowFullComparison] = useState(false);
  
  // Состояние для переключения между калькулятором и визуализацией
  const [viewMode, setViewMode] = useState<'calculator' | 'visualization'>('calculator');
  
  // Функция для выбора редакции
  const handleEditionSelect = useCallback((edition: Edition | null) => {
    setSelectedEdition(edition);
  }, []);
  
  return (
    <Box sx={{ py: 3 }}>
      {/* Верхняя информационная секция */}
      <Paper elevation={0} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
          Выбор редакции Deckhouse Kubernetes Platform
        </Typography>
        <Typography color="text.secondary" paragraph>
          Подберите оптимальную редакцию Deckhouse Kubernetes Platform для ваших требований с помощью 
          интерактивного калькулятора или визуализации графа принятия решений.
        </Typography>
        
        <Tabs 
          value={viewMode} 
          onChange={(_, newValue) => setViewMode(newValue)}
          sx={{ mt: 2 }}
        >
          <Tab 
            label="Пошаговый калькулятор" 
            value="calculator" 
            icon={<CalculateIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Визуализация графа" 
            value="visualization"
            icon={<GraphicEqIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>
      
      {/* Основная секция с калькулятором/визуализацией и карточкой редакции */}
      <Grid container spacing={3}>
        {/* Левая колонка (2/3 ширины на больших экранах) */}
        <Grid item xs={12} md={8}>
          {viewMode === 'calculator' ? (
            <StepCalculator onEditionSelect={handleEditionSelect} />
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Граф принятия решений
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Визуализация процесса выбора редакции на основе ваших требований. 
                  Вы можете взаимодействовать с графом, кликая на узлы для перехода между вопросами.
                </Typography>
                <DecisionTree onEditionSelect={handleEditionSelect} />
              </CardContent>
            </Card>
          )}
        </Grid>
        
        {/* Правая колонка (1/3 ширины на больших экранах) */}
        <Grid item xs={12} md={4}>
          {selectedEdition ? (
            <Box>
              <EditionCard edition={selectedEdition} features={features} />
              
              <Box sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  startIcon={showFullComparison ? <ExpandLessIcon /> : <CompareArrowsIcon />}
                  onClick={() => setShowFullComparison(!showFullComparison)}
                >
                  {showFullComparison
                    ? "Скрыть полное сравнение"
                    : "Показать полное сравнение"}
                </Button>
              </Box>
            </Box>
          ) : (
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <InfoIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Как выбрать редакцию?
                  </Typography>
                </Box>
                
                <Typography paragraph>
                  Используйте интерактивный калькулятор слева, чтобы получить рекомендацию 
                  по выбору оптимальной редакции Deckhouse Kubernetes Platform на основе ваших требований.
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Основные критерии выбора:
                  </Typography>
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
                    <li>Требования к сертификации ФСТЭК</li>
                    <li>Наличие в реестре российского ПО</li>
                    <li>Возможность работы в закрытом контуре</li>
                    <li>Необходимость интерфейса администратора</li>
                    <li>Расширенные функции безопасности</li>
                  </ul>
                </Alert>
                
                <Typography color="text.secondary" variant="body2">
                  После получения рекомендации вы увидите подробную информацию о выбранной редакции 
                  и сможете сравнить её с другими вариантами для принятия оптимального решения.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      
      {/* Секция полного сравнения (отображается, если включено) */}
      <Collapse in={showFullComparison}>
        <Box sx={{ mt: 4 }}>
          <ComparisonTable
            selectedEditions={selectedEdition ? [selectedEdition] : undefined}
          />
        </Box>
      </Collapse>
    </Box>
  );
}