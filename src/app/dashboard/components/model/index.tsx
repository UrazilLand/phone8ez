"use client";
import ModelSheet from './ModelSheet';
import { DataSet } from '@/types/dashboard';

interface ModelTabProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  publicData: any;
}

export default function ModelTab({ dataSets, setDataSets, publicData }: ModelTabProps) {
  return <ModelSheet dataSets={dataSets} setDataSets={setDataSets} publicData={publicData} />;
} 