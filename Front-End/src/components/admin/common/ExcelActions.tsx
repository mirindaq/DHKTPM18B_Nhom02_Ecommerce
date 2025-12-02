import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportError {
  rowIndex: number;
  field: string;
  message: string;
}

interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  message: string;
}

interface ExcelActionsProps {
  onDownloadTemplate: () => Promise<Blob>;
  onImport: (file: File) => Promise<{ data: ImportResult }>;
  onExport: () => Promise<Blob>;
  onImportSuccess?: () => void;
  templateFileName?: string;
  exportFileName?: string;
}

export default function ExcelActions({
  onDownloadTemplate,
  onImport,
  onExport,
  onImportSuccess,
  templateFileName = "template.xlsx",
  exportFileName = "export.xlsx",
}: ExcelActionsProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await onDownloadTemplate();
      downloadFile(blob, templateFileName);
      toast.success("Tải template thành công");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải template");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
      return;
    }

    console.log("Importing file:", file.name, "Size:", file.size, "Type:", file.type);

    setIsImporting(true);
    try {
      const response = await onImport(file);
      console.log("Import response:", response);
      const result = response.data;
      setImportResult(result);
      setShowResultDialog(true);

      if (result.errorCount === 0) {
        toast.success(`Import thành công ${result.successCount} bản ghi`);
        onImportSuccess?.();
      } else {
        toast.warning(
          `Import hoàn tất: ${result.successCount} thành công, ${result.errorCount} lỗi`
        );
      }
    } catch (error: any) {
      console.error("Import error:", error);
      console.error("Error response:", error?.response);
      const errorMessage = error?.response?.data?.message || error?.message || "Import thất bại";
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await onExport();
      const filename = `${exportFileName.replace(".xlsx", "")}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      downloadFile(blob, filename);
      toast.success("Export thành công");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Export thất bại");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Tải Template
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isImporting ? "Đang import..." : "Import Excel"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImport}
          className="hidden"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Đang export..." : "Export Excel"}
        </Button>
      </div>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kết quả Import</DialogTitle>
            <DialogDescription>
              Chi tiết quá trình import dữ liệu từ file Excel
            </DialogDescription>
          </DialogHeader>

          {importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng số dòng</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {importResult.totalRows}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Thành công</p>
                  <p className="text-2xl font-bold text-green-600">
                    {importResult.successCount}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Lỗi</p>
                  <p className="text-2xl font-bold text-red-600">
                    {importResult.errorCount}
                  </p>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">
                    Chi tiết lỗi:
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertDescription>
                          <span className="font-semibold">
                            Dòng {error.rowIndex}
                          </span>{" "}
                          - <span className="font-medium">{error.field}</span>:{" "}
                          {error.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {importResult.errorCount === 0 && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    ✓ Import thành công tất cả dữ liệu!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
