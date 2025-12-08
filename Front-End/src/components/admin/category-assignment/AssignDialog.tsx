import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useMemo } from "react";

interface AssignableItem {
  id: number;
  name: string;
  status?: boolean;
}

interface AssignDialogProps<T extends AssignableItem> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: T[];
  selectedIds: Set<number>;
  onSelectionChange: (id: number, checked: boolean | "indeterminate") => void;
  onSubmit: () => void;
  isLoading?: boolean;
  categoryName: string;
  itemType: "brand" | "variant";
  searchPlaceholder?: string;
}

export default function AssignDialog<T extends AssignableItem>({
  open,
  onOpenChange,
  items,
  selectedIds,
  onSelectionChange,
  onSubmit,
  isLoading,
  categoryName,
  itemType,
  searchPlaceholder,
}: AssignDialogProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  // Reset search term when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const itemTypeLabel =
    itemType === "brand" ? "Thương hiệu" : "Variant";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cập nhật {itemTypeLabel}</DialogTitle>
          <DialogDescription>
            Chọn các {itemTypeLabel.toLowerCase()} sẽ được liên kết với danh mục:{" "}
            <strong>{categoryName}</strong>. Bỏ chọn để hủy liên kết.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder || `Tìm ${itemTypeLabel.toLowerCase()}...`}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="h-72 w-full rounded-md border">
          <div className="p-4 space-y-2">
            {filteredItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Không tìm thấy {itemTypeLabel.toLowerCase()}
              </p>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-2 py-1"
                >
                  <Checkbox
                    id={`${itemType}-${item.id}`}
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={(checked) =>
                      onSelectionChange(item.id, checked)
                    }
                  />
                  <label
                    htmlFor={`${itemType}-${item.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {item.name}
                    {item.status === false && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Không hoạt động)
                      </span>
                    )}
                  </label>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isLoading
              ? "Đang cập nhật..."
              : `Cập nhật (${selectedIds.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

