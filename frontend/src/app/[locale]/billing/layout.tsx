import { AppHeader } from "@/widgets/AppHeader";
import { AppFooter } from "@/widgets/AppFooter";

export default function MainGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppHeader />
      <main style={{ flex: 1 }}>{children}</main>
      <AppFooter />
    </div>
  );
}
