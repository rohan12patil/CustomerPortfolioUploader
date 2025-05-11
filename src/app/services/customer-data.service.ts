import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ICustomer } from '../models/customer';
import * as CustomerActions from '../store/customer.actions';
import * as CustomerSelectors from '../store/customer.selectors';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerDataService {
  customerData$!: Observable<ICustomer[]>;

  constructor(private store: Store) {
    this.customerData$ = this.store.select(CustomerSelectors.selectCustomers);
  }
  

  updateCustomer(customer: ICustomer) {
    this.store.dispatch(CustomerActions.updateCustomer({ customer }));
  }

  saveState(data: ICustomer[]) {
    this.store.dispatch(CustomerActions.saveCustomers({ customers: data }));
  }

  restoreState() {
    this.store.dispatch(CustomerActions.restoreCustomers());
  }
}
