import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useDebounce } from "@/hooks";
import { customerService } from "@/services/customer.service";
import { rankingService } from "@/services/ranking.service";
import type { CustomerSummary } from "@/types/customer.type";
import { Search, Check } from "lucide-react";

interface CustomerSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: number[];
  onSelectCustomer: (customer: CustomerSummary) => void;
}

interface SearchFilters {
  name: string;
  email: string;
  phone: string;
  rank: string;
}

export default function CustomerSearchModal({
  open,
  onOpenChange,
  selectedIds,
  onSelectCustomer,
}: CustomerSearchModalProps) {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    name: "",
    email: "",
    phone: "",
    rank: "",
  });
  
  const debouncedName = useDebounce(searchFilters.name, 500);
  const debouncedEmail = useDebounce(searchFilters.email, 500);
  const debouncedPhone = useDebounce(searchFilters.phone, 500);

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchFilters({
        name: "",
        email: "",
        phone: "",
        rank: "",
      });
    }
  }, [open]);

  // Get rankings for dropdown
  const { data: rankingsData } = useQuery(
    () => rankingService.getAllRankings(),
    { queryKey: ["rankings"] }
  );

  const rankings = rankingsData?.data || [];

  // Check if any search filter is active
  const hasActiveSearch = Boolean(debouncedName || debouncedEmail || debouncedPhone || searchFilters.rank);

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery(
    () => customerService.getCustomers({
      page: 1,
      size: 100,
      name: debouncedName || undefined,
      email: debouncedEmail || undefined,
      phone: debouncedPhone || undefined,
      rank: searchFilters.rank && searchFilters.rank !== "all" ? searchFilters.rank : undefined,
    }),
    {
      queryKey: ["customers-search-modal", debouncedName, debouncedEmail, debouncedPhone, searchFilters.rank],
      enabled: hasActiveSearch,
    }
  );

  const customers = customersData?.data?.data || [];

  const handleToggleCustomer = (customer: CustomerSummary) => {
    onSelectCustomer(customer);
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setSearchFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Tìm kiếm khách hàng
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-name">Tên khách hàng</Label>
              <div className="relative">
                <Input
                  id="search-name"
                  placeholder="Nhập tên khách hàng..."
                  value={searchFilters.name}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                  className="h-10 pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-email">Email</Label>
              <div className="relative">
                <Input
                  id="search-email"
                  type="email"
                  placeholder="Nhập email..."
                  value={searchFilters.email}
                  onChange={(e) => handleFilterChange("email", e.target.value)}
                  className="h-10 pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-phone">Số điện thoại</Label>
              <div className="relative">
                <Input
                  id="search-phone"
                  type="tel"
                  placeholder="Nhập số điện thoại..."
                  value={searchFilters.phone}
                  onChange={(e) => handleFilterChange("phone", e.target.value)}
                  className="h-10 pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-rank">Hạng thành viên</Label>
              <Select
                value={searchFilters.rank || undefined}
                onValueChange={(value) => handleFilterChange("rank", value === "all" ? "" : value)}
              >
                <SelectTrigger id="search-rank" className="h-10">
                  <SelectValue placeholder="Chọn hạng thành viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả hạng</SelectItem>
                  {rankings.map((rank) => (
                    <SelectItem key={rank.id} value={rank.name}>
                      {rank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {!hasActiveSearch ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">
                  Nhập thông tin để tìm kiếm khách hàng
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Bạn có thể tìm theo tên, email, số điện thoại hoặc hạng thành viên
                </p>
              </div>
            ) : isLoadingCustomers ? (
              <div className="space-y-3 py-4 px-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 animate-pulse border rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Search className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium mb-1">
                  Không tìm thấy khách hàng
                </p>
                <p className="text-gray-400 text-sm">
                  Thử tìm kiếm với thông tin khác
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {customers.map((customer) => {
                  const isSelected = selectedIds.includes(customer.id);
                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => handleToggleCustomer(customer)}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-blue-50 active:bg-blue-100 transition-all duration-150 text-left border rounded-lg group hover:border-blue-300 hover:shadow-sm ${
                        isSelected
                          ? "bg-blue-50 border-blue-300"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        {customer.avatar ? (
                          <img
                            src={customer.avatar}
                            alt={customer.fullName}
                            className={`w-16 h-16 object-cover rounded-full border-2 transition-colors ${
                              isSelected
                                ? "border-blue-300"
                                : "border-gray-200 group-hover:border-blue-300"
                            }`}
                            loading="lazy"
                          />
                        ) : (
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-colors ${
                            isSelected
                              ? "bg-blue-100 border-blue-300"
                              : "bg-gray-100 border-gray-200 group-hover:border-blue-300"
                          }`}>
                            <span className="text-2xl">👤</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold text-base line-clamp-1 transition-colors ${
                            isSelected
                              ? "text-blue-600"
                              : "text-gray-900 group-hover:text-blue-600"
                          }`}
                        >
                          {customer.fullName}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                          {customer.email}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          {customer.phone && (
                            <p className="text-xs text-gray-400">
                              📞 {customer.phone}
                            </p>
                          )}
                          {customer.rankingName && (
                            <p className="text-xs text-gray-400">
                              🏆 {customer.rankingName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Xong ({selectedIds.length} đã chọn)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
