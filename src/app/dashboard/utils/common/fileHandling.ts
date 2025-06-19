import { DataSet } from '@/types/dashboard';

export function exportToJson(data: DataSet): string {
  return JSON.stringify(data, null, 2);
}

export function importFromJson(jsonString: string): DataSet {
  try {
    const data = JSON.parse(jsonString);
    if (!validateDataSet(data)) {
      throw new Error('Invalid data format');
    }
    return data;
  } catch (error) {
    throw new Error('Failed to parse JSON data');
  }
}

function validateDataSet(data: any): data is DataSet {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.createdAt === 'string' &&
    data.data &&
    Array.isArray(data.data.sheetData)
  );
}

export function getDownloadFileName(prefix: string = 'phone8ez'): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0];
  return `${prefix}_${timestamp}.json`;
} 