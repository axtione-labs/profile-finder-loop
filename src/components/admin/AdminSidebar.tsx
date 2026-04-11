import {
  LayoutDashboard,
  FileText,
  Users,
  Handshake,
  Coins,
  ArrowLeft,
  Building2,
  UserCheck,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

const navItems = [
  { title: "Vue d'ensemble", url: "/admin", icon: LayoutDashboard },
  { title: "Besoins / Leads", url: "/admin/leads", icon: FileText },
  { title: "Sourcing", url: "/admin/sourcing", icon: Users },
  { title: "Missions", url: "/admin/missions", icon: Handshake },
  { title: "Commissions", url: "/admin/commissions", icon: Coins },
  { title: "Clients", url: "/admin/clients", icon: Building2 },
  { title: "Apporteurs", url: "/admin/apporteurs", icon: UserCheck },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2 px-4 py-4">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <img src="/lynx-logo.png" alt="Lynx" className="h-7 w-7" />
              <span className="font-display text-lg font-bold text-gradient-gold">Lynx</span>
            </Link>
          )}
          {collapsed && (
            <Link to="/">
              <img src="/lynx-logo.png" alt="Lynx" className="h-7 w-7" />
            </Link>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Retour apporteur</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
