import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ApporteurSidebar } from "@/components/apporteur/ApporteurSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface ApporteurLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const ApporteurLayout = ({ children, title = "Espace apporteur" }: ApporteurLayoutProps) => {
  const { profile } = useAuth();
  const initials = profile
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase()
    : "?";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <ApporteurSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="mr-2" />
              <span className="font-display text-sm font-semibold text-muted-foreground">{title}</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
              {initials}
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ApporteurLayout;
