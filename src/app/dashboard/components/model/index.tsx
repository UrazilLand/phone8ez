"use client";
import ModelSheet from './ModelSheet';
import { DataSet } from '@/types/dashboard';

interface ModelTabProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
}

export default function ModelTab({ dataSets, setDataSets }: ModelTabProps) {
  return <ModelSheet dataSets={dataSets} setDataSets={setDataSets} />;
} 