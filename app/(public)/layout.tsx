import SplashScreen from "@/app/(public)/components/splash-screen";
import { Footer } from "@/components/layout/footer";
import Navbar from "@/components/navbar";


export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SplashScreen />
      <div
        id="public-layout"
        className="relative min-h-screen flex flex-col bg-background loading-state"
      >
        <Navbar />
        <main className="flex-1 transition-all duration-300">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
