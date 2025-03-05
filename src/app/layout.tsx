import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { AppBar, Toolbar, Typography, Container, Box, Link as MuiLink } from '@mui/material'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Выбор редакции Deckhouse Kubernetes Platform',
  description: 'Интерактивный инструмент для выбора оптимальной редакции DKP на основе ваших требований',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentYear = new Date().getFullYear();
  
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        {/* Компактная верхняя панель навигации */}
        <AppBar position="sticky" color="default" elevation={1} sx={{ backgroundColor: 'white' }}>
          <Toolbar variant="dense">
            <Typography variant="h6" color="primary" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              DKP License
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <MuiLink component={Link} href="/" color="inherit" underline="none">
                Главная
              </MuiLink>
              <MuiLink component={Link} href="/compare" color="inherit" underline="none">
                Сравнение
              </MuiLink>
              <MuiLink 
                href="https://deckhouse.ru/products/kubernetes-platform/pricing/" 
                target="_blank" 
                rel="noopener noreferrer"
                color="inherit"
                underline="none"
              >
                Официальный сайт
              </MuiLink>
            </Box>
          </Toolbar>
        </AppBar>
        
        {/* Основной контент страницы */}
        <Container maxWidth="lg" sx={{ py: 4, flex: '1 0 auto' }}>
          {children}
        </Container>
        
        {/* Упрощенный подвал сайта */}
        <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              © {currentYear} DKP License Decision Graph
            </Typography>
          </Container>
        </Box>
      </body>
    </html>
  )
}
