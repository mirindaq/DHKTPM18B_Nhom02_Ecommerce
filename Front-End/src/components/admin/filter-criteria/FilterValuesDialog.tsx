import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Loader2 } from "lucide-react"
import type { FilterCriteria } from "@/types/filterCriteria.type"
import { filterCriteriaService } from "@/services/filterCriteria.service"
import { toast } from "sonner"

interface FilterValuesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterCriteria: FilterCriteria | null;
  onSuccess?: () => void;
}

export default function FilterValuesDialog({
  open,
  onOpenChange,
  filterCriteria,
  onSuccess,
}: FilterValuesDialogProps) {
  const [values, setValues] = useState<string[]>([])
  const [newValue, setNewValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (filterCriteria && open) {
      setValues(filterCriteria.filterValues?.map(fv => fv.value) || [])
    }
  }, [filterCriteria, open])

  const handleAddValue = () => {
    if (newValue.trim() && !values.includes(newValue.trim())) {
      setValues(prev => [...prev, newValue.trim()])
      setNewValue("")
    }
  }

  const handleRemoveValue = (index: number) => {
    setValues(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!filterCriteria) return

    setIsLoading(true)
    try {
      await filterCriteriaService.setFilterValuesForCriteria({
        filterCriteriaId: filterCriteria.id,
        values: values
      })
      toast.success("Cập nhật giá trị tiêu chí lọc thành công")
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Error setting filter values:", error)
      toast.error("Không thể cập nhật giá trị tiêu chí lọc")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Quản lý giá trị tiêu chí
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            <span className="font-semibold text-gray-800">{filterCriteria?.name}</span> - Thêm hoặc xóa các giá trị cho tiêu chí lọc này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label htmlFor="newValue" className="text-sm font-semibold text-gray-700">
              Thêm giá trị mới
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="newValue"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddValue()
                  }
                }}
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                placeholder="Nhập giá trị và nhấn Enter hoặc nút Thêm"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={handleAddValue}
                disabled={isLoading || !newValue.trim()}
                className="h-10 px-4 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm
              </Button>
            </div>
          </div>

          {values.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700">
                  Danh sách giá trị
                </Label>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                  {values.length} giá trị
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5 p-4 border-2 border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white min-h-[120px]">
                {values.map((value, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gray-100 text-gray-800 border-gray-300 px-3 py-1.5 text-sm font-medium inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span>{value}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(index)}
                      className="ml-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-0.5 transition-colors -mr-1"
                      disabled={isLoading}
                      title="Xóa giá trị này"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {values.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Chưa có giá trị nào
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Hãy thêm giá trị mới ở trên
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="px-6"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-shadow"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

