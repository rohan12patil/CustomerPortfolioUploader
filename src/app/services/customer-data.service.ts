import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ICustomer } from '../models/customer';

@Injectable({
  providedIn: 'root',
})
export class CustomerDataService {
  private customerDataSubject = new BehaviorSubject<ICustomer[]>([]);
  customerData$ = this.customerDataSubject.asObservable();

  setCustomerData(data: ICustomer[]) {
    this.customerDataSubject.next(data);
    this.saveState(data);
  }

  saveState(data: ICustomer[]) {
    localStorage.setItem('customerData', JSON.stringify(data));
  }

  restoreState(): ICustomer[] | null {
    const savedData = localStorage.getItem('customerData');
    if (savedData) {
      const parsedData = JSON.parse(savedData) as ICustomer[];
      this.customerDataSubject.next(parsedData);
      return parsedData;
    }
    return null;
  }
}
