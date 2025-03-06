// app/ClientLayout.tsx (Client Component)

"use client"; // ОБЯЗАТЕЛЬНО: Указывает, что это Client Component

import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Stack,
  Link as MuiLink,
} from "@mui/material";
import theme from "../theme"; // Импортируем theme *здесь*, в Client Component
import Link from "next/link"; // Импортируем Link из next/link

// Этот компонент - Client Component
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <ThemeProvider theme={theme}>
      {" "}
      {/* ThemeProvider должен быть в Client Component */}
      <CssBaseline /> {/* CssBaseline тоже должен быть в Client Component */}
      {/* Компактный sticky header (AppBar и Toolbar из MUI) */}
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar variant="dense">
          <Typography
            variant="h6"
            component="h1"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
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
      {/* Основной контент (ваши страницы будут здесь) */}
      <Container maxWidth="lg" component="main" sx={{ py: 4, flexGrow: 1 }}>
        {children} {/* Здесь рендерятся дочерние компоненты (страницы) */}
      </Container>
      {/* Компактный footer (Box и MUI компоненты) */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: (theme) => theme.palette.grey[900],
          color: "white",
          typography: "body2",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ color: "grey.500" }}
            >
              © {currentYear} Интерактивный инструмент для выбора лицензии DKP
            </Typography>
            <Box sx={{ mt: { xs: 2, sm: 0 } }}>
              <MuiLink
                href="https://github.com/heAdz0r/dkp_license_graph"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "grey.500", "&:hover": { color: "grey.300" } }}
              >
                GitHub
              </MuiLink>
              <MuiLink
                href="https://deckhouse.ru/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  ml: 2,
                  color: "grey.500",
                  "&:hover": { color: "grey.300" },
                }}
              >
                Deckhouse
              </MuiLink>
            </Box>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
