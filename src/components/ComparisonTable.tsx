import React, { useMemo, useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, Typography, Box, Card, CardContent, CardHeader,
  FormControl, InputLabel, Select, MenuItem, Slider, Tooltip,
  ToggleButtonGroup, ToggleButton, IconButton, Collapse,
  SelectChangeEvent
} from '@mui/material';
import { 
  Check as CheckIcon, 
  Close as CloseIcon, 
  Schedule as ScheduleIcon, 
  Info as InfoIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { Edition, Feature, editions, features, CATEGORIES } from '@/data/licenseData';

interface ComparisonTableProps {
  selectedEditions?: Edition[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ selectedEditions }) => {
  // Фильтр по категориям
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Фильтр по важности функций
  const [minImportance, setMinImportance] = useState<number>(0);
  
  // Состояние для отображения/скрытия фильтров
  const [showFilters, setShowFilters] = useState(false);
  
  // Эффективно вычисляем редакции для отображения
  const editionsToShow = useMemo(() => {
    return selectedEditions?.length ? selectedEditions : editions;
  }, [selectedEditions]);
  
  // Фильтруем функции по активной категории и важности
  const filteredFeatures = useMemo(() => {
    return features.filter(feature => 
      (activeCategory === null || feature.category === activeCategory) &&
      feature.importance >= minImportance
    ).sort((a, b) => {
      // Сначала сортируем по категории
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      // Затем по важности (более важные сверху)
      return b.importance - a.importance;
    });
  }, [activeCategory, minImportance]);
  
  // Рендер значка статуса функции
  const renderFeatureStatus = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <Tooltip title="Доступно">
            <CheckIcon color="success" fontSize="small" />
          </Tooltip>
        );
      case 'absent':
        return (
          <Tooltip title="Недоступно">
            <CloseIcon color="error" fontSize="small" />
          </Tooltip>
        );
      case 'planned':
        return (
          <Tooltip title="Планируется">
            <ScheduleIcon color="warning" fontSize="small" />
          </Tooltip>
        );
      case 'conditionally-available':
        return (
          <Tooltip title="Условно доступно">
            <InfoIcon color="info" fontSize="small" />
          </Tooltip>
        );
      default:
        return null;
    }
  };

  // Группировка функций по категориям для отображения
  const categoriesWithFeatures = useMemo(() => {
    const result: Record<string, Feature[]> = {};
    
    filteredFeatures.forEach(feature => {
      if (!result[feature.category]) {
        result[feature.category] = [];
      }
      result[feature.category].push(feature);
    });
    
    return result;
  }, [filteredFeatures]);

  // Обработчик изменения категории
  const handleCategoryChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setActiveCategory(value === 'all' ? null : value);
  };

  // Обработчик изменения важности
  const handleImportanceChange = (event: Event, newValue: number | number[]) => {
    setMinImportance(newValue as number);
  };

  return (
    <Card elevation={2}>
      <CardHeader 
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Сравнение редакций</Typography>
            <IconButton 
              size="small" 
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Показать/скрыть фильтры"
            >
              {showFilters ? <ExpandLessIcon /> : <FilterListIcon />}
            </IconButton>
          </Box>
        }
        sx={{ 
          pb: showFilters ? 0 : 2,
          '& .MuiCardHeader-content': { width: '100%' }
        }}
      />
      
      {/* Компактная панель фильтров */}
      <Collapse in={showFilters}>
        <CardContent sx={{ pt: 0 }}>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            {/* Фильтр по категории */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Категория</InputLabel>
              <Select
                value={activeCategory === null ? 'all' : activeCategory}
                onChange={handleCategoryChange}
                label="Категория"
              >
                <MenuItem value="all">Все категории</MenuItem>
                {Object.values(CATEGORIES).map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Фильтр по важности - более компактный */}
            <Box sx={{ width: 200 }}>
              <Typography variant="caption" color="textSecondary">
                Минимальная важность: {minImportance}
              </Typography>
              <Slider
                size="small"
                value={minImportance}
                onChange={handleImportanceChange}
                min={0}
                max={10}
                step={1}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: '0' },
                  { value: 10, label: '10' },
                ]}
              />
            </Box>
            
            {/* Легенда */}
            <Box display="flex" gap={2}>
              <Box display="flex" alignItems="center">
                <CheckIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Есть</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <CloseIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Нет</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <ScheduleIcon color="warning" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Планируется</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <InfoIcon color="info" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Условно</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Collapse>
      
      <TableContainer component={Paper} variant="outlined" sx={{ border: 0, maxHeight: "calc(100vh - 220px)" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                position: 'sticky', 
                left: 0, 
                backgroundColor: 'background.paper',
                minWidth: 200,
                zIndex: 3
              }}>
                <Typography variant="subtitle2">Функция</Typography>
              </TableCell>
              {editionsToShow.map(edition => (
                <TableCell key={edition.id} align="center" sx={{ minWidth: 120 }}>
                  <Typography variant="subtitle2">{edition.name}</Typography>
                  <Typography variant="caption" color="textSecondary" noWrap>
                    {edition.id}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {/* Если нет функций после фильтрации */}
            {filteredFeatures.length === 0 && (
              <TableRow>
                <TableCell colSpan={editionsToShow.length + 1} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    Нет функций, соответствующих выбранным фильтрам
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            
            {/* Отображаем функции, сгруппированные по категориям */}
            {Object.entries(categoriesWithFeatures).map(([category, categoryFeatures]) => (
              <React.Fragment key={category}>
                {/* Заголовок категории */}
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell 
                    colSpan={editionsToShow.length + 1} 
                    sx={{ 
                      position: 'sticky', 
                      left: 0,
                      backgroundColor: 'action.hover'
                    }}
                  >
                    <Typography fontWeight="medium" color="primary">
                      {category} ({categoryFeatures.length})
                    </Typography>
                  </TableCell>
                </TableRow>
                
                {/* Строки с функциями */}
                {categoryFeatures.map(feature => (
                  <TableRow key={feature.id} hover>
                    <TableCell 
                      sx={{ 
                        position: 'sticky', 
                        left: 0, 
                        backgroundColor: 'background.paper',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        zIndex: 1
                      }}
                    >
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        <Typography variant="body2">{feature.name}</Typography>
                        <Typography variant="caption" color="textSecondary" noWrap>
                          {feature.description}
                        </Typography>
                        {feature.importance >= 8 && (
                          <Chip 
                            label="Важно" 
                            color="error" 
                            size="small" 
                            sx={{ 
                              height: 20, 
                              '& .MuiChip-label': { px: 1, fontSize: '0.625rem' } 
                            }} 
                          />
                        )}
                      </Box>
                    </TableCell>
                    
                    {editionsToShow.map(edition => (
                      <TableCell key={`${edition.id}-${feature.id}`} align="center">
                        {renderFeatureStatus(edition.features[feature.id])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default ComparisonTable;