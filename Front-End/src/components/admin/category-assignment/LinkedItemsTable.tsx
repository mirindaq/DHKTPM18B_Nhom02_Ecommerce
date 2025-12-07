import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LinkedItem {
  id: number;
  name: string;
  status?: boolean;
}

interface LinkedItemsTableProps<T extends LinkedItem> {
  items: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  showStatus?: boolean;
  itemType: "brand" | "variant";
}

export default function LinkedItemsTable<T extends LinkedItem>({
  items,
  isLoading,
  emptyMessage = "Chưa có item nào được liên kết",
  showStatus = false,
  itemType,
}: LinkedItemsTableProps<T>) {
  const getStatusBadge = (status: boolean) => {
    return (
      <span
        className={`text-sm px-2 py-1 rounded-full ${
          status
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {status ? "Hoạt động" : "Không hoạt động"}
      </span>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>
            Tên {itemType === "brand" ? "Thương hiệu" : "Variant"}
          </TableHead>
          {showStatus && <TableHead>Trạng thái</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell
              colSpan={showStatus ? 3 : 2}
              className="text-center"
            >
              Đang tải...
            </TableCell>
          </TableRow>
        )}
        {!isLoading && items.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={showStatus ? 3 : 2}
              className="text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
        {!isLoading &&
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              {showStatus && item.status !== undefined && (
                <TableCell>{getStatusBadge(item.status)}</TableCell>
              )}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

