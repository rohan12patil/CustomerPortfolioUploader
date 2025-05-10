import { Component, Input, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { ICustomer } from '../interfaces/customer';
import { CustomerDataService } from '../customer-data.service';
import { RowGroupingModule, AllEnterpriseModule } from 'ag-grid-enterprise';

// Register all Community features
ModuleRegistry.registerModules([AllEnterpriseModule]);

@Component({
  selector: 'app-table',
  imports: [AgGridAngular],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit {
  @Input() rowData: ICustomer[] = [];

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef<ICustomer>[] = [
    {
      field: 'Customer Name',
      headerName: 'Customer Name',
      sortable: true,
      filter: true,
      enableRowGroup: true,
    },
    {
      field: 'Account Number',
      headerName: 'Account Number',
      sortable: true,
      filter: true,
      enableRowGroup: true,
    },
    {
      field: 'Account Type',
      headerName: 'Account Type',
      sortable: true,
      filter: true,
      enableRowGroup: true,
    },
    {
      field: 'Balance',
      headerName: 'Balance',
      type: 'numericColumn',
      sortable: true,
      filter: true,
      enableRowGroup: true,
      editable: true,
      valueSetter: (params) => {
        const value = parseFloat(params.newValue);
        if (value >= 0) {
          params.data['Balance'] = value;
          return true;
        }
        alert('Balance must be greater than or equal to 0.');
        return false;
      },
    },
    {
      field: 'Risk Score',
      headerName: 'Risk Score',
      type: 'numericColumn',
      sortable: true,
      filter: true,
      enableRowGroup: true,
      editable: true,
      cellEditor: 'agTextCellEditor',
      valueSetter: (params) => {
        const value = parseInt(params.newValue, 10);
        if (value >= 1 && value <= 5) {
          params.data['Risk Score'] = value;
          return true;
        }
        alert('Risk Score must be between 1 and 5.');
        return false;
      },
    },
    {
      field: 'Last Review Date',
      headerName: 'Last Review Date',
      sortable: true,
      filter: true,
      enableRowGroup: true,
      cellEditor: 'agDateCellEditor',
      cellEditorParams: {
        min:'2020-01-01',
        max:'2030-12-31',
        format: 'YYYY-MM-DD',
        dateFormat: 'DD-MM-YYYY',
      },
    },
  ];

  constructor(private customerDataService: CustomerDataService) {}

  ngOnInit(): void {
    // Subscribe to the customer data service to get the latest data
    this.customerDataService.customerData$.subscribe((data: ICustomer[]) => {
      this.rowData = data;
      console.log('Data from service:: ', this.rowData);
    });
  }
}
