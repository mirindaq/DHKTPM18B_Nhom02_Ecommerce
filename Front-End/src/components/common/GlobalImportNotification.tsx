import { useImportProgress } from '@/context/ImportContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GlobalImportNotification() {
  const { importProgress, updateProgress } = useImportProgress();
  const navigate = useNavigate();

  if (!importProgress?.isImporting || !importProgress?.isMinimized) {
    return null;
  }

  const handleClick = () => {
    // Navigate back to customers page and show dialog
    navigate('/admin/customers');
    updateProgress({ isMinimized: false });
  };

  return (
    <div 
      className="fixed bottom-4 right-4 bg-white shadow-2xl rounded-lg p-4 border-2 border-blue-500 z-50 cursor-pointer hover:shadow-xl transition-all hover:scale-105 animate-in slide-in-from-bottom"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-[220px]">
          <p className="font-semibold text-sm text-gray-900">Đang import dữ liệu</p>
          <p className="text-xs text-gray-600 mt-0.5">
            {importProgress.stage} • {importProgress.progress}%
          </p>
          {importProgress.fileName && (
            <p className="text-xs text-gray-500 mt-0.5">
              {importProgress.fileName}
            </p>
          )}
        </div>
        <Button 
          size="sm" 
          variant="ghost"
          className="text-xs h-7 px-2 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          Xem
        </Button>
      </div>
      <Progress value={importProgress.progress} className="h-1.5 mt-3" />
      <p className="text-xs text-gray-500 mt-2 text-right">
        {importProgress.elapsedTime}s đã trôi qua
      </p>
    </div>
  );
}
