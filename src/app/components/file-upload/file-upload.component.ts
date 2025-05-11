import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ICustomer } from '../../models/customer';
import { CustomerDataService } from '../../services/customer-data.service';
import * as CustomerActions from '../../store/customer.actions';
import { Store } from '@ngrx/store';
import { getDateFromExcel } from '../../utlis/excel-date.util';

@Component({
  selector: 'app-file-upload',
  imports: [],
  standalone: true,
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent {
  constructor(
    private customerDataService: CustomerDataService, 
    private store: Store
  ) {}

  customerData: ICustomer[] = [];

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length !== 1) {
      alert('Please upload a single file.');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target?.result) {
        alert('Error reading file.');
        return;
      }

      const arrayBuffer: ArrayBuffer = e.target.result as ArrayBuffer;
      const data = new Uint8Array(arrayBuffer);
      const binaryStr = Array.from(data)
        .map((byte) => String.fromCharCode(byte))
        .join('');
      const workbook: XLSX.WorkBook = XLSX.read(binaryStr, { type: 'binary' });

      // Assuming the first sheet contains the data
      const sheetName: string = workbook.SheetNames[0];
      const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

      // Convert sheet data to JSON and validate the structure
      const excelData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      
      // Validate and transform the data
      this.customerData = excelData.map((row: any) => {
        const rawDate = row['Last Review Date'];
        const parsedDate = getDateFromExcel(rawDate);
        return {
          'Customer Name': String(row['Customer Name'] || ''),
          'Account Number': String(row['Account Number'] || ''),
          'Account Type': String(row['Account Type'] || ''),
          Balance: Number(row['Balance'] || 0),
          'Risk Score': Number(row['Risk Score'] || 1),
          'Last Review Date': parsedDate
            ? parsedDate.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        };
      });
      

      console.log('Processed Excel data:', this.customerData);

      // Dispatch the processed data to the store
      this.store.dispatch(CustomerActions.saveCustomers({ customers: this.customerData }));
    };

    reader.readAsArrayBuffer(target.files[0]);
  }
}
