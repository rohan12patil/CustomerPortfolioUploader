import { createAction, props } from '@ngrx/store';
import { ICustomer } from '../models/customer';

export const loadCustomers = createAction('[Customer] Load Customers');

export const loadCustomersSuccess = createAction(
  '[Customer] Load Customers Success',
  props<{ customers: ICustomer[] }>()
);

export const loadCustomersFailure = createAction(
  '[Customer] Load Customers Failure',
  props<{ error: any }>()
);

export const updateCustomer = createAction(
  '[Customer] Update Customer',
  props<{ customer: ICustomer }>()
);

export const updateCustomerSuccess = createAction(
  '[Customer] Update Customer Success',
  props<{ customer: ICustomer }>()
);

export const updateCustomerFailure = createAction(
  '[Customer] Update Customer Failure',
  props<{ error: any }>()
);

export const saveCustomers = createAction(
  '[Customer] Save Customers',
  props<{ customers: ICustomer[] }>()
);

export const restoreCustomers = createAction('[Customer] Restore Customers');
