import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerDataService {
  private customerDataSubject = new BehaviorSubject<any[]>([]);
  customerData$ = this.customerDataSubject.asObservable();

  setCustomerData(data: any[]) {
    this.customerDataSubject.next(data);
  }

}
