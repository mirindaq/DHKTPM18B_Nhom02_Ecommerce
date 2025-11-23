// Dòng 1: Import các giá trị (values)
import React, { useState, useEffect, useMemo } from "react"
// Dòng 2: Import các kiểu (types) bằng "import type"
import type { ChangeEvent, FormEvent } from "react"
import type { Category } from "@/types/category.type"
import type { Brand } from "@/types/brand.type"
import type { BrandCategoryRequest } from "@/types/category-brand.type"

// --- Import 3 file Service ---
// 1. Service cho các liên kết
import categoryBrandService from "@/services/categoryBrand.service"
// 2. Service để lấy TẤT CẢ categories cho dropdown
import { categoryService } from "@/services/category.service"
// 3. Service để lấy TẤT CẢ brands cho dropdown
import { brandService } from "@/services/brand.service"

// Kiểu dữ liệu cho State Phân trang của bảng
interface PaginationState {
  page: number
  size: number
  totalPage: number
  totalItem: number
}

// === COMPONENT CHÍNH ===
export default function CategoryBrandManager() {
  // === State ===

  // State cho dữ liệu dropdown (tải 1 lần)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [allBrands, setAllBrands] = useState<Brand[]>([])

  // State cho lựa chọn của người dùng
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  )
  const [brandToAssignId, setBrandToAssignId] = useState<number | null>(null)

  // State cho bảng kết quả (các brand đã liên kết)
  const [linkedBrands, setLinkedBrands] = useState<Brand[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    size: 10, // Số brand liên kết hiển thị mỗi trang
    totalPage: 1,
    totalItem: 0,
  })

  // State cho UI (loading, error)
  const [loading, setLoading] = useState(false) // Loading cho các hành động (gán, xóa, đổi trang)
  const [loadingInitial, setLoadingInitial] = useState(true) // Loading khi tải component
  const [error, setError] = useState<string | null>(null)

  // === Data Fetching ===

  // 1. Fetch dữ liệu ban đầu (Tất cả Categories và Brands cho dropdown)
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingInitial(true)
      setError(null)
      try {
        // Gọi 2 hàm "getAll...Simple" (không phân trang)
        const [categoriesRes, brandsRes] = await Promise.all([
          categoryService.getAllCategoriesSimple(),
          brandService.getAllBrandsSimple(),
        ])

        // --- 🔥 SỬA LỖI Ở ĐÂY ---
        // Lỗi của bạn cho thấy `categoriesRes.data` là một object { data, page, ... }
        // vì vậy chúng ta cần lấy mảng `data` bên trong nó.
        setAllCategories(categoriesRes.data.data) // Sửa từ .data -> .data.data
        setAllBrands(brandsRes.data.data)       // Sửa từ .data -> .data.data
      } catch (err) {
        setError(
          "Không thể tải dữ liệu ban đầu (Categories/Brands). Hãy đảm bảo bạn đã thêm hàm getAllCategoriesSimple và getAllBrandsSimple vào file service.",
        )
        console.error("Lỗi fetchInitialData:", err)
      } finally {
        setLoadingInitial(false)
      }
    }
    fetchInitialData()
  }, []) // Chỉ chạy 1 lần khi component mount

  // 2. Hàm fetch danh sách brand đã liên kết (có phân trang)
  const fetchLinkedBrands = async (categoryId: number, page: number) => {
    setLoading(true)
    setError(null)
    try {
      // Hàm này từ categoryBrand.service.ts
      const res = await categoryBrandService.getBrandsByCategoryId(
        categoryId,
        page,
        pagination.size,
      )
      // Dữ liệu trả về từ service có dạng { data: { data, totalPage, ... } }
      setLinkedBrands(res.data.data)
      setPagination((prev) => ({
        ...prev,
        page: res.data.page,
        totalPage: res.data.totalPage,
        totalItem: res.data.totalItem,
      }))
    } catch (err) {
      setError("Không thể tải danh sách brand đã liên kết.")
      console.error("Lỗi fetchLinkedBrands:", err)
    } finally {
      setLoading(false)
    }
  }

  // 3. Chạy lại fetchLinkedBrands KHI `selectedCategoryId` hoặc `pagination.page` thay đổi
  useEffect(() => {
    if (!selectedCategoryId) {
      setLinkedBrands([]) // Reset danh sách nếu không chọn category
      return
    }

    // Tự động gọi khi user chọn category hoặc đổi trang
    fetchLinkedBrands(selectedCategoryId, pagination.page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, pagination.page])

  // === Handlers ===

  // Khi chọn một category từ dropdown chính
  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    setSelectedCategoryId(id || null)
    setBrandToAssignId(null) // Reset form gán
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset về trang 1
  }

  // Khi nhấn nút "Gán"
  const handleAssignSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCategoryId || !brandToAssignId) {
      alert("Vui lòng chọn category và brand để gán.")
      return
    }

    setLoading(true)
    try {
      const requestData: BrandCategoryRequest = {
        categoryId: selectedCategoryId,
        brandId: brandToAssignId,
      }
      await categoryBrandService.assignBrandToCategory(requestData)

      // Tải lại danh sách brand đã liên kết
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 })) // Về trang 1
      } else {
        fetchLinkedBrands(selectedCategoryId, 1) // Trigger fetch lại trang 1
      }

      setBrandToAssignId(null) // Reset form
      alert("Gán thành công!")
    } catch (err: any) {
      setError(`Gán brand thất bại: ${err?.response?.data?.message || err.message}`)
      console.error("Lỗi handleAssignSubmit:", err)
    } finally {
      setLoading(false)
    }
  }

  // Khi nhấn nút "Xóa" (Hủy gán)
  const handleUnassignClick = async (brandIdToRemove: number) => {
    if (
      !selectedCategoryId ||
      !window.confirm("Bạn có chắc muốn hủy gán brand này?")
    ) {
      return
    }

    setLoading(true)
    try {
      const requestData: BrandCategoryRequest = {
        categoryId: selectedCategoryId,
        brandId: brandIdToRemove,
      }
      await categoryBrandService.unassignBrandFromCategory(requestData)

      // Tải lại danh sách
      // Kiểm tra xem trang hiện tại có bị trống sau khi xóa không
      if (linkedBrands.length === 1 && pagination.page > 1) {
        // Nếu đây là item cuối cùng của trang > 1, lùi về trang trước
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
      } else {
        // Ngược lại, chỉ cần fetch lại trang hiện tại
        fetchLinkedBrands(selectedCategoryId, pagination.page)
      }

      alert("Hủy gán thành công!")
    } catch (err: any) {
      setError(`Hủy gán thất bại: ${err?.response?.data?.message || err.message}`)
      console.error("Lỗi handleUnassignClick:", err)
    } finally {
      setLoading(false)
    }
  }

  // === Logic phụ ===

  // Tính toán danh sách brand "chưa được gán" để hiển thị trong form "Gán"
  const availableBrandsToAssign = useMemo(() => {
    if (loadingInitial) return []
    const linkedBrandIds = new Set(linkedBrands.map((brand) => brand.id))
    return allBrands.filter((brand) => !linkedBrandIds.has(brand.id))
  }, [allBrands, linkedBrands, loadingInitial])

  // === Render ===

  if (loadingInitial) {
    return (
      <div style={{ padding: "20px" }}>Đang tải dữ liệu ban đầu...</div>
    )
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Quản lý Category - Brand</h2>

      {/* Thông báo lỗi chung */}
      {error && (
        <p style={{ color: "red", border: "1px solid red", padding: "10px" }}>
          <strong>Lỗi:</strong> {error}
        </p>
      )}

      {/* 1. Chọn Category */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="category-select" style={{ marginRight: "10px" }}>
          <strong>Chọn Category:</strong>
        </label>
        <select
          id="category-select"
          onChange={handleCategoryChange}
          value={selectedCategoryId || ""}
          style={{ padding: "8px", fontSize: "16px" }}
        >
          <option value="">-- Chọn một category --</option>
          {allCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chỉ hiển thị phần dưới nếu đã chọn category */}
      {selectedCategoryId && (
        <div>
          <hr />
          {/* 2. Form Gán Brand mới */}
          <h3>Gán Brand cho Category</h3>
          <form onSubmit={handleAssignSubmit}>
            <select
              value={brandToAssignId || ""}
              onChange={(e) =>
                setBrandToAssignId(Number(e.target.value) || null)
              }
              style={{ padding: "8px", fontSize: "16px" }}
              disabled={loading}
            >
              <option value="">-- Chọn brand để gán --</option>
              {availableBrandsToAssign.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!brandToAssignId || loading}
              style={{ marginLeft: "10px", padding: "8px 12px" }}
            >
              {loading ? "Đang gán..." : "Gán"}
            </button>
          </form>

          {/* 3. Danh sách Brand đã liên kết */}
          <h3 style={{ marginTop: "30px" }}>
            Các Brand đã liên kết ({pagination.totalItem})
          </h3>
          {loading && <p>Đang tải danh sách...</p>}
          <table
            border={1}
            cellPadding={8}
            cellSpacing={0}
            width="100%"
            style={{ borderCollapse: "collapse" }}
          >
            <thead style={{ backgroundColor: "#f4f4f4" }}>
              <tr>
                <th>ID Brand</th>
                <th>Tên Brand</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {linkedBrands.length === 0 && !loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center" }}>
                    Chưa có brand nào được liên kết.
                  </td>
                </tr>
              ) : (
                linkedBrands.map((brand) => (
                  <tr key={brand.id}>
                    <td style={{ textAlign: "center" }}>{brand.id}</td>
                    <td>{brand.name}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleUnassignClick(brand.id)}
                        disabled={loading}
                        style={{ color: "red", cursor: "pointer" }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* 4. Phân trang cho bảng */}
          {pagination.totalPage > 1 && (
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page <= 1 || loading}
              >
                &laquo; Trang trước
              </button>
              <span>
                Trang <strong>{pagination.page}</strong> /{" "}
                <strong>{pagination.totalPage}</strong>
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page >= pagination.totalPage || loading}
              >
                Trang sau &raquo;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}