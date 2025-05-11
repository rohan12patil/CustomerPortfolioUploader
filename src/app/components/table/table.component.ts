import { Component, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
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
        const value = params.newValue;
        if (value === null || value < 0) {
          alert('Balance must be a positive number');
          return false;
        }

        const newData: ICustomer = {
          'Customer Name': params.data['Customer Name'],
          'Account Number': params.data['Account Number'],
          'Account Type': params.data['Account Type'],
          Balance: value,
          'Risk Score': params.data['Risk Score'],
          'Last Review Date': params.data['Last Review Date'],
        };

        this.store.dispatch(
          CustomerActions.updateCustomer({ customer: newData })
        );
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
        const value = params.newValue;
        if (value === null || value < 1 || value > 5) {
          alert('Risk Score must be between 1 and 5');
          return false;
        }

        const newData: ICustomer = {
          'Customer Name': params.data['Customer Name'],
          'Account Number': params.data['Account Number'],
          'Account Type': params.data['Account Type'],
          Balance: params.data['Balance'],
          'Risk Score': value,
          'Last Review Date': params.data['Last Review Date'],
        };

        this.store.dispatch(
          CustomerActions.updateCustomer({ customer: newData })
        );
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
        // const date = getDateFromExcel(params.value);
        const date = getDateFromExcel(params.value);
        return date ? format(date, 'dd/MM/yyyy') : '';
        // return formatDate(date);
      },
      valueParser: (params) => {
        if (!params.newValue) return '';
        // Parse the date and convert to ISO string format
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
        // if (!params.newValue) {
        //   return false;
        // }
        // console.log(params)
        // params.data['Last Review Date'] = params.newValue;
        // const newData: ICustomer = {
        //   'Customer Name': params.data['Customer Name'],
        //   'Account Number': params.data['Account Number'],
        //   'Account Type': params.data['Account Type'],
        //   Balance: params.data['Balance'],
        //   'Risk Score': params.data['Risk Score'],
        //   'Last Review Date': params.newValue,
        // };

        // this.store.dispatch(
        //   CustomerActions.updateCustomer({ customer: newData })
        // );
        // return true;
        if (!params.newValue) return false;

        const updatedCustomer: ICustomer = {
          ...params.data, // clone the existing object
          'Last Review Date': params.newValue, // override the date
        };

        // Dispatch the update
        this.store.dispatch(
          CustomerActions.updateCustomer({ customer: updatedCustomer })
        );
        return true;
      },
      // valueGetter: (params) => {
      //   return params.data['Last Review Date']
      //     ? new Date(params.data['Last Review Date'])
      //     : null;
      // },
    },
  ];

  constructor(private store: Store) {}

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

  saveState(): void {
    if (this.gridApi) {
      const customers = this.rowData;
      this.store.dispatch(CustomerActions.saveCustomers({ customers }));
    }
  }

  restoreState(): void {
    this.store.dispatch(CustomerActions.restoreCustomers());
  }

  exportToExcel0(): void {
    if (this.gridApi) {
      this.gridApi.exportDataAsExcel({
        fileName: 'customers-export.xlsx', // Set file name
      });
    }
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
}
