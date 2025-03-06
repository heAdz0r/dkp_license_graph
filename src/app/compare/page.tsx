'use client';

import React, { useState, useMemo } from 'react';
import { 
  Typography, Box, Card, CardContent, CardHeader,
  Grid, Checkbox, FormControlLabel, Button, Chip,
  Paper, Divider, Link as MuiLink, Alert, Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Report as ReportIcon,
  Verified as VerifiedIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import Link from 'next/link';
import ComparisonTable from '@/components/ComparisonTable';
import { editions } from '@/data/licenseData';

export default function ComparePage() {
  // Состояние для выбранных редакций
  const [selectedEditions, setSelectedEditions] = useState(
    editions.map(e => e.id)
  );

  // Обработчик переключения редакций
  const handleEditionToggle = (editionId: string) => {
    setSelectedEditions(prev => {
      if (prev.includes(editionId)) {
        return prev.filter(id => id !== editionId);
      } else {
        return [...prev, editionId];
      }
    });
  };

  // Обработчик выбора всех редакций
  const handleSelectAll = () => {
    setSelectedEditions(editions.map(e => e.id));
  };

  // Обработчик сброса выбора редакций
  const handleClearAll = () => {
    setSelectedEditions([]);
  };

  // Фильтрованные редакции для отображения
  const editionsToShow = useMemo(() => {
    return selectedEditions.length > 0
      ? editions.filter(e => selectedEditions.includes(e.id))
      : undefined;
  }, [selectedEditions]);

  // Группировка редакций по типам
  const editionGroups = useMemo(() => {
    const groups = {
      certified: editions.filter(e => e.id.includes('cert')),
      commercial: editions.filter(e => !e.id.includes('cert') && e.id !== 'community'),
      community: editions.filter(e => e.id === 'community')
    };
    
    return groups;
  }, []);

  return (
    <Box sx={{ py: 3 }}>
      {/* Секция выбора редакций для сравнения */}
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title="Сравнение редакций Deckhouse Kubernetes Platform"
          subheader="Выберите редакции, которые хотите сравнить, и исследуйте их функциональные возможности"
          sx={{ bgcolor: 'primary.main', color: 'white' }}
          subheaderTypographyProps={{ color: 'primary.light' }}
        />
        
        <CardContent>
          {/* Управление выбором */}
          <Box 
            display="flex" 
            flexWrap="wrap" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={3}
          >
            <Typography variant="body2" color="text.secondary">
              Выбрано {selectedEditions.length} из {editions.length} редакций
            </Typography>
            
            <Stack direction="row" spacing={2}>
              <Button 
                onClick={handleSelectAll}
                variant="outlined"
                size="small"
              >
                Выбрать все
              </Button>
              
              <Button 
                onClick={handleClearAll}
                variant="outlined"
                size="small"
                color="inherit"
                disabled={selectedEditions.length === 0}
              >
                Очистить выбор
              </Button>
            </Stack>
          </Box>
          
          {/* Группы редакций для выбора */}
          <Stack spacing={3}>
            {/* Сертифицированные редакции */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Сертифицированные редакции
              </Typography>
              <Grid container spacing={2}>
                {editionGroups.certified.map(edition => (
                  <Grid item xs={12} sm={6} md={4} key={edition.id}>
                    <EditionCheckbox 
                      edition={edition}
                      isChecked={selectedEditions.includes(edition.id)}
                      onChange={() => handleEditionToggle(edition.id)}
                      highlight={true}
                      icon={<VerifiedIcon color="info" />}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            {/* Коммерческие редакции */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Коммерческие редакции
              </Typography>
              <Grid container spacing={2}>
                {editionGroups.commercial.map(edition => (
                  <Grid item xs={12} sm={6} md={4} key={edition.id}>
                    <EditionCheckbox 
                      edition={edition}
                      isChecked={selectedEditions.includes(edition.id)}
                      onChange={() => handleEditionToggle(edition.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            {/* Открытые редакции */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Открытые редакции
              </Typography>
              <Grid container spacing={2}>
                {editionGroups.community.map(edition => (
                  <Grid item xs={12} sm={6} md={4} key={edition.id}>
                    <EditionCheckbox 
                      edition={edition}
                      isChecked={selectedEditions.includes(edition.id)}
                      onChange={() => handleEditionToggle(edition.id)}
                      icon={<PublicIcon color="success" />}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Кнопка возврата */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button 
              component={Link}
              href="/"
              startIcon={<ArrowBackIcon />}
              variant="contained"
            >
              Вернуться к выбору редакции
            </Button>
            
            {/* Количество выбранных редакций */}
            {selectedEditions.length === 0 ? (
              <Alert 
                severity="warning"
                icon={<ReportIcon />}
                sx={{ py: 0 }}
              >
                Выберите хотя бы одну редакцию для сравнения
              </Alert>
            ) : (
              <Alert 
                severity="success" 
                icon={<CheckCircleIcon />}
                sx={{ py: 0 }}
              >
                Выбрано {selectedEditions.length} редакций для сравнения
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* Секция таблицы сравнения */}
      {selectedEditions.length > 0 ? (
        <ComparisonTable selectedEditions={editionsToShow} />
      ) : (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <ReportIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.primary">
            Не выбрано ни одной редакции
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 2 }}>
            Выберите хотя бы одну редакцию выше, чтобы увидеть таблицу сравнения функциональных возможностей
          </Typography>
          <Button 
            onClick={handleSelectAll}
            variant="contained"
          >
            Выбрать все редакции
          </Button>
        </Paper>
      )}
    </Box>
  );
}

// Компонент для выбора редакции с Material UI
interface EditionCheckboxProps {
  edition: { id: string; name: string; description: string };
  isChecked: boolean;
  onChange: () => void;
  highlight?: boolean;
  icon?: React.ReactNode;
}

const EditionCheckbox: React.FC<EditionCheckboxProps> = ({ 
  edition, 
  isChecked, 
  onChange,
  highlight = false,
  icon = null
}) => {
  return (
    <Paper 
      variant="outlined"
      sx={{ 
        p: 2, 
        border: isChecked ? 2 : 1,
        borderColor: isChecked ? 'primary.main' : 'divider',
        bgcolor: isChecked ? 'primary.50' : 'background.paper',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s'
      }}
    >
      <FormControlLabel
        control={
          <Checkbox 
            checked={isChecked} 
            onChange={onChange}
            color="primary"
          />
        }
        label={
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle2">{edition.name}</Typography>
              {icon}
            </Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {edition.description}
            </Typography>
            
            {/* Бейдж для специальных редакций */}
            {edition.id.includes('cert') && (
              <Chip 
                label="Сертифицировано ФСТЭК" 
                size="small" 
                color="info"
                variant="outlined"
                sx={{ mt: 1, height: 20 }}
              />
            )}
            {edition.id === 'community' && (
              <Chip 
                label="Открытый исходный код" 
                size="small" 
                color="success"
                variant="outlined"
                sx={{ mt: 1, height: 20 }}
              />
            )}
          </Box>
        }
        sx={{ 
          alignItems: 'flex-start',
          marginLeft: 0,
          marginRight: 0,
          width: '100%'
        }}
      />
      
      {/* Лейбл для выбранных редакций */}
      {isChecked && (
        <Chip 
          label="Выбрано" 
          size="small"
          color="primary"
          sx={{ 
            position: 'absolute',
            top: 4,
            right: 4,
            height: 20,
            '& .MuiChip-label': { px: 1 }
          }}
        />
      )}
    </Paper>
  );
};