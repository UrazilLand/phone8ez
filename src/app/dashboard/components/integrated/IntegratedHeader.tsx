"use client";

import { Button } from '@/components/ui/button';
import { DataSet } from '@/types/dashboard';
import { Upload, Download, Database, RefreshCw } from 'lucide-react';

interface IntegratedHeaderProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  publicData: any;
}

export default function IntegratedHeader({ dataSets, setDataSets, publicData }: IntegratedHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          업로드
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          다운로드
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          저장
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          새로고침
        </Button>
      </div>
    </div>
  );
} 