import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ICustomer } from '../interfaces/customer';
import { CustomerDataService } from '../customer-data.service';

@Component({
  selector: 'app-file-upload',
  imports: [],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
  constructor(private customerDataService: CustomerDataService) { }

  rowData: ICustomer[] = [];
  onFileChange(event:any):void{
    const target= event.target as HTMLInputElement;
    if (!target.files || target.files.length !== 1) {
      alert('Please upload a single file.');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const arrayBuffer: ArrayBuffer = e.target?.result as ArrayBuffer;
      const data = new Uint8Array(arrayBuffer);
      const binaryStr = Array.from(data)
        .map((byte) => String.fromCharCode(byte))
        .join('');
      const workbook: XLSX.WorkBook = XLSX.read(binaryStr, { type: 'binary' });

      // Assuming the first sheet contains the data
      const sheetName: string = workbook.SheetNames[0];
      const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

      // Convert sheet data to JSON
      this.rowData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      console.log('Data from reading file:: ', this.rowData);

      // Share data via service
      this.customerDataService.setCustomerData(this.rowData); 
    };

    reader.readAsArrayBuffer(target.files[0]);

  }
}
