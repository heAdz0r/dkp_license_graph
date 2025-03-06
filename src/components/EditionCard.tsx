import React, { useMemo } from 'react';
import { 
  Card, CardHeader, CardContent, CardActions, 
  Typography, Box, Button, List, ListItem, ListItemIcon, ListItemText,
  Divider, LinearProgress, Chip, Avatar
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { Edition, Feature, FeatureStatus, features, CATEGORIES } from '@/data/licenseData';

interface EditionCardProps {
  edition: Edition;
  features: Feature[];
}

const EditionCard: React.FC<EditionCardProps> = ({ edition, features }) => {
  const statusConfig = useMemo(() => ({
    'present': {
      label: 'Доступно',
      color: 'success',
      icon: <CheckIcon color="success" />
    },
    'absent': {
      label: 'Недоступно',
      color: 'error',
      icon: <CloseIcon color="error" />
    },
    'planned': {
      label: 'Планируется',
      color: 'warning',
      icon: <ScheduleIcon color="warning" />
    },
    'conditionally-available': {
      label: 'Условно',
      color: 'info',
      icon: <InfoIcon color="info" />
    }
  }), []);

  // Фильтруем и группируем функции по категориям для лучшей организации
  const groupedFeatures = useMemo(() => {
    const result: Record<string, Feature[]> = {};
    
    // Создаем только те группы, функции которых есть в редакции
    Object.values(CATEGORIES).forEach(category => {
      const categoryFeatures = features
        .filter(feature => 
          feature.category === category && 
          feature.importance >= 7 // Только важные функции
        )
        .sort((a, b) => b.importance - a.importance);
      
      if (categoryFeatures.length > 0) {
        result[category] = categoryFeatures;
      }
    });
    
    return result;
  }, [features]);

  // Подсчет количества доступных функций
  const featureStats = useMemo(() => {
    const total = features.length;
    const available = Object.entries(edition.features)
      .filter(([_, status]) => status === 'present')
      .length;
    
    return {
      total,
      available,
      percentage: Math.round((available / total) * 100)
    };
  }, [edition.features, features.length]);

  // Функция для получения цвета статуса
  const getStatusColor = (status: FeatureStatus) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'planned': return 'warning';
      case 'conditionally-available': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card elevation={2}>
      <CardHeader
        title={edition.name}
        subheader={edition.description}
        action={
          <Chip 
            label={`ID: ${edition.id}`} 
            size="small" 
            variant="outlined" 
          />
        }
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          '& .MuiCardHeader-subheader': { color: 'primary.light' },
          '& .MuiCardHeader-action .MuiChip-outlined': { 
            color: 'white', 
            borderColor: 'primary.light' 
          }
        }}
      />
      
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Доступность функций
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {featureStats.available} из {featureStats.total}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={featureStats.percentage} 
          sx={{ height: 8, borderRadius: 4 }} 
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
          {featureStats.percentage}%
        </Typography>
      </Box>
      
      <CardContent sx={{ pt: 1 }}>
        {Object.entries(groupedFeatures).map(([category, categoryFeatures], index) => (
          <React.Fragment key={category}>
            {index > 0 && <Divider sx={{ my: 2 }} />}
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {category}
            </Typography>
            
            <List disablePadding>
              {categoryFeatures.map(feature => {
                const status = edition.features[feature.id] || 'absent';
                const { icon, label } = statusConfig[status];
                const statusColor = getStatusColor(status);
                
                return (
                  <ListItem 
                    key={feature.id} 
                    disablePadding 
                    sx={{ py: 0.75 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight={feature.importance >= 8 ? 'medium' : 'regular'}>
                            {feature.name}
                          </Typography>
                          <Chip 
                            label={label} 
                            size="small" 
                            color={statusColor as any}
                            variant="outlined"
                            sx={{ 
                              height: 20, 
                              '& .MuiChip-label': { px: 1, fontSize: '0.625rem' } 
                            }} 
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {feature.description}
                        </Typography>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </React.Fragment>
        ))}
      </CardContent>
      
      <Divider />
      
      <CardActions>
        <Button 
          href="https://deckhouse.ru/products/kubernetes-platform/pricing/" 
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<LaunchIcon />}
          fullWidth
        >
          Подробнее о лицензировании
        </Button>
      </CardActions>
    </Card>
  );
};

export default EditionCard;