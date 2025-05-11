import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import * as CustomerActions from './customer.actions';
import { CustomerDataService } from '../services/customer-data.service';
import { ICustomer } from '../models/customer';

@Injectable()
export class CustomerEffects {
  actions$ = inject(Actions);

  constructor(private readonly customerDataService: CustomerDataService) {}

  loadCustomers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.loadCustomers),
      switchMap(() =>
        this.customerDataService.customerData$.pipe(
          map((customers) =>
            CustomerActions.loadCustomersSuccess({ customers })
          ),
          catchError((error) =>
            of(CustomerActions.loadCustomersFailure({ error }))
          )
        )
      )
    )
  );

  updateCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.updateCustomer),
      map(({ customer }) => {
        // Create a new immutable copy of the customer with type assertion
        const updatedCustomer = { ...customer } as ICustomer;
        // Save to localStorage immediately
        const storedCustomers = localStorage.getItem('customerData');
        if (storedCustomers) {
          const customers = JSON.parse(storedCustomers) as ICustomer[];
          const updatedCustomers = customers.map((c) =>
            c['Account Number'] === customer['Account Number']
              ? updatedCustomer
              : c
          );
          localStorage.setItem(
            'customerData',
            JSON.stringify(updatedCustomers)
          );
        }
        return CustomerActions.updateCustomerSuccess({
          customer: updatedCustomer,
        });
      }),
      catchError((error) =>
        of(CustomerActions.updateCustomerFailure({ error }))
      )
    )
  );

  saveCustomers$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CustomerActions.saveCustomers),
        tap(({ customers }) => {
          localStorage.setItem('customerData', JSON.stringify(customers));
        })
      ),
    { dispatch: false }
  );
}
