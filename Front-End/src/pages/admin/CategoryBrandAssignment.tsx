// Dòng 1: Import các giá trị (values)
import React, { useState, useEffect, useMemo } from "react"
// Dòng 2: Import các kiểu (types) bằng "import type"
import type { FormEvent } from "react"
import type { Category } from "@/types/category.type"
import type { Brand } from "@/types/brand.type"
import type { BrandCategoryRequest } from "@/types/category-brand.type"

// --- Import 3 file Service ---
import categoryBrandService from "@/services/categoryBrand.service"
import { categoryService } from "@/services/category.service"
import { brandService } from "@/services/brand.service"

// --- THÊM IMPORT CÁC COMPONENT UI ---
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
// --- THÊM ICON MỚI ---
import { Link2, PenSquare, ClipboardList } from "lucide-react"

// Kiểu dữ liệu cho State Phân trang của bảng
interface PaginationState {
  page: number
  size: number
  totalPage: number
  totalItem: number
}

// --- THÊM TYPE CHO BẢNG TÓM TẮT ---
interface CategoryBrandSummary {
  category: Category
  brands: Brand[]
}

// === COMPONENT CHÍNH ===
export default function CategoryBrandAssignment() {
  // === State Chung ===
  const [allBrands, setAllBrands] = useState<Brand[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false) // Loading cho mọi hành động
  const [loadingInitial, setLoadingInitial] = useState(true) // Loading khi tải component
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // === State cho Luồng: Gán Brand cho Category (C2B) ===
  const [selectedCategoryId_C2B, setSelectedCategoryId_C2B] =
    useState<number | null>(null)
  const [brandToAssignId_C2B, setBrandToAssignId_C2B] = useState<number | null>(
    null,
  )
  const [linkedBrands_C2B, setLinkedBrands_C2B] = useState<Brand[]>([])
  const [pagination_C2B, setPagination_C2B] = useState<PaginationState>({
    page: 1,
    size: 5, // Hiển thị 5 item cho gọn
    totalPage: 1,
    totalItem: 0,
  })
  const [brandToUnassign_C2B, setBrandToUnassign_C2B] = useState<Brand | null>(
    null,
  )

  // --- THÊM STATE CHO BẢNG TÓM TẮT ---
  const [summaryData, setSummaryData] = useState<CategoryBrandSummary[]>([])
  const [loadingSummary, setLoadingSummary] = useState(false)

  // --- 3. HÀM HELPER TẢI LẠI BẢNG TÓM TẮT ---
  const fetchSummaryData = async () => {
    // Chỉ tải khi có allCategories
    if (allCategories.length === 0) {
      // Nếu allCategories chưa có, đợi fetchInitialData chạy xong
      // (fetchInitialData sẽ trigger useEffect ở dưới)
      return
    }

    setLoadingSummary(true)
    try {
      const summaryPromises = allCategories.map(async (category) => {
        const res = await categoryBrandService.getBrandsByCategoryId(
          category.id,
          1,
          1000,
        )
        return { category: category, brands: res.data.data }
      })
      const results = await Promise.all(summaryPromises)
      setSummaryData(results)
    } catch (err) {
      setError("Lỗi khi tải bảng tóm tắt.")
    } finally {
      setLoadingSummary(false)
    }
  }

  // === Data Fetching ===

  // 1. Fetch dữ liệu ban đầu (Tất cả Categories và Brands cho dropdown)
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingInitial(true)
      setError(null)
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          brandService.getAllBrandsSimple(),
          categoryService.getAllCategoriesSimple(),
        ])
        setAllBrands(brandsRes.data.data)
        setAllCategories(categoriesRes.data.data)
      } catch (err) {
        setError(
          "Không thể tải dữ liệu ban đầu (Danh mục/Thương hiệu). Hãy đảm bảo bạn đã thêm hàm getAllCategoriesSimple và getAllBrandsSimple vào file service.",
        )
      } finally {
        setLoadingInitial(false)
      }
    }
    fetchInitialData()
  }, [])

  // 2. Data Fetching cho Luồng (C2B)
  const fetchLinkedBrands_C2B = async (categoryId: number, page: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await categoryBrandService.getBrandsByCategoryId(
        categoryId,
        page,
        pagination_C2B.size,
      )
      setLinkedBrands_C2B(res.data.data)
      setPagination_C2B((prev) => ({
        ...prev,
        page: res.data.page,
        totalPage: res.data.totalPage,
        totalItem: res.data.totalItem,
      }))
    } catch (err) {
      setError("Không thể tải danh sách thương hiệu đã liên kết.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedCategoryId_C2B) {
      setLinkedBrands_C2B([])
      return
    }
    fetchLinkedBrands_C2B(selectedCategoryId_C2B, pagination_C2B.page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId_C2B, pagination_C2B.page])

  // --- 3. FETCH DỮ LIỆU CHO BẢNG TÓM TẮT (Khi allCategories thay đổi) ---
  useEffect(() => {
    fetchSummaryData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCategories]) // Phụ thuộc vào `allCategories`

  // === Handlers cho Luồng (C2B) ===
  const handleCategoryChange_C2B = (value: string) => {
    const id = Number(value)
    setSelectedCategoryId_C2B(id || null)
    setBrandToAssignId_C2B(null)
    setPagination_C2B((prev) => ({ ...prev, page: 1 }))
  }

  const handleAssignSubmit_C2B = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCategoryId_C2B || !brandToAssignId_C2B) return
    setLoading(true)
    try {
      const requestData: BrandCategoryRequest = {
        brandId: brandToAssignId_C2B,
        categoryId: selectedCategoryId_C2B,
      }
      await categoryBrandService.assignBrandToCategory(requestData)
      if (pagination_C2B.page !== 1) {
        setPagination_C2B((prev) => ({ ...prev, page: 1 }))
      } else {
        fetchLinkedBrands_C2B(selectedCategoryId_C2B, 1)
      }
      setBrandToAssignId_C2B(null)
      setSuccessMessage("Gán thành công!")
      // Tải lại bảng tóm tắt
      fetchSummaryData() // <-- Tải lại tóm tắt
    } catch (err: any) {
      setError(`Gán thất bại: ${err?.response?.data?.message || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const doUnassign_C2B = async () => {
    if (!selectedCategoryId_C2B || !brandToUnassign_C2B) return
    setLoading(true)
    try {
      const requestData: BrandCategoryRequest = {
        brandId: brandToUnassign_C2B.id,
        categoryId: selectedCategoryId_C2B,
      }
      await categoryBrandService.unassignBrandFromCategory(requestData)
      if (linkedBrands_C2B.length === 1 && pagination_C2B.page > 1) {
        setPagination_C2B((prev) => ({ ...prev, page: prev.page - 1 }))
      } else {
        fetchLinkedBrands_C2B(selectedCategoryId_C2B, pagination_C2B.page)
      }
      setSuccessMessage("Hủy gán thành công!")
      // Tải lại bảng tóm tắt
      fetchSummaryData() // <-- Tải lại tóm tắt
    } catch (err: any) {
      setError(`Hủy gán thất bại: ${err?.response?.data?.message || err.message}`)
    } finally {
      setLoading(false)
      setBrandToUnassign_C2B(null)
    }
  }

  // === Logic phụ ===
  const availableBrandsToAssign_C2B = useMemo(() => {
    if (loadingInitial) return []
    const linkedIds = new Set(linkedBrands_C2B.map((brand) => brand.id))
    return allBrands.filter((brand) => !linkedIds.has(brand.id))
  }, [allBrands, linkedBrands_C2B, loadingInitial])

  // === Render ===

  if (loadingInitial) {
    return <div style={{ padding: "20px" }}>Đang tải dữ liệu ban đầu...</div>
  }

  return (
    <>
      {/* --- 1. SỬA TIÊU ĐỀ CHÍNH (THÊM ICON) --- */}
      <div className="flex items-center gap-3 justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Link2 className="h-7 w-7" />
          Liên kết Thương hiệu - Danh mục
        </h1>
      </div>

      {/* Hiển thị lỗi chung (nếu có) */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* --- BỘ QUẢN LÝ: GÁN BRAND CHO CATEGORY (C2B) --- */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            {/* --- SỬA TIÊU ĐỀ CARD (THÊM ICON) --- */}
            <CardTitle className="flex items-center gap-2">
              <PenSquare className="h-5 w-5" />
              Gán Thương hiệu cho Danh mục
            </CardTitle>
            <CardDescription>
              Chọn một danh mục để xem và gán các thương hiệu tương ứng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="category-select-c2b">Chọn Danh mục</Label>
              <Select
                onValueChange={handleCategoryChange_C2B}
                value={selectedCategoryId_C2B ? String(selectedCategoryId_C2B) : ""}
              >
                <SelectTrigger id="category-select-c2b">
                  <SelectValue placeholder="-- Chọn một danh mục --" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedCategoryId_C2B && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Các Thương hiệu đã liên kết ({pagination_C2B.totalItem})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tên Thương hiệu</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && <TableRow><TableCell colSpan={3} className="text-center">Đang tải...</TableCell></TableRow>}
                    {!loading && linkedBrands_C2B.length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center">Chưa có thương hiệu nào.</TableCell></TableRow>
                    )}
                    {!loading &&
                      linkedBrands_C2B.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell>{brand.id}</TableCell>
                          <TableCell className="font-medium">{brand.name}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setBrandToUnassign_C2B(brand)}
                              disabled={loading}
                            >
                              Xóa
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
              {pagination_C2B.totalPage > 1 && (
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setPagination_C2B((prev) => ({ ...prev, page: prev.page - 1 }))} disabled={pagination_C2B.page <= 1 || loading}>Trang trước</Button>
                  <span className="text-sm text-muted-foreground">Trang {pagination_C2B.page} / {pagination_C2B.totalPage}</span>
                  <Button variant="outline" onClick={() => setPagination_C2B((prev) => ({ ...prev, page: prev.page + 1 }))} disabled={pagination_C2B.page >= pagination_C2B.totalPage || loading}>Trang sau</Button>
                </CardFooter>
              )}
            </Card>
            <Card>
              <CardHeader><CardTitle>Gán Thương hiệu mới</CardTitle></CardHeader>
              <form onSubmit={handleAssignSubmit_C2B}>
                <CardContent className="space-y-6">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="brand-assign-select-c2b">Chọn Thương hiệu để gán</Label>
                    <Select onValueChange={(value) => setBrandToAssignId_C2B(Number(value) || null)} value={brandToAssignId_C2B ? String(brandToAssignId_C2B) : ""} disabled={loading}>
                      <SelectTrigger id="brand-assign-select-c2b"><SelectValue placeholder="-- Chọn thương hiệu --" /></SelectTrigger>
                      <SelectContent>
                        {availableBrandsToAssign_C2B.length === 0 ? (
                          <SelectItem value="none" disabled>Đã gán hết thương hiệu</SelectItem>
                        ) : (
                          availableBrandsToAssign_C2B.map((brand) => (
                            <SelectItem key={brand.id} value={String(brand.id)}>
                              {brand.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Đưa Button vào CardContent và bỏ CardFooter */}
                  <Button
                    type="submit"
                    disabled={!brandToAssignId_C2B || loading}
                    // --- SỬA MÀU NÚT GÁN (XANH DƯƠNG) ---
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {loading ? "Đang gán..." : "Gán"}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </div>
        )}
      </div>

      {/* --- VẠCH PHÂN CÁCH --- */}
      <hr className="my-12 border-t-2 border-dashed" />

      {/* --- BẢNG TÓM TẮT MỚI (YÊU CẦU CỦA BẠN) --- */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            {/* --- SỬA TIÊU ĐỀ CARD (THÊM ICON) --- */}
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Bảng tóm tắt: Thương hiệu theo Danh mục
            </CardTitle>
            <CardDescription>
              Bảng này hiển thị tất cả các thương hiệu đã được gán cho từng danh
              mục.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSummary && <p>Đang tải tóm tắt...</p>}
            {!loadingSummary && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên Danh mục</TableHead>
                    <TableHead>Các Thương hiệu đã gán</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        Không có dữ liệu.
                      </TableCell>
                    </TableRow>
                  )}
                  {summaryData.map(({ category, brands }) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium align-top">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        {brands.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            Chưa có thương hiệu nào
                          </span>
                        ) : (
                          // Hiển thị các brand như các tag
                          <div className="flex flex-wrap gap-2">
                            {brands.map((brand) => (
                              <span
                                key={brand.id}
                                className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full"
                              >
                                {brand.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- DIALOGS (Giữ nguyên) --- */}

      {/* 1. Dialog Xác nhận Xóa (C2B) */}
      <AlertDialog
        open={!!brandToUnassign_C2B}
        onOpenChange={(open) => {
          if (!open) setBrandToUnassign_C2B(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ hủy gán thương hiệu{" "}
              <strong>"{brandToUnassign_C2B?.name}"</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* --- SỬA NÚT HỦY (XÁM NHẠT) --- */}
            <AlertDialogCancel asChild>
              <Button variant="ghost">Hủy</Button>
            </AlertDialogCancel>
            {/* --- SỬA NÚT XÁC NHẬN (XANH DƯƠNG) --- */}
            <AlertDialogAction
              onClick={doUnassign_C2B}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Đang xóa..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2. Dialog Thông báo Thành công (Dùng chung) */}
      <AlertDialog
        open={!!successMessage}
        onOpenChange={(open) => {
          if (!open) setSuccessMessage(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thành công!</AlertDialogTitle>
            <AlertDialogDescription>{successMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* --- SỬA NÚT OK (XANH LÁ) --- */}
            <AlertDialogAction
              onClick={() => {
                setSuccessMessage(null);
                // --- THÊM LOGIC RESET VÀO ĐÂY ---
                // Quay lại trạng thái ban đầu sau khi xác nhận
                setSelectedCategoryId_C2B(null);
                setBrandToAssignId_C2B(null);
                setLinkedBrands_C2B([]);
                // --- HẾT ---
              }}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}