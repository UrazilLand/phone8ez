"use client";
import DataInputSheet from './DataInputSheet';
import { DataSet } from '@/types/dashboard';

interface DataInputTabProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
}

export default function DataInputTab({ dataSets, setDataSets }: DataInputTabProps) {
  return <DataInputSheet dataSets={dataSets} setDataSets={setDataSets} />;
} 