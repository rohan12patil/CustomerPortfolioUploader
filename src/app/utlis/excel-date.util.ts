import { addDays, isValid, parseISO } from 'date-fns';

export function getDateFromExcel(excelDate: number | string): Date | null {
  if (excelDate === null || excelDate === undefined || excelDate === '') {
    return null;
  }

  // If it's already a valid ISO string (e.g. "2025-05-11")
  if (typeof excelDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
    const parsedDate = parseISO(excelDate);
    console.log('Parsed Date ISO :',parsedDate);
    return isValid(parsedDate) ? parsedDate : null;
  }

  // Handle Excel serial number (either as number or string)
  const numericDate =
    typeof excelDate === 'string' ? parseFloat(excelDate) : excelDate;

  if (isNaN(numericDate)) return null;

  // Convert Excel serial to JS Date
  const jsDate = new Date((numericDate - 25569) * 86400 * 1000);
  console.log('parsed excel serial date',jsDate);
  return isValid(jsDate) ? jsDate : null;
}


export function getExcelSerialDate(date: Date): number {
  const EXCEL_EPOCH = new Date(1899, 11, 30); // Excel epoch (handles 1900 leap year bug)
  return (date.getTime() - EXCEL_EPOCH.getTime()) / (1000 * 60 * 60 * 24);
}