import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Category } from "@/types/category.type";

interface SummaryItem {
  id: number;
  name: string;
  status?: boolean;
}

interface SummaryTableProps<T extends SummaryItem> {
  data: Array<{
    category: Category;
    items: T[];
  }>;
  isLoading?: boolean;
  itemType: "brand" | "variant";
  emptyMessage?: string;
}

export default function SummaryTable<T extends SummaryItem>({
  data,
  isLoading,
  itemType,
  emptyMessage,
}: SummaryTableProps<T>) {
  const itemTypeLabel =
    itemType === "brand" ? "Thương hiệu" : "Variant";

  const getItemBadgeClass = (status?: boolean) => {
    if (status === undefined) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return status
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-gray-50 text-gray-500 border-gray-200";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên Danh mục</TableHead>
          <TableHead>Các {itemTypeLabel} đã gán</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={2} className="text-center">
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Đang tải tóm tắt...</p>
              </div>
            </TableCell>
          </TableRow>
        )}
        {!isLoading && data.length === 0 && (
          <TableRow>
            <TableCell colSpan={2} className="text-center text-muted-foreground">
              {emptyMessage || "Không có dữ liệu"}
            </TableCell>
          </TableRow>
        )}
        {!isLoading &&
          data.map(({ category, items }) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium align-top w-1/4">
                {category.name}
              </TableCell>
              <TableCell>
                {items.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Chưa có {itemTypeLabel.toLowerCase()} nào
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <span
                        key={item.id}
                        className={`text-sm border px-3 py-1 rounded-full font-medium ${getItemBadgeClass(
                          item.status
                        )}`}
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

