import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CustomerState } from './customer.reducer';

export const selectCustomerState =
  createFeatureSelector<CustomerState>('customer');

export const selectCustomers = createSelector(
  selectCustomerState,
  (state: CustomerState) => state.customers
);

export const selectCustomerStatus = createSelector(
  selectCustomerState,
  (state: CustomerState) => state.status
);

export const selectCustomerError = createSelector(
  selectCustomerState,
  (state: CustomerState) => state.error
);
