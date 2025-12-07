import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileSpreadsheet, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";

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
  onImport: (file: File) => Promise<{ data: { jobId: string } }>;
  onSubscribeProgress: (
    jobId: string,
    onProgress: (progress: any) => void,
    onComplete: (result: any) => void,
    onError: (error: string) => void
  ) => EventSource;
  onExport: () => Promise<Blob>;
  onImportSuccess?: () => void;
  templateFileName?: string;
  exportFileName?: string;
}

export default function ExcelActions({
  onDownloadTemplate,
  onImport,
  onSubscribeProgress,
  onExport,
  onImportSuccess,
  templateFileName = "template.xlsx",
  exportFileName = "export.xlsx",
}: ExcelActionsProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFileInfo, setSelectedFileInfo] = useState<{
    name: string;
    size: number;
    rowCount: number;
  } | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStage, setImportStage] = useState<string>("");
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [actualRowCount, setActualRowCount] = useState<number>(0);
  const [processedRecords, setProcessedRecords] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);
  const startTimeRef = useRef<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);

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
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err?.response?.data?.message || "Không thể tải template");
    }
  };

  const estimateRowCount = (fileSize: number): number => {
    // Based on real data:
    // 42 KB = 1038 rows → ~40.5 bytes/row
    // 65 KB = 2189 rows → ~29.7 bytes/row
    // Average: ~35 bytes/row for template files
    
    // Excel template files are very compact (minimal formatting)
    // Using 30-40 bytes per row for better accuracy
    
    if (fileSize < 20000) {
      // Very small file: ~35 bytes per row
      return Math.max(Math.floor(fileSize / 35), 1);
    } else if (fileSize < 100000) {
      // Small to medium file: ~32 bytes per row
      // (42KB/1038 = 40.5, 65KB/2189 = 29.7, avg ~35, use 32 for safety)
      return Math.floor(fileSize / 32);
    } else if (fileSize < 500000) {
      // Large file: ~30 bytes per row
      return Math.floor(fileSize / 30);
    } else {
      // Very large file: ~28 bytes per row (more data, less overhead ratio)
      return Math.floor(fileSize / 28);
    }
  };

  const calculateEstimatedTime = (rowCount: number): number => {
    // Based on real data:
    // 1000 rows = 5s → 200 rows/second
    // 2000 rows = 10s → 200 rows/second
    // Backend processes ~200 rows per second with chunking
    
    // Add 20% buffer for safety (network, validation, etc.)
    const baseTime = rowCount / 200;
    const bufferTime = baseTime * 0.2;
    return Math.ceil(baseTime + bufferTime);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
      return;
    }

    // Show loading toast while estimating
    const loadingToast = toast.loading("Đang phân tích file...");

    try {
      const rowCount = estimateRowCount(file.size);
      const estimatedSeconds = calculateEstimatedTime(rowCount);

      setSelectedFileInfo({
        name: file.name,
        size: file.size,
        rowCount: rowCount,
      });
      setEstimatedTime(estimatedSeconds);
      pendingFileRef.current = file;
      
      toast.dismiss(loadingToast);
      setShowPreviewDialog(true);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Không thể phân tích file");
      console.error("File analysis error:", error);
    }
  };

  const handleConfirmImport = async () => {
    const file = pendingFileRef.current;
    if (!file) return;

    setShowPreviewDialog(false);
    setIsImporting(true);
    setImportProgress(0);
    setImportStage("Đang đọc file...");
    startTimeRef.current = Date.now();

    try {
      // Simulate progress stages
      const progressInterval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      // Stage 1: Reading file (0-20%)
      setImportProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setImportProgress(20);

      // Stage 2: Validating (20-40%)
      setImportStage("Đang validate dữ liệu...");
      setImportProgress(30);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setImportProgress(40);

      // Stage 3: Importing (40-90%)
      setImportStage("Đang lưu vào database...");
      setImportProgress(50);

      const response = await onImport(file);
      
      clearInterval(progressInterval);
      
      setImportProgress(90);
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Stage 4: Complete (90-100%)
      setImportStage("Hoàn tất!");
      setImportProgress(100);

      const result = response.data;
      setImportResult(result);

      // Close loading dialog first
      setIsImporting(false);
      setImportStage("");
      
      // Wait a bit then show result dialog
      await new Promise((resolve) => setTimeout(resolve, 300));
      setShowResultDialog(true);

      if (result.errorCount === 0) {
        toast.success(`🎉 Import thành công ${result.successCount} bản ghi`);
        onImportSuccess?.();
      } else {
        toast.warning(
          `Import hoàn tất: ${result.successCount} thành công, ${result.errorCount} lỗi`
        );
      }
    } catch (error) {
      console.error("Import error:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || "Import thất bại";
      toast.error(errorMessage);
      setImportProgress(0);
      setIsImporting(false);
      setImportStage("");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      pendingFileRef.current = null;
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
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err?.response?.data?.message || "Export thất bại");
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
          disabled={isImporting || isExporting}
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang import...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting || isImporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang export...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </>
          )}
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận import</DialogTitle>
            <DialogDescription>
              Kiểm tra thông tin file trước khi import
            </DialogDescription>
          </DialogHeader>

          {selectedFileInfo && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {selectedFileInfo.name}
                  </span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Kích thước:</span>
                    <span className="font-medium">
                      {(selectedFileInfo.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ước tính số dòng:</span>
                    <span className="font-medium">
                      ~{selectedFileInfo.rowCount.toLocaleString()} dòng
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời gian ước tính:</span>
                    <span className="font-medium">
                      ~{estimatedTime < 60 
                        ? `${estimatedTime} giây` 
                        : `${Math.floor(estimatedTime / 60)} phút ${estimatedTime % 60} giây`
                      }
                    </span>
                  </div>
                </div>
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Vui lòng không đóng trang trong quá trình import
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPreviewDialog(false);
                pendingFileRef.current = null;
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleConfirmImport}>
              Xác nhận import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading Dialog */}
      <Dialog open={isImporting} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              Đang import dữ liệu
            </DialogTitle>
            <DialogDescription>
              Vui lòng đợi, quá trình này có thể mất vài phút
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{importStage}</span>
                <span className="font-medium">{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>

            {selectedFileInfo && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">File:</span>
                  <span className="font-medium">{selectedFileInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số dòng ước tính:</span>
                  <span className="font-medium">~{selectedFileInfo.rowCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian đã trôi qua:</span>
                  <span className="font-medium">{elapsedTime}s</span>
                </div>
              </div>
            )}

            <Alert>
              <AlertDescription className="text-xs">
                ⚡ Không đóng trang này cho đến khi hoàn tất
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}

      <Dialog 
        open={showResultDialog} 
        onOpenChange={(open) => {
          setShowResultDialog(open);
          if (!open) {
            setElapsedTime(0);
            setImportResult(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {importResult?.errorCount === 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Import thành công!
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-orange-600" />
                  Import hoàn tất với lỗi
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Chi tiết quá trình import dữ liệu từ file Excel
            </DialogDescription>
          </DialogHeader>

          {importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Tổng số dòng</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {importResult.totalRows}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Thành công</p>
                  <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-5 w-5" />
                    {importResult.successCount}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-600 mb-1">Lỗi</p>
                  <p className="text-2xl font-bold text-red-600 flex items-center gap-1">
                    <XCircle className="h-5 w-5" />
                    {importResult.errorCount}
                  </p>
                </div>
              </div>

              {elapsedTime > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian thực hiện:</span>
                    <span className="font-medium">{elapsedTime} giây</span>
                  </div>
                </div>
              )}

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
