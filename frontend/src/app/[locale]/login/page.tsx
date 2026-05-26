import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 420 }} elevation={3}>
        <LoginForm />
      </Paper>
    </Box>
  );
}
