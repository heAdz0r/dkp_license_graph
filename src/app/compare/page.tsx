'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import ComparisonTable from '@/components/ComparisonTable';
import { editions } from '@/data/licenseData';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Stack,
  Typography,
  Alert
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import ClearAllIcon from '@mui/icons-material/ClearAll';

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
    <Box>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardHeader
          title="Сравнение редакций Deckhouse Kubernetes Platform"
          subheader="Выберите редакции для детального сравнения функциональных возможностей"
        />
        
        <CardContent>
          {/* Контроль выбора */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Выбрано {selectedEditions.length} из {editions.length} редакций
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Button 
                startIcon={<SelectAllIcon />}
                size="small"
                onClick={handleSelectAll}
                variant="outlined"
              >
                Все
              </Button>
              <Button 
                startIcon={<ClearAllIcon />}
                size="small"
                onClick={handleClearAll}
                variant="outlined"
                disabled={selectedEditions.length === 0}
              >
                Очистить
              </Button>
            </Stack>
          </Box>
          
          {/* Группировка по типам редакций */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Сертифицированные редакции
            </Typography>
            <Grid container spacing={1}>
              {editionGroups.certified.map(edition => (
                <Grid item xs={12} sm={6} md={4} key={edition.id}>
                  <EditionCheckbox 
                    edition={edition}
                    isChecked={selectedEditions.includes(edition.id)}
                    onChange={() => handleEditionToggle(edition.id)}
                    highlight={true}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Коммерческие редакции
            </Typography>
            <Grid container spacing={1}>
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
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Открытые редакции
            </Typography>
            <Grid container spacing={1}>
              {editionGroups.community.map(edition => (
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
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              component={Link}
              href="/"
              startIcon={<KeyboardBackspaceIcon />}
              variant="contained"
            >
              Вернуться к выбору
            </Button>
            
            {selectedEditions.length === 0 ? (
              <Alert severity="warning" sx={{ flexGrow: 1, ml: 2 }}>
                Выберите хотя бы одну редакцию для сравнения
              </Alert>
            ) : (
              <Alert severity="success" sx={{ flexGrow: 1, ml: 2 }}>
                Выбрано {selectedEditions.length} редакций для сравнения
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {selectedEditions.length > 0 ? (
        <ComparisonTable selectedEditions={editionsToShow} />
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CompareArrowsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Не выбрано ни одной редакции
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            Выберите хотя бы одну редакцию выше, чтобы увидеть таблицу сравнения функциональных возможностей
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleSelectAll}
          >
            Выбрать все редакции
          </Button>
        </Paper>
      )}
    </Box>
  );
}

// Компонент для выбора редакции
interface EditionCheckboxProps {
  edition: { id: string; name: string; description: string };
  isChecked: boolean;
  onChange: () => void;
  highlight?: boolean;
}

const EditionCheckbox: React.FC<EditionCheckboxProps> = ({ 
  edition, 
  isChecked, 
  onChange,
  highlight = false
}) => {
  return (
    <Paper
      variant="outlined"
      sx={{ 
        p: 1.5, 
        border: isChecked ? 2 : 1,
        borderColor: isChecked ? 'primary.main' : 'divider',
        bgcolor: isChecked ? 'primary.50' : 'background.paper',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <FormGroup>
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
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {edition.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                {edition.description.length > 60 
                  ? `${edition.description.substring(0, 60)}...` 
                  : edition.description}
              </Typography>
              
              {edition.id.includes('cert') && (
                <Chip 
                  label="ФСТЭК" 
                  size="small" 
                  color="primary" 
                  sx={{ mt: 0.5 }} 
                />
              )}
              {edition.id === 'community' && (
                <Chip 
                  label="Open Source" 
                  size="small" 
                  color="success" 
                  sx={{ mt: 0.5 }} 
                />
              )}
            </Box>
          }
        />
      </FormGroup>
      
      {isChecked && (
        <Chip 
          label="Выбрано" 
          size="small" 
          color="primary"
          sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0,
            borderRadius: '0 0 0 8px',
            fontWeight: 'bold'
          }} 
        />
      )}
    </Paper>
  );
};