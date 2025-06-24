"use client";
import ModelSheet from './ModelSheet';
import { DataSet } from '@/types/dashboard';

interface ModelTabProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  publicData: any;
}

export default function ModelTab({ dataSets, setDataSets, publicData }: ModelTabProps) {
  return (
    <div className="flex justify-center w-full">
      <div style={{ minWidth: '1500px', maxWidth: '1500px' }}>
        <ModelSheet dataSets={dataSets} setDataSets={setDataSets} publicData={publicData} />
      </div>
    </div>
  );
} 