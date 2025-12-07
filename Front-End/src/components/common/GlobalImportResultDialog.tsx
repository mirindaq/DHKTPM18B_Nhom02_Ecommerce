import { useImportProgress } from '@/context/ImportContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function GlobalImportResultDialog() {
  const { importResult, showResultDialog, setShowResultDialog, setImportResult } = useImportProgress();

  if (!importResult) return null;

  return (
    <Dialog 
      open={showResultDialog} 
      onOpenChange={(open) => {
        setShowResultDialog(open);
        if (!open) {
          setImportResult(null);
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {importResult.errorCount === 0 ? (
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

        <DialogFooter>
          <Button onClick={() => setShowResultDialog(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
