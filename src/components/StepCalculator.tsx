import React, { useState } from 'react';
import { 
  Card, CardHeader, CardContent, CardActions,
  Typography, Box, Button, LinearProgress,
  Alert, Divider, Stepper, Step, StepLabel,
  Stack
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { DecisionNode, decisionTree, Edition, editions } from '@/data/licenseData';

interface StepCalculatorProps {
  onEditionSelect: (edition: Edition | null) => void;
}

const StepCalculator: React.FC<StepCalculatorProps> = ({ onEditionSelect }) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [history, setHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  // Current node в дереве решений
  const currentNode = decisionTree[currentNodeId];

  // Определяем, является ли текущий узел конечным (с результатом)
  const isEndNode = !!currentNode.result;
  
  // Обработчик ответов пользователя
  const handleAnswer = (answer: boolean) => {
    // Сохраняем ответ
    setAnswers(prev => ({ ...prev, [currentNodeId]: answer }));
    
    // Добавляем текущий узел в историю
    setHistory(prev => [...prev, currentNodeId]);
    
    // Определяем следующий узел на основе ответа
    const nextNodeId = answer 
      ? currentNode.yes 
      : currentNode.no;
    
    if (nextNodeId) {
      setCurrentNodeId(nextNodeId);
      
      // Если достигли узла с результатом, возвращаем выбранную редакцию
      const nextNode = decisionTree[nextNodeId];
      if (nextNode.result) {
        const edition = editions.find(e => e.id === nextNode.result) || null;
        onEditionSelect(edition);
      }
    }
  };

  // Функция для возврата на шаг назад
  const handleBack = () => {
    if (history.length > 0) {
      // Получаем предыдущий узел
      const prevNodeId = history[history.length - 1];
      
      // Удаляем последний узел из истории
      setHistory(prev => prev.slice(0, -1));
      
      // Устанавливаем предыдущий узел как текущий
      setCurrentNodeId(prevNodeId);
      
      // Очищаем выбор редакции если мы не на финальном узле
      if (!decisionTree[prevNodeId].result) {
        onEditionSelect(null);
      }
    } else {
      // Если истории нет, возвращаемся к корневому узлу
      handleReset();
    }
  };

  // Сброс калькулятора
  const handleReset = () => {
    setCurrentNodeId('root');
    setHistory([]);
    setAnswers({});
    onEditionSelect(null);
  };

  // Функция для получения прогресса (в процентах)
  const getProgress = () => {
    // Оценка максимальной глубины дерева (примерно)
    const maxDepth = 6;
    
    // Оценка текущей глубины на основе истории
    const currentDepth = history.length;
    
    // Если достигли конечного узла, возвращаем 100%
    if (isEndNode) return 100;
    
    // Иначе рассчитываем примерный процент прогресса
    return Math.min(Math.round((currentDepth / maxDepth) * 100), 95);
  };

  return (
    <Card elevation={2}>
      <CardHeader
        title="Калькулятор редакции Deckhouse"
        subheader={isEndNode 
          ? "Мы подобрали подходящую редакцию для ваших требований" 
          : "Ответьте на вопросы для подбора оптимальной редакции"
        }
        sx={{ bgcolor: 'primary.main', color: 'white', pb: 1 }}
        subheaderTypographyProps={{ color: 'primary.light' }}
      />
      
      {/* Индикатор прогресса */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <LinearProgress 
          variant="determinate" 
          value={getProgress()} 
          sx={{ height: 8, borderRadius: 4 }} 
        />
        <Box display="flex" justifyContent="space-between" mt={0.5}>
          <Typography variant="caption" color="text.secondary">Начало</Typography>
          <Typography variant="caption" color="text.secondary">Прогресс: {getProgress()}%</Typography>
          <Typography variant="caption" color="text.secondary">Результат</Typography>
        </Box>
      </Box>
      
      <CardContent>
        {/* Шаги процесса */}
        <Stepper activeStep={history.length} alternativeLabel sx={{ mb: 3, display: { xs: 'none', sm: 'flex' } }}>
          <Step key="start" completed={history.length > 0}>
            <StepLabel>Начало</StepLabel>
          </Step>
          {history.map((nodeId, index) => (
            <Step key={nodeId} completed={index < history.length - 1}>
              <StepLabel>{decisionTree[nodeId].question.slice(0, 30)}...</StepLabel>
            </Step>
          ))}
          <Step key="result" completed={isEndNode}>
            <StepLabel>Результат</StepLabel>
          </Step>
        </Stepper>
        
        {/* Вопрос */}
        <Typography variant="h6" gutterBottom>
          {currentNode.question}
        </Typography>
        
        {currentNode.featureId && (
          <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
            Данный пункт влияет на выбор редакции и доступность ключевых функций платформы.
          </Alert>
        )}
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          disabled={history.length === 0}
          variant="outlined"
          size="small"
        >
          Назад
        </Button>
        
        {!isEndNode ? (
          <Stack direction="row" spacing={2}>
            {currentNode.no && (
              <Button
                startIcon={<CloseIcon />}
                onClick={() => handleAnswer(false)}
                variant="contained"
                color="error"
              >
                Нет
              </Button>
            )}
            
            {currentNode.yes && (
              <Button
                startIcon={<CheckIcon />}
                onClick={() => handleAnswer(true)}
                variant="contained"
                color="success"
              >
                Да
              </Button>
            )}
          </Stack>
        ) : (
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            variant="contained"
          >
            Начать заново
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default StepCalculator;