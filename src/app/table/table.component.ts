import { Component, Input, OnInit } from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import type { ColDef} from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { ICustomer } from '../interfaces/customer';
import { CustomerDataService } from '../customer-data.service';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);



@Component({
  selector: 'app-table',
  imports: [AgGridAngular],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit{
  @Input() rowData: ICustomer[] = [];

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef<ICustomer>[] = [
    { field: 'Customer Name', headerName: 'Customer Name' },
    { field: 'Account Number', headerName: 'Account Number' },
    { field: 'Account Type', headerName: 'Account Type' },
    { field: 'Balance', headerName: 'Balance', type: 'numericColumn' },
    { field: 'Risk Score', headerName: 'Risk Score', type: 'numericColumn' },
    { field: 'Last Review Date', headerName: 'Last Review Date' },
  ];

  constructor(private customerDataService: CustomerDataService){}

  ngOnInit(): void {
    // Subscribe to the customer data service to get the latest data
    this.customerDataService.customerData$.subscribe((data: ICustomer[]) => {
      this.rowData = data;
      console.log('Data from service:: ', this.rowData);
    });
  }

}
