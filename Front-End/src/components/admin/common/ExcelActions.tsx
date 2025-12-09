import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileSpreadsheet, Loader2, Clock } from "lucide-react";
import { useImportProgress } from "@/context/ImportContext";
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

interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ rowIndex: number; field: string; message: string }>;
  message: string;
}

interface ExcelActionsProps {
  onDownloadTemplate?: () => Promise<Blob>;
  onImport?: (file: File) => Promise<{ data: ImportResult }>;
  onExport?: () => Promise<Blob>;
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
  const { 
    importProgress: globalProgress, 
    setImportProgress, 
    updateProgress,
    setImportResult,
    setShowResultDialog,
  } = useImportProgress();
  
  const [isExporting, setIsExporting] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedFileInfo, setSelectedFileInfo] = useState<{
    name: string;
    size: number;
    rowCount: number;
  } | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);
  const elapsedIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Local shortcuts for easier access
  const isImporting = globalProgress?.isImporting || false;
  const isMinimized = globalProgress?.isMinimized || false;
  const importProgressValue = globalProgress?.progress || 0;
  const importStage = globalProgress?.stage || "";
  const elapsedTime = globalProgress?.elapsedTime || 0;

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
    if (!onDownloadTemplate) return;
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
    if (!file || !onImport) return;

    setShowPreviewDialog(false);
    
    const startTime = Date.now();
    
    // Initialize global import state
    setImportProgress({
      isImporting: true,
      isMinimized: false,
      progress: 0,
      stage: "Đang đọc file...",
      fileName: selectedFileInfo?.name || file.name,
      fileSize: selectedFileInfo?.size || file.size,
      rowCount: selectedFileInfo?.rowCount || 0,
      elapsedTime: 0,
      startTime,
    });

    try {
      // Update elapsed time every second
      elapsedIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        updateProgress({ elapsedTime: elapsed });
      }, 1000);

      // Stage 1: Reading file (0-20%)
      updateProgress({ progress: 10 });
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateProgress({ progress: 20 });

      // Stage 2: Validating (20-40%)
      updateProgress({ stage: "Đang validate dữ liệu...", progress: 30 });
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateProgress({ progress: 40 });

      // Stage 3: Importing (40-90%)
      updateProgress({ stage: "Đang lưu vào database...", progress: 50 });

      // Simulate progress while waiting for API
      let currentProgress = 50;
      const progressSimulator = setInterval(() => {
        currentProgress += 2; // Increase 2% every 500ms
        if (currentProgress < 85) {
          updateProgress({ progress: currentProgress });
        }
      }, 500);

      const response = await onImport(file);
      
      // Stop simulators
      clearInterval(progressSimulator);
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
      }
      
      updateProgress({ progress: 90 });
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Stage 4: Complete (90-100%)
      updateProgress({ stage: "Hoàn tất!", progress: 100 });

      const result = response.data;
      
      // Set result to global state
      setImportResult(result);

      // Clear global import progress
      setImportProgress(null);
      
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
      
      // Clear global import state on error
      setImportProgress(null);
    } finally {
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      pendingFileRef.current = null;
    }
  };

  const handleExport = async () => {
    if (!onExport) return;
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
        {onDownloadTemplate && (
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleDownloadTemplate}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Tải Template
          </Button>
        )}

        {onImport && (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting || isExporting}
              className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 disabled:opacity-50"
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
          </>
        )}

        {onExport && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleExport}
            disabled={isExporting || isImporting}
            className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50"
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
        )}
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
      <Dialog 
        open={isImporting && !isMinimized} 
        onOpenChange={(open) => {
          if (!open) updateProgress({ isMinimized: true });
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-red-600" />
              Đang import dữ liệu
            </DialogTitle>
            <DialogDescription>
              Bạn có thể thu nhỏ cửa sổ này và tiếp tục làm việc
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{importStage}</span>
                <span className="font-medium">{importProgressValue}%</span>
              </div>
              <Progress value={importProgressValue} className="h-2" />
            </div>

            {globalProgress && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">File:</span>
                  <span className="font-medium">{globalProgress.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số dòng ước tính:</span>
                  <span className="font-medium">~{globalProgress.rowCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian đã trôi qua:</span>
                  <span className="font-medium">{elapsedTime}s</span>
                </div>
              </div>
            )}

            <Alert>
              <AlertDescription className="text-xs">
                💡 Bạn có thể thu nhỏ và làm việc khác trong khi import
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => updateProgress({ isMinimized: true })}
            >
              Thu nhỏ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Local Minimized Notification - Only show on current page */}
      {isImporting && isMinimized && (
        <div 
          className="fixed bottom-4 right-4 bg-white shadow-2xl rounded-lg p-4 border-2 border-blue-500 z-50 cursor-pointer hover:shadow-xl transition-all hover:scale-105 animate-in slide-in-from-bottom"
          onClick={() => updateProgress({ isMinimized: false })}
        >
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-red-600 flex-shrink-0" />
            <div className="flex-1 min-w-[220px]">
              <p className="font-semibold text-sm text-gray-900">Đang import dữ liệu</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {importStage} • {importProgressValue}%
              </p>
              {globalProgress && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {globalProgress.fileName}
                </p>
              )}
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              className="text-xs h-7 px-2 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                updateProgress({ isMinimized: false });
              }}
            >
              Xem
            </Button>
          </div>
          <Progress value={importProgressValue} className="h-1.5 mt-3" />
          <p className="text-xs text-gray-500 mt-2 text-right">
            {elapsedTime}s đã trôi qua
          </p>
        </div>
      )}

      {/* Result Dialog is now global - see GlobalImportResultDialog component */}
    </>
  );
}
