import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="dark">
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <AdminSidebar />
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
              <SidebarTrigger className="mr-4" />
              <span className="font-display text-sm font-semibold text-muted-foreground">Back-office</span>
            </header>
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
