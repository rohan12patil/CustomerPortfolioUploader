import { createReducer, on } from '@ngrx/store';
import { ICustomer } from '../models/customer';
import * as CustomerActions from './customer.actions';

export interface CustomerState {
  customers: ICustomer[];
  error: any;
  status: 'pending' | 'loading' | 'error' | 'success';
}

export const initialState: CustomerState = {
  customers: [],
  error: null,
  status: 'pending',
};

export const customerReducer = createReducer(
  initialState,

  on(CustomerActions.loadCustomers, (state) => ({
    ...state,
    status: 'loading' as const,
  })),

  on(CustomerActions.loadCustomersSuccess, (state, { customers }) => ({
    ...state,
    customers,
    error: null,
    status: 'success' as const,
  })),

  on(CustomerActions.loadCustomersFailure, (state, { error }) => ({
    ...state,
    error,
    status: 'error' as const,
  })),

  on(CustomerActions.updateCustomer, (state) => ({
    ...state,
    status: 'loading' as const,
  })),

  on(CustomerActions.updateCustomerSuccess, (state, { customer }) => ({
    ...state,
    customers: state.customers.map((c) =>
      c['Account Number'] === customer['Account Number'] ? customer : c
    ),
    status: 'success' as const,
  })),

  on(CustomerActions.saveCustomers, (state, { customers }) => ({
    ...state,
    customers,
    status: 'success' as const,
  })),

  on(CustomerActions.restoreCustomers, (state) => {
    const savedData = localStorage.getItem('customerData');
    if (savedData) {
      const customers = JSON.parse(savedData);
      return {
        ...state,
        customers,
        status: 'success' as const,
      };
    }
    return state;
  })
);
