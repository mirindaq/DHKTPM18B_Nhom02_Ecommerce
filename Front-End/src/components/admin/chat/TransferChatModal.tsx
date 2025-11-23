import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserCheck, Loader2 } from "lucide-react";
import type { Staff } from "@/types/staff.type";
import { cn } from "@/lib/utils";

interface TransferChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffs: Staff[];
  selectedStaffId?: number;
  onSelectStaff: (staffId: number) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  isBulkTransfer?: boolean;
  chatCount?: number;
}

export default function TransferChatModal({
  open,
  onOpenChange,
  staffs,
  selectedStaffId,
  onSelectStaff,
  onConfirm,
  isLoading = false,
  isBulkTransfer = false,
  chatCount = 0,
}: TransferChatModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStaffs = useMemo(() => {
    if (!searchQuery.trim()) return staffs;
    
    const query = searchQuery.toLowerCase();
    return staffs.filter(
      (staff) =>
        staff.fullName.toLowerCase().includes(query) ||
        staff.email.toLowerCase().includes(query)
    );
  }, [staffs, searchQuery]);

  const selectedStaff = staffs.find((s) => s.id === selectedStaffId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isBulkTransfer ? "Chuyển nhanh nhiều chat" : "Chuyển chat"}
          </DialogTitle>
          <DialogDescription>
            {isBulkTransfer
              ? `Chọn nhân viên để chuyển ${chatCount} chat đã chọn`
              : "Chọn nhân viên để chuyển chat này"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Staff List */}
          <ScrollArea className="h-[300px] rounded-md border">
            <div className="p-2 space-y-1">
              {filteredStaffs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">Không tìm thấy nhân viên</p>
                </div>
              ) : (
                filteredStaffs.map((staff) => (
                  <div
                    key={staff.id}
                    onClick={() => onSelectStaff(staff.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted",
                      selectedStaffId === staff.id && "bg-primary/10 border border-primary"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {staff.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {staff.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {staff.email}
                      </p>
                    </div>
                    {selectedStaffId === staff.id && (
                      <UserCheck className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Selected Staff Info */}
          {selectedStaff && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Đã chọn:</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {selectedStaff.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{selectedStaff.fullName}</p>
                  <p className="text-xs text-muted-foreground">{selectedStaff.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!selectedStaffId || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang chuyển...
              </>
            ) : (
              "Xác nhận"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

