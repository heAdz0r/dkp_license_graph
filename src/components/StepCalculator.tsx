import React, { useState } from 'react';
import { DecisionNode, decisionTree, Edition, editions } from '@/data/licenseData';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  LinearProgress,
  Stack,
  Typography,
  Alert,
  IconButton,
  useTheme
} from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface StepCalculatorProps {
  onEditionSelect: (edition: Edition | null) => void;
}

const StepCalculator: React.FC<StepCalculatorProps> = ({ onEditionSelect }) => {
  const theme = useTheme();
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
    <Card variant="outlined">
      <CardHeader
        title={isEndNode ? "Рекомендуемая редакция" : "Калькулятор выбора редакции"}
        subheader={isEndNode 
          ? "Мы подобрали подходящую редакцию для ваших требований" 
          : "Ответьте на вопросы для подбора оптимальной редакции"
        }
        sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: theme.palette.primary.contrastText,
          '& .MuiCardHeader-subheader': { 
            color: theme.palette.primary.contrastText, 
            opacity: 0.8 
          }
        }}
      />
      
      {/* Индикатор прогресса */}
      <Box sx={{ px: 2, pt: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={getProgress()} 
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">Начало</Typography>
          <Typography variant="caption" color="text.secondary">
            Прогресс: {getProgress()}%
          </Typography>
          <Typography variant="caption" color="text.secondary">Результат</Typography>
        </Box>
      </Box>
      
      <CardContent>
        {/* Вопрос */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {currentNode.question}
          </Typography>
          
          {currentNode.featureId && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Данный пункт влияет на выбор редакции и доступность ключевых функций платформы.
            </Alert>
          )}
        </Box>
        
        {/* Кнопки ответов */}
        {!isEndNode ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {currentNode.yes && (
              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                startIcon={<ThumbUpAltIcon />}
                onClick={() => handleAnswer(true)}
              >
                Да
              </Button>
            )}
            
            {currentNode.no && (
              <Button
                variant="contained"
                color="error"
                size="large"
                fullWidth
                startIcon={<ThumbDownAltIcon />}
                onClick={() => handleAnswer(false)}
              >
                Нет
              </Button>
            )}
          </Stack>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
          >
            Начать заново
          </Button>
        )}
      </CardContent>
      
      <Divider />
      
      {/* Навигация и история */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.default', display: 'flex', justifyContent: 'space-between' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          disabled={history.length === 0}
          onClick={handleBack}
          size="small"
        >
          Назад
        </Button>
        
        <Button
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          size="small"
        >
          Начать заново
        </Button>
      </Box>
    </Card>
  );
};

export default StepCalculator;