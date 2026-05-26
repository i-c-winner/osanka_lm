import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { AppHeader } from "@/widgets/AppHeader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppHeader />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}
