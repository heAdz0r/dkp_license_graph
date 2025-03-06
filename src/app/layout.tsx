'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Container, Box, Button, Stack, Link as MuiLink } from '@mui/material';
import theme from '../theme';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata = {
  title: 'Выбор редакции Deckhouse Kubernetes Platform',
  description: 'Интерактивный инструмент для выбора оптимальной редакции DKP на основе ваших требований',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentYear = new Date().getFullYear();
  
  return (
    <html lang="ru">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* Компактный sticky header */}
          <AppBar 
            position="sticky" 
            color="default" 
            elevation={0}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Toolbar variant="dense">
              <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
                Лицензия Deckhouse K8s Platform
              </Typography>
              
              <Stack direction="row" spacing={1}>
                <Button component={Link} href="/" color="inherit">
                  Главная
                </Button>
                <Button component={Link} href="/compare" color="inherit">
                  Сравнение
                </Button>
                <Button 
                  href="https://deckhouse.ru/products/kubernetes-platform/pricing/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  color="inherit"
                  size="small"
                >
                  Сайт
                </Button>
              </Stack>
            </Toolbar>
          </AppBar>
          
          {/* Основной контент */}
          <Container maxWidth="lg" component="main" sx={{ py: 4, flexGrow: 1 }}>
            {children}
          </Container>
          
          {/* Компактный footer */}
          <Box 
            component="footer" 
            sx={{ 
              py: 3, 
              px: 2, 
              mt: 'auto', 
              backgroundColor: (theme) => theme.palette.grey[900],
              color: 'white',
              typography: 'body2',
            }}
          >
            <Container maxWidth="lg">
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ color: 'grey.500' }}>
                  © {currentYear} Интерактивный инструмент для выбора лицензии DKP
                </Typography>
                <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                  <MuiLink 
                    href="https://github.com/heAdz0r/dkp_license_graph"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'grey.500', '&:hover': { color: 'grey.300' } }}
                  >
                    GitHub
                  </MuiLink>
                  <MuiLink 
                    href="https://deckhouse.ru/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ ml: 2, color: 'grey.500', '&:hover': { color: 'grey.300' } }}
                  >
                    Deckhouse
                  </MuiLink>
                </Box>
              </Stack>
            </Container>
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}