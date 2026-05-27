import { AppHeader }             from "@/widgets/AppHeader";
import { AppFooter }             from "@/widgets/AppFooter";
import { HelloSection }          from "@/entities/hello";
import { PracticeSection }       from "@/entities/practice";
import { PricingCta, PricingPlans } from "@/entities/pricing";

export default function MainPage() {
  return (
    <>
      <AppHeader />
      <main>
        <HelloSection />
        <PracticeSection />
        <PricingCta />
        <PricingPlans />
      </main>
      <AppFooter />
    </>
  );
}
