import { AppHeader } from "@/widgets/AppHeader";
import { AppFooter } from "@/widgets/AppFooter";
import { HelloSection } from "@/entities/hello";

export default function MainPage() {
  return (
    <>
      <AppHeader />
      <main>
        <HelloSection />
      </main>
      <AppFooter />
    </>
  );
}
