"use client";

import { DataSet } from '@/types/dashboard';
import IntegratedHeader from './IntegratedHeader';

interface IntegratedSheetProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  publicData: any;
}

export default function IntegratedSheet({ dataSets, setDataSets, publicData }: IntegratedSheetProps) {
  return (
    <div className="flex flex-col w-full h-full">
      <IntegratedHeader dataSets={dataSets} setDataSets={setDataSets} publicData={publicData} />
    </div>
  );
} 