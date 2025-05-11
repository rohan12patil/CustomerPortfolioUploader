import { Component, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { RowGroupingModule, AllEnterpriseModule } from 'ag-grid-enterprise';
import { ICustomer } from '../../models/customer';
import { CustomerDataService } from '../../services/customer-data.service';

// Register all Community features
ModuleRegistry.registerModules([AllEnterpriseModule]);

@Component({
  selector: 'app-table',
  imports: [AgGridAngular],
  standalone: true,
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit {
  rowData: ICustomer[] = [];
  private gridApi!: GridApi;
  gridOptions: GridOptions = {
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      enableRowGroup: true,
    },
  };

  colDefs: ColDef<ICustomer>[] = [
    {
      field: 'Customer Name',
      headerName: 'Customer Name',
    },
    {
      field: 'Account Number',
      headerName: 'Account Number',
    },
    {
      field: 'Account Type',
      headerName: 'Account Type',
    },
    {
      field: 'Balance',
      headerName: 'Balance',
      type: 'numericColumn',
      editable: true,
      valueSetter: (params) => {
        const value = parseFloat(params.newValue);
        if (value >= 0) {
          params.data['Balance'] = value;
          this.customerDataService.setCustomerData(this.rowData); // Save changes
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
      editable: true,
      cellEditor: 'agTextCellEditor',
      valueSetter: (params) => {
        const value = parseInt(params.newValue, 10);
        if (value >= 1 && value <= 5) {
          params.data['Risk Score'] = value;
          this.customerDataService.setCustomerData(this.rowData); // Save changes
          return true;
        }
        alert('Risk Score must be between 1 and 5.');
        return false;
      },
    },
    {
      field: 'Last Review Date',
      headerName: 'Last Review Date',
      editable: true,
      cellEditor: 'agDateCellEditor',
      cellEditorParams: {
        min: '2020-01-01',
        max: '2030-12-31',
        format: 'YYYY-MM-DD',
        dateFormat: 'DD-MM-YYYY',
      },
      valueSetter: (params) => {
        params.data['Last Review Date'] = params.newValue;
        this.customerDataService.setCustomerData(this.rowData); // Save changes
        return true;
      },
    },
  ];

  constructor(private customerDataService: CustomerDataService) {}

  ngOnInit(): void {
    this.customerDataService.customerData$.subscribe((data: ICustomer[]) => {
      if (this.gridApi) {
        // Use applyTransaction for updating data
        this.gridApi.applyTransaction({ update: data });
      }
      this.rowData = data;
    });
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    // Attempt to restore state when grid is ready
    const savedData = this.customerDataService.restoreState();
    if (savedData) {
      this.gridApi.applyTransaction({ update: savedData });
    }
  }

  saveState(): void {
    this.customerDataService.setCustomerData(this.rowData);
  }

  restoreState(): void {
    const savedData = this.customerDataService.restoreState();
    if (savedData) {
      this.gridApi.applyTransaction({ update: savedData });
    }
  }
}
