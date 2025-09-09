import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date: Date | undefined) {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; // hiển thị
}

function formatDateSubmit(date: Date | undefined) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // lưu DB
}

function isValidDate(date: Date | undefined) {
  return !!date && !isNaN(date.getTime());
}

interface DatePickerProps {
  id?: string;
  value: string | undefined; // luôn là yyyy-MM-dd trong formData
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Chọn ngày",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [month, setMonth] = React.useState<Date | undefined>(undefined);

  // hiển thị value dạng dd/MM/yyyy
  const displayValue = React.useMemo(() => {
    if (!value) return "";
    const d = new Date(value);
    return isValidDate(d) ? formatDate(d) : value;
  }, [value]);

  React.useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (isValidDate(d)) {
        setDate(d);
        setMonth(d);
      }
    }
  }, [value]);

  return (
    <div className="relative w-full">
      <Input
        id={id}
        value={displayValue}
        placeholder={placeholder}
        className={`bg-background pr-10 w-full ${className}`} // ép full width
        readOnly
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={`${id}-btn`}
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(d) => {
              setDate(d);
              onChange(d ? formatDateSubmit(d) : "");
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
