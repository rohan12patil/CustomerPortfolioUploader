import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  ColDef,
  GridApi,
  GridOptions,
  ValueSetterParams,
} from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { ICustomer } from '../../models/customer';
import { addDays, format, isValid, parseISO } from 'date-fns';
import { Store } from '@ngrx/store';
import * as CustomerActions from '../../store/customer.actions';
import * as CustomerSelectors from '../../store/customer.selectors';
import { getDateFromExcel,getExcelSerialDate } from '../../utlis/excel-date.util';
import * as XLSX from 'xlsx';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';

ModuleRegistry.registerModules([AllEnterpriseModule]);


@Component({
  selector: 'app-table',
  imports: [AgGridAngular,CommonModule,MatButtonModule, MatSnackBarModule],
  standalone: true,
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit {
  rowData: ICustomer[] = [];
  private gridApi!: GridApi;
  modifiedRows = new Set<string>();
  unsavedCount = 0;

  gridOptions: GridOptions = {
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      enableRowGroup: true,
    },
    // Add getRowId function
    getRowId: (params) => params.data['Account Number'],
  };

  colDefs: ColDef[] = [
    { field: 'Customer Name', headerName: 'Customer Name' },
    { field: 'Account Number', headerName: 'Account Number' },
    { field: 'Account Type', headerName: 'Account Type' },
    {
      field: 'Balance',
      headerName: 'Balance',
      type: 'numericColumn',
      editable: true,
      cellStyle: { textAlign: 'right' },
      valueParser: (params) => {
        const parsed = parseFloat(params.newValue);
        return isNaN(parsed) ? null : parsed;
      },
      valueSetter: (params: ValueSetterParams) => {
        const newValue = parseFloat(params.newValue);
        if (isNaN(newValue) || newValue < 0) {
          alert('Balance must be a positive number');
          return false;
        }
        if (params.data['Balance'] === newValue) return false;

        const updatedRow = { ...params.data, Balance: newValue };
        const rowIndex = this.rowData.findIndex(
          (row) => row['Account Number'] === params.data['Account Number']
        );
        if (rowIndex !== -1) {
          this.rowData[rowIndex] = updatedRow;
        }
        this.gridApi.applyTransaction({ update: [updatedRow] });
        this.markRowAsModified(params.data['Account Number']);
        return true;
      },
    },
    {
      field: 'Risk Score',
      headerName: 'Risk Score',
      type: 'numericColumn',
      editable: true,
      cellStyle: { textAlign: 'right' },
      valueParser: (params) => {
        const parsed = parseInt(params.newValue, 10);
        return isNaN(parsed) ? null : parsed;
      },
      valueSetter: (params: ValueSetterParams) => {
        const newValue = parseInt(params.newValue, 10);
        if (isNaN(newValue) || newValue < 1 || newValue > 5) {
          alert('Risk Score must be between 1 and 5');
          return false;
        }
        if (params.data['Risk Score'] === newValue) return false;

        const updatedRow = { ...params.data, 'Risk Score': newValue };
        const rowIndex = this.rowData.findIndex(
          (row) => row['Account Number'] === params.data['Account Number']
        );
        if (rowIndex !== -1) {
          this.rowData[rowIndex] = updatedRow;
        }
        this.gridApi.applyTransaction({ update: [updatedRow] });
        this.markRowAsModified(params.data['Account Number']);
        return true;
      },
    },
    {
      field: 'Last Review Date',
      headerName: 'Last Review Date',
      editable: true,
      type: 'dateString',
      cellEditor: 'agDateStringCellEditor',
      cellEditorParams: {
        browserDatePicker: true,
      },
      valueFormatter: (params) => {
        if (!params.value) return '';
        const date = getDateFromExcel(params.value);
        return date ? format(date, 'dd/MM/yyyy') : '';
      },
      valueParser: (params) => {
        if (!params.newValue) return '';
        const date = new Date(params.newValue);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
      },
      filterParams: {
        browserDatePicker: true,
        comparator: (filterDate: string, cellValue: string) => {
          const filterDateObj = parseISO(filterDate);
          const cellDate = getDateFromExcel(cellValue);
          if (!isValid(filterDateObj) || !cellDate) return 0;
          return cellDate.getTime() - filterDateObj.getTime();
        },
      },
      valueSetter: (params) => {
        const newValue = params.newValue;
        if (!newValue) return false;

        const updatedRow = { ...params.data, 'Last Review Date': newValue };
        const rowIndex = this.rowData.findIndex(
          (row) => row['Account Number'] === params.data['Account Number']
        );
        if (rowIndex !== -1) {
          this.rowData[rowIndex] = updatedRow;
        }
        this.gridApi.applyTransaction({ update: [updatedRow] });
        this.markRowAsModified(params.data['Account Number']);
        return true;
      },
    },
  ];

  constructor(private store: Store, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.store
      .select(CustomerSelectors.selectCustomers)
      .subscribe((customers: ICustomer[]) => {
        if (customers && customers.length > 0) {
          this.rowData = [...customers];
          if (this.gridApi) {
            this.gridApi.applyTransaction({ update: this.rowData });
          }
        }
      });
  }

  onGridReady(params: { api: GridApi }): void {
    this.gridApi = params.api;
    this.store.dispatch(CustomerActions.loadCustomers());
  }

  onCellValueChanged(event: any): void {
    console.log('Cell value changed:', event);
    this.markRowAsModified(event.data['Account Number']);
  }

  saveState(): void {
    const modified = this.rowData.filter((customer) =>
      this.modifiedRows.has(customer['Account Number'])
    );

    if (modified.length > 0) {
      // Get the current state from the store
      this.store
        .select(CustomerSelectors.selectCustomers)
        .pipe(take(1))
        .subscribe((currentCustomers) => {
          // Create new array with modified rows merged into current state
          const updatedCustomers = currentCustomers.map((customer) => {
            const modifiedCustomer = modified.find(
              (m) => m['Account Number'] === customer['Account Number']
            );
            return modifiedCustomer || customer;
          });

          // Dispatch save action with all customers
          this.store.dispatch(
            CustomerActions.saveCustomers({ customers: updatedCustomers })
          );

          this.modifiedRows.clear();
          this.unsavedCount = 0;
          this.snackBar.open('Changes saved successfully!', 'Close', {
            duration: 3000,
          });
        });
    } else {
      this.snackBar.open('No unsaved changes to save.', 'Close', {
        duration: 3000,
      });
    }
  }

  restoreState(): void {
    this.store.dispatch(CustomerActions.restoreCustomers());
  }

  exportToExcel(): void {
    const customers = this.rowData;
    const dataToExport = customers.map((customer) => ({
      ...customer,
      'Last Review Date': customer['Last Review Date']
        ? getExcelSerialDate(new Date(customer['Last Review Date']))
        : '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, 'customers_export.xlsx');
  }

  private markRowAsModified(accountNumber: string): void {
    this.modifiedRows.add(accountNumber);
    this.unsavedCount = this.modifiedRows.size;
  }

  submitChanges(): void {
    const modified = this.rowData.filter((customer) =>
      this.modifiedRows.has(customer['Account Number'])
    );

    this.simulateApiCall(modified)
      .then(() => {
        this.modifiedRows.clear();
        this.unsavedCount = 0;
        this.snackBar.open('Changes submitted successfully!', 'Close', {
          duration: 3000,
        });
      })
      .catch((err) => {
        this.snackBar.open(`Failed to submit changes: ${err}`, 'Close', {
          duration: 3000,
        });
      });
  }

  simulateApiCall(payload: ICustomer[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.2 ? resolve(true) : reject('API error');
      }, 1000);
    });
  }
}
