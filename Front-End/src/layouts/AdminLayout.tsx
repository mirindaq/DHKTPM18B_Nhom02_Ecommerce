import { Link, Outlet, useLocation } from "react-router";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { AUTH_PATH } from "@/constants/path";
import AuthStorageUtil from "@/utils/authStorage.util";
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
  Tag,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Newspaper,
  LayoutList,
  GitMerge,
  Filter,
  MessageSquare,
  Star,
} from "lucide-react";
import AdminChatListener from "@/components/admin/AdminChatListener";

const navigation = [
  {
    title: "Tổng quan",
    icon: Home,
    href: "/admin",
  },
  {
    title: "Quản lý sản phẩm",
    icon: Package,
    isSubmenu: true,
    items: [
      {
        title: "Sản phẩm",
        href: "/admin/products",
        icon: Package,
      },
      {
        title: "Biến thể",
        href: "/admin/variants",
        icon: Tag,
      },
      {
        title: "Danh mục",
        href: "/admin/categories",
        icon: Store,
      },
      {
        title: "Thương hiệu",
        href: "/admin/brands",
        icon: Award,
      },
      {
        title: "Liên kết danh mục",
        href: "/admin/category-assignment",
        icon: GitMerge,
      },
      {
        title: "Tiêu chí lọc",
        href: "/admin/filter-criterias",
        icon: Filter,
      },
    ],
  },
  {
    title: "Quản lý đơn hàng",
    icon: ShoppingCart,
    isSubmenu: true,
    items: [
      {
        title: "Đơn hàng",
        href: "/admin/orders",
        icon: ShoppingCart,
      },
      {
        title: "Giỏ hàng khách",
        href: "/admin/carts",
        icon: ShoppingCart,
      },
    ],
  },
  {
    title: "Quản lý khuyến mãi",
    icon: ShoppingCart,
    isSubmenu: true,
    items: [
      {
        title: "Khuyến mãi",
        href: "/admin/promotions",
        icon: Tag,
      },
      {
        title: "Voucher",
        href: "/admin/vouchers",
        icon: ShoppingCart,
      },
      {
        title: "Banner",
        href: "/admin/banners",
        icon: Award,
      },
    ],
  },
  {
    title: "Quản lý người dùng",
    icon: Users,
    isSubmenu: true,
    items: [
      {
        title: "Khách hàng",
        href: "/admin/customers",
        icon: Users,
      },
      {
        title: "Nhân viên",
        href: "/admin/staffs",
        icon: UserCheck,
      },
      {
        title: "Quản lý Chat",
        href: "/admin/chats",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Quản lý tin tức",
    icon: Newspaper,
    isSubmenu: true,
    items: [
      {
        title: "Tin tức",
        href: "/admin/articles",
        icon: Newspaper,
      },
      {
        title: "Danh mục",
        href: "/admin/article-categories",
        icon: LayoutList,
      },
    ],
  },
  {
    title: "Quản lý đánh giá",
    icon: Star,
    href: "/admin/feedbacks",
  },
  {
    title: "Báo cáo & Thống kê",
    icon: BarChart3,
    isSubmenu: true,
    items: [
      {
        title: "Thống kê Doanh thu",
        href: "/admin/analytics",
        icon: BarChart3,
      },
      {
        title: "Thống kê Voucher",
        href: "/admin/reports/voucher",
        icon: Tag,
      },
      {
        title: "Thống kê Promotion",
        href: "/admin/reports/promotion",
        icon: Award,
      },
    ],
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const { logout } = useUser();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const handleLogout = async () => {
    try {
      // Lấy login path trước khi logout (vì logout sẽ clear user data)
      const loginPath = AuthStorageUtil.getLoginPath();
      await logout();
      // Dùng window.location.href để đảm bảo redirect ngay lập tức
      window.location.href = loginPath;
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback về admin login nếu có lỗi
      window.location.href = AUTH_PATH.LOGIN_ADMIN;
    }
  };

  const toggleSubmenu = (menuTitle: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuTitle)) {
        newSet.delete(menuTitle);
      } else {
        newSet.add(menuTitle);
      }
      return newSet;
    });
  };

  const isActiveRoute = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  const isAnySubmenuItemActive = (items: any[]) => {
    return items.some((item) => isActiveRoute(item.href));
  };

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
                  Admin Panel
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarHeader>

          <SidebarContent className="overflow-y-auto overflow-x-hidden bg-gray-900">
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-300 text-xs font-semibold uppercase tracking-wider">
                CHỨC NĂNG HỆ THỐNG
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigation.map((item) => {
                    if (item.isSubmenu) {
                      const isSubmenuActive = isAnySubmenuItemActive(
                        item.items
                      );
                      const isExpanded = expandedMenus.has(item.title);

                      return (
                        <div key={item.title}>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              tooltip={item.title}
                              isActive={isSubmenuActive}
                              className={`h-12 px-4 py-3 text-white hover:bg-gray-800 ${
                                isSubmenuActive ? "bg-gray-600" : ""
                              }`}
                              onClick={() => toggleSubmenu(item.title)}
                            >
                              <item.icon className="shrink-0 h-5 w-5" />
                              <span className="truncate flex-1">
                                {item.title}
                              </span>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 shrink-0" />
                              ) : (
                                <ChevronRight className="h-4 w-4 shrink-0" />
                              )}
                            </SidebarMenuButton>
                          </SidebarMenuItem>

                          {isExpanded && (
                            <SidebarMenu className="ml-6 space-y-1">
                              {item.items.map((subItem) => {
                                const isActive = isActiveRoute(subItem.href);

                                return (
                                  <SidebarMenuItem key={subItem.href}>
                                    <SidebarMenuButton
                                      asChild
                                      tooltip={subItem.title}
                                      isActive={isActive}
                                      className={`h-10 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white ${
                                        isActive ? "bg-gray-600 text-white" : ""
                                      }`}
                                    >
                                      <Link to={subItem.href}>
                                        <subItem.icon className="h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                          {subItem.title}
                                        </span>
                                      </Link>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                );
                              })}
                            </SidebarMenu>
                          )}
                        </div>
                      );
                    } else {
                      const isActive = item.href
                        ? isActiveRoute(item.href)
                        : false;

                      return (
                        <SidebarMenuItem key={item.href || item.title}>
                          <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            isActive={isActive}
                            className={`h-12 px-4 py-3 text-white hover:bg-gray-800 ${
                              isActive ? "bg-gray-600" : ""
                            }`}
                          >
                            <Link to={item.href || "/admin"}>
                              <item.icon className="shrink-0 h-5 w-5" />
                              <span className="truncate">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }
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
                  isActive={location.pathname === "/admin/settings"}
                  className={`h-12 px-4 py-3 text-white hover:bg-gray-800 ${
                    location.pathname === "/admin/settings" ? "bg-gray-600" : ""
                  }`}
                >
                  <Link to="/admin/settings">
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

      {/* Auto-connect to WebSocket for admin */}
      <AdminChatListener />
    </SidebarProvider>
  );
}
