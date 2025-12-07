import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

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

interface ImportProgress {
  isImporting: boolean;
  isMinimized: boolean;
  progress: number;
  stage: string;
  fileName: string;
  fileSize: number;
  rowCount: number;
  elapsedTime: number;
  startTime: number;
}

interface ImportContextType {
  importProgress: ImportProgress | null;
  setImportProgress: (progress: ImportProgress | null) => void;
  updateProgress: (updates: Partial<ImportProgress>) => void;
  importResult: ImportResult | null;
  setImportResult: (result: ImportResult | null) => void;
  showResultDialog: boolean;
  setShowResultDialog: (show: boolean) => void;
}

const ImportContext = createContext<ImportContextType | undefined>(undefined);

export function ImportProvider({ children }: { children: ReactNode }) {
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const updateProgress = (updates: Partial<ImportProgress>) => {
    setImportProgress((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <ImportContext.Provider 
      value={{ 
        importProgress, 
        setImportProgress, 
        updateProgress,
        importResult,
        setImportResult,
        showResultDialog,
        setShowResultDialog,
      }}
    >
      {children}
    </ImportContext.Provider>
  );
}

export function useImportProgress() {
  const context = useContext(ImportContext);
  if (context === undefined) {
    throw new Error('useImportProgress must be used within ImportProvider');
  }
  return context;
}
