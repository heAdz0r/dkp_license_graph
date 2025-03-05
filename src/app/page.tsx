"use client";

import React, { useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import StepCalculator from "@/components/StepCalculator";
import EditionCard from "@/components/EditionCard";
import ComparisonTable from "@/components/ComparisonTable";
import { Edition, features } from "@/data/licenseData";
import { 
  Box, 
  Card, 
  CardContent,
  Container, 
  Grid, 
  Tab, 
  Tabs,
  Typography, 
  Button,
  Paper,
  Alert
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CalculateIcon from '@mui/icons-material/Calculate';

// Динамический импорт компонента визуализации графа для оптимизации производительности
const DecisionTree = dynamic(() => import("@/components/DecisionTree"), {
  ssr: false,
  loading: () => (
    <Paper sx={{ p: 4, textAlign: 'center', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography color="text.secondary">Загрузка визуализации графа решений...</Typography>
    </Paper>
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
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Информационный блок и переключатель режимов */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" component="h1" gutterBottom>
                Выбор редакции Deckhouse Kubernetes Platform
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Подберите оптимальную редакцию Deckhouse Kubernetes Platform на основе ваших требований.
              </Typography>

              <Tabs
                value={viewMode}
                onChange={(_, v) => setViewMode(v)}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
              >
                <Tab 
                  value="calculator" 
                  label="Калькулятор" 
                  icon={<CalculateIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  value="visualization" 
                  label="Визуализация" 
                  icon={<AccountTreeIcon />} 
                  iconPosition="start"
                />
              </Tabs>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Основная секция с инструментом выбора и результатом */}
        <Grid item xs={12} md={8}>
          {viewMode === 'calculator' ? (
            <StepCalculator onEditionSelect={handleEditionSelect} />
          ) : (
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Граф принятия решений</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Визуализация процесса выбора редакции на основе ваших требований.
                </Typography>
                <DecisionTree onEditionSelect={handleEditionSelect} />
              </CardContent>
            </Card>
          )}
        </Grid>
        
        {/* Правая колонка с карточкой редакции */}
        <Grid item xs={12} md={4}>
          {selectedEdition ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <EditionCard edition={selectedEdition} features={features} />
              
              <Button
                variant="contained"
                color="secondary"
                startIcon={<CompareArrowsIcon />}
                onClick={() => setShowFullComparison(!showFullComparison)}
                fullWidth
              >
                {showFullComparison ? "Скрыть сравнение" : "Показать сравнение"}
              </Button>
            </Box>
          ) : (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Выберите редакцию с помощью инструмента слева
              </Alert>
              <Typography variant="subtitle1" gutterBottom>
                Основные критерии выбора:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>Требования к сертификации ФСТЭК</li>
                <li>Наличие в реестре российского ПО</li>
                <li>Возможность работы в закрытом контуре</li>
                <li>Необходимость интерфейса администратора</li>
                <li>Расширенные функции безопасности</li>
              </Box>
            </Paper>
          )}
        </Grid>
        
        {/* Секция полного сравнения */}
        {showFullComparison && (
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Полное сравнение редакций
              </Typography>
              <ComparisonTable
                selectedEditions={selectedEdition ? [selectedEdition] : undefined}
              />
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}