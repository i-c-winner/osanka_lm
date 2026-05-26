import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function MainPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
      }}
    >
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontStyle:  "italic",
          fontWeight: 400,
          fontSize:   "clamp(36px, 5vw, 68px)",
          color:      "text.primary",
          textAlign:  "center",
        }}
      >
        Osanka
      </Typography>
    </Box>
  );
}
