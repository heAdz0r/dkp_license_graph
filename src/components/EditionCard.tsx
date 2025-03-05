import React, { useMemo } from 'react';
import { Edition, Feature, FeatureStatus, features, CATEGORIES } from '@/data/licenseData';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme
} from '@mui/material';

interface EditionCardProps {
  edition: Edition;
  features: Feature[];
}

// Компонент для более наглядного отображения статуса функции
const EditionCard: React.FC<EditionCardProps> = ({ edition, features }) => {
  const theme = useTheme();
  
  const statusConfig = useMemo<Record<FeatureStatus, { color: string; label: string }>>(() => ({
    'present': {
      color: theme.palette.success.main,
      label: 'Доступно'
    },
    'absent': {
      color: theme.palette.error.main,
      label: 'Недоступно'
    },
    'planned': {
      color: theme.palette.warning.main,
      label: 'Планируется'
    },
    'conditionally-available': {
      color: theme.palette.info.main,
      label: 'Условно'
    }
  }), [theme]);

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

  const showSpecialBadge = (id: string) => {
    if (id.includes('cert')) {
      return <Chip size="small" color="primary" label="ФСТЭК" sx={{ mr: 1 }} />;
    }
    if (id === 'community') {
      return <Chip size="small" color="success" label="Open Source" sx={{ mr: 1 }} />;
    }
    return null;
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            {showSpecialBadge(edition.id)}
            <Typography variant="h6">{edition.name}</Typography>
          </Box>
        }
        subheader={edition.description}
        titleTypographyProps={{ component: 'div' }}
        action={
          <Box position="relative" display="inline-flex">
            <CircularProgress 
              variant="determinate" 
              value={featureStats.percentage} 
              size={40} 
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {featureStats.percentage}%
              </Typography>
            </Box>
          </Box>
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
      
      <CardContent sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <Box key={category} sx={{ mb: 1 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                px: 2, 
                py: 1,
                bgcolor: 'action.hover'
              }}
            >
              <Typography variant="subtitle2">{category}</Typography>
            </Box>
            
            <List dense disablePadding>
              {categoryFeatures.map(feature => {
                const status = edition.features[feature.id] || 'absent';
                const { label } = statusConfig[status];
                
                return (
                  <ListItem 
                    key={feature.id} 
                    divider
                    secondaryAction={
                      <Chip 
                        label={label} 
                        size="small" 
                        color={
                          status === 'present' ? 'success' : 
                          status === 'planned' ? 'warning' : 
                          status === 'conditionally-available' ? 'info' : 'error'
                        }
                        variant="outlined"
                      />
                    }
                  >
                    <ListItemText 
                      primary={feature.name}
                      secondary={feature.importance >= 8 ? 'Важно' : null}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ 
                        variant: 'caption',
                        color: 'error'
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ p: 2, justifyContent: 'center' }}>
        <Link
          href="https://deckhouse.ru/products/kubernetes-platform/pricing/"
          target="_blank"
          rel="noopener noreferrer"
          underline="none"
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            py: 1,
            px: 3,
            borderRadius: 1,
            display: 'inline-block',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            }
          }}
        >
          Подробнее о лицензировании
        </Link>
      </CardActions>
    </Card>
  );
};

export default EditionCard;