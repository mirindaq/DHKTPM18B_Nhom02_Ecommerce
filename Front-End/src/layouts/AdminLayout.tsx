
import { Link, Outlet, useLocation } from "react-router"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Store,
  Award,
  Tag
} from "lucide-react"

const navigation = [
  {
    title: "Tổng quan",
    icon: Home,
    href: "/admin",
  },
  {
    title: "Sản phẩm",
    icon: Package,
    href: "/admin/products",
  },
  {
    title: "Biến thể",
    href: "/admin/variants",
    icon: Tag,
  },
  {
    title: "Danh mục",
    icon: Store,
    href: "/admin/categories",
  },
  {
    title: "Thương hiệu",
    icon: Award,
    href: "/admin/brands",
  },
  {
    title: "Đơn hàng",
    icon: ShoppingCart,
    href: "/admin/orders",
  },
  {
    title: "Khách hàng",
    icon: Users,
    href: "/admin/customers",
  },
  {
    title: "Thống kê",
    icon: BarChart3,
    href: "/admin/analytics",
  },
]

export default function AdminLayout() {
  const location = useLocation()

  const handleLogout = () => {
    // Xử lý đăng xuất ở đây
    console.log("Đăng xuất")
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Store className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">EcommerceWWW</span>
                <span className="truncate text-xs">Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href || 
                      (item.href !== "/admin" && location.pathname.startsWith(item.href))
                    
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          isActive={isActive}
                          className={`h-12 px-4 py-3 ${isActive ? "bg-black text-white" : "hover:bg-gray-100 hover:text-gray-900"}`}
                        >
                          <Link to={item.href}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  tooltip="Cài đặt"
                  isActive={location.pathname === "/admin/settings"}
                  className={`h-12 px-4 py-3 ${location.pathname === "/admin/settings" ? "bg-black text-white" : "hover:bg-gray-100 hover:text-gray-900"}`}
                >
                  <Link to="/admin/settings">
                    <Settings />
                    <span>Cài đặt</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Đăng xuất">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-12 px-4 py-3"
                    onClick={handleLogout}
                  >
                    <LogOut />
                    <span>Đăng xuất</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 w-full">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex-1">
                <h1 className="text-lg font-semibold">
                  {navigation.find(item => {
                    if (item.href === "/admin") return location.pathname === "/admin"
                    return location.pathname.startsWith(item.href)
                  })?.title || "Dashboard"}
                </h1>
              </div>
            </div>
          </header>

          <main className="w-full p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
