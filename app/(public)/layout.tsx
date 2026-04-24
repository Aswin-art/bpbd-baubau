import SplashScreen from "@/app/(public)/components/splash-screen";
import { Footer } from "@/components/layout/footer";
import Navbar from "@/components/navbar";
import { CtaSection } from "./components/cta-section";
import { getPublicSiteSettings } from "@/lib/get-public-site-settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = await getPublicSiteSettings();
  return (
    <div>
      <SplashScreen />
      <div
        id="public-layout"
        className="relative min-h-screen flex flex-col bg-background loading-state"
      >
        <Navbar
          mapEmbedUrl={settings.mapEmbedUrl}
          contactPhone={settings.contactPhone}
          contactEmail={settings.contactEmail}
          officeAddress={settings.officeAddress}
        />
        <main className="flex-1 transition-all duration-300">{children}</main>
        <CtaSection contactPhone={settings.contactPhone} />
        <Footer settings={settings} />
      </div>
    </div>
  );
}
