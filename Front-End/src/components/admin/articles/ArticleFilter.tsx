import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { articleCategoryService } from "@/services/article-category.service";

export default function ArticleFilter({ onSearch }: { onSearch: (filters: any) => void }) {
    const [categories, setCategories] = useState<{ id: number; title: string }[]>([]);
    const [filters, setFilters] = useState({
        title: "",
        status: "all",
        categoryId: "all",
        createdDate: ""
    });

    useEffect(() => {
        articleCategoryService.getCategories(1, 1000, "").then((res) => {
            setCategories(res.data.data);
        });
    }, []);

    const handleChange = (field: string, value: string) => {
        setFilters({ ...filters, [field]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const searchFilters = {
            title: filters.title || null,
            status: filters.status === "all" ? null : filters.status === "true",
            categoryId:
                filters.categoryId === "all" ? null : Number(filters.categoryId),
            createdDate: filters.createdDate || null
        };
        console.log("🔍 Searching with filters:", searchFilters);
        onSearch(searchFilters);
    };

    const handleClearFilters = () => {
        const reset = {
            title: "",
            status: "all",
            categoryId: "all",
            createdDate: ""
        };
        setFilters(reset);
        onSearch({});
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <h2 className="font-semibold text-gray-700 text-base mb-4">Bộ lọc tìm kiếm</h2>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="space-y-1 md:col-span-5">
                        <Label htmlFor="filterTitle" className="text-sm text-gray-600">
                            Tiêu đề
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="filterTitle"
                                placeholder="Nhập tiêu đề bài viết và nhấn Enter..."
                                value={filters.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSubmit(e as any);
                                    }
                                }}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-7 grid grid-cols-3 gap-4">

                        <div className="space-y-1">
                            <Label className="text-sm text-gray-600">Ngày tạo</Label>
                            <div className="flex items-center">
                    
                                <DatePicker
                                    id="filterCreatedDate"
                                    value={filters.createdDate}
                                    placeholder="Ngày tạo"
                                    onChange={(val) => handleChange("createdDate", val)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="filterCategory" className="text-sm text-gray-600">Danh mục</Label>
                            <Select
                                value={filters.categoryId}
                                onValueChange={(val) => handleChange("categoryId", val)}
                            >
                                <SelectTrigger className="w-full"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="filterStatus" className="text-sm text-gray-600">
                                Trạng thái
                            </Label>
                            <Select
                                value={filters.status}
                                onValueChange={(val) => handleChange("status", val)}
                            >
                                <SelectTrigger id="filterStatus" className="w-full">
                                    <SelectValue placeholder="Tất cả trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="true">Hiển thị</SelectItem>
                                    <SelectItem value="false">Ẩn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearFilters}
                        className="px-4"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Xóa bộ lọc
                    </Button>
                    <Button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700">
                        <Search className="h-4 w-4 mr-1" />
                        Tìm kiếm
                    </Button>
                </div>
            </form>
        </div>
    );
}
