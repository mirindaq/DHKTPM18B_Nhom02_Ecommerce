import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useUser } from "@/context/UserContext";
import { AUTH_PATH } from "@/constants/path";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Truck, Settings, LogOut, Store } from "lucide-react";
import { STAFF_PATH } from "@/constants/path";

export default function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isLeader } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(AUTH_PATH.LOGIN_STAFF);
    } catch (error) {
      console.error("Logout error:", error);
      navigate(AUTH_PATH.LOGIN_STAFF);
    }
  };

  const isActiveRoute = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  // Navigation items based on role
  const navigationItems = [
    {
      title: "Đơn hàng",
      icon: ShoppingCart,
      href: STAFF_PATH.ORDERS,
    },
    // Only show "Gán shipper" if user is a leader
    ...(isLeader
      ? [
          {
            title: "Gán shipper",
            icon: Truck,
            href: STAFF_PATH.ASSIGN_DELIVERY,
          },
        ]
      : []),
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden">
        <Sidebar className="border-r w-64 min-w-64 max-w-64 shrink-0 bg-gray-900">
          <SidebarHeader>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-gray-900"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-700 text-white">
                <Store className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white">
                  EcommerceWWW
                </span>
                <span className="truncate text-xs text-gray-300">
                  Staff Panel
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarHeader>

          <SidebarContent className="overflow-y-auto overflow-x-hidden bg-gray-900">
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-300 text-xs font-semibold uppercase tracking-wider">
                CHỨC NĂNG
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = isActiveRoute(item.href);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          isActive={isActive}
                          className={`h-12 px-4 py-3 text-white hover:bg-gray-800 ${
                            isActive ? "bg-gray-600" : ""
                          }`}
                        >
                          <Link to={item.href}>
                            <item.icon className="shrink-0 h-5 w-5" />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="mt-auto bg-gray-900">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Cài đặt"
                  isActive={location.pathname === "/staff/settings"}
                  className={`h-12 px-4 py-3 text-white hover:bg-gray-800 ${
                    location.pathname === "/staff/settings" ? "bg-gray-600" : ""
                  }`}
                >
                  <Link to="/staff/settings">
                    <Settings className="shrink-0 h-5 w-5" />
                    <span className="truncate">Cài đặt</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Đăng xuất">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-12 px-4 py-3 text-white hover:bg-gray-800"
                    onClick={handleLogout}
                  >
                    <LogOut className="shrink-0 h-5 w-5" />
                    <span className="truncate">Đăng xuất</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 w-full overflow-hidden">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <div className="flex-1"></div>
            </div>
          </header>

          <main className="w-full p-6 overflow-y-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
