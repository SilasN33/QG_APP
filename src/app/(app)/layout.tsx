import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F6F5]">
      <AppHeader />
      <main className="pt-14 pb-20 max-w-md mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
