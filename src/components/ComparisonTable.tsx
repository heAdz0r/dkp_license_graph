import React, { useMemo, useState } from 'react';
import { Edition, Feature, editions, features, CATEGORIES } from '@/data/licenseData';
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ComparisonTableProps {
  selectedEditions?: Edition[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ selectedEditions }) => {
  const theme = useTheme();
  
  // Фильтр по категориям
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Фильтр по важности функций
  const [minImportance, setMinImportance] = useState<number>(0);
  
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
  
  // Рендер иконки для статуса функции
  const renderFeatureStatus = (edition: Edition, featureId: string) => {
    const status = edition.features[featureId];
    
    switch (status) {
      case 'present':
        return <CheckIcon fontSize="small" color="success" />;
      case 'absent':
        return <CloseIcon fontSize="small" color="error" />;
      case 'planned':
        return <AccessTimeIcon fontSize="small" color="warning" />;
      case 'conditionally-available':
        return <InfoIcon fontSize="small" color="info" />;
      default:
        return <CloseIcon fontSize="small" color="disabled" />;
    }
  };

  // Группировка функций по категориям
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

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setActiveCategory(null);
    setMinImportance(0);
  };

  return (
    <Card elevation={2}>
      <CardContent sx={{ p: 2 }}>
        {/* Компактные фильтры */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center">
              <FilterListIcon sx={{ mr: 1 }} />
              <FormControl size="small" fullWidth>
                <Select
                  value={activeCategory || ''}
                  onChange={(e) => setActiveCategory(e.target.value || null)}
                  displayEmpty
                >
                  <MenuItem value="">Все категории</MenuItem>
                  {Object.values(CATEGORIES).map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2">Важность:</Typography>
              <Slider
                size="small"
                value={minImportance}
                onChange={(_, value) => setMinImportance(value as number)}
                min={0}
                max={10}
                valueLabelDisplay="auto"
                sx={{ flex: 1 }}
              />
              <IconButton size="small" onClick={handleResetFilters}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
        
        {/* Легенда */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<CheckIcon fontSize="small" />} 
            label="Есть" 
            size="small" 
            color="success" 
            variant="outlined" 
          />
          <Chip 
            icon={<CloseIcon fontSize="small" />} 
            label="Нет" 
            size="small" 
            color="error" 
            variant="outlined" 
          />
          <Chip 
            icon={<AccessTimeIcon fontSize="small" />} 
            label="Планируется" 
            size="small" 
            color="warning" 
            variant="outlined" 
          />
          <Chip 
            icon={<InfoIcon fontSize="small" />} 
            label="Условно" 
            size="small" 
            color="info" 
            variant="outlined" 
          />
        </Box>
        
        {/* Таблица сравнения */}
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Функция</TableCell>
                {editionsToShow.map(edition => (
                  <TableCell key={edition.id} align="center" sx={{ minWidth: 120 }}>
                    <Typography variant="subtitle2">{edition.name}</Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {edition.description.length > 25 
                        ? `${edition.description.substring(0, 25)}...` 
                        : edition.description}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFeatures.length === 0 && (
                <TableRow>
                  <TableCell colSpan={editionsToShow.length + 1} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Нет функций, соответствующих выбранным фильтрам
                    </Typography>
                    <Box mt={1}>
                      <Chip 
                        label="Сбросить фильтры" 
                        onClick={handleResetFilters} 
                        color="primary" 
                        size="small"
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              
              {Object.entries(categoriesWithFeatures).map(([category, categoryFeatures]) => (
                <React.Fragment key={category}>
                  <TableRow>
                    <TableCell 
                      colSpan={editionsToShow.length + 1} 
                      sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}
                    >
                      <Typography variant="subtitle2">{category}</Typography>
                    </TableCell>
                  </TableRow>
                  
                  {categoryFeatures.map(feature => (
                    <TableRow key={feature.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {feature.name}
                          {feature.importance >= 8 && (
                            <Chip 
                              label="Важно" 
                              size="small" 
                              color="error" 
                              sx={{ ml: 1, height: 20 }} 
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </TableCell>
                      
                      {editionsToShow.map(edition => (
                        <TableCell key={`${edition.id}-${feature.id}`} align="center">
                          {renderFeatureStatus(edition, feature.id)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ComparisonTable;