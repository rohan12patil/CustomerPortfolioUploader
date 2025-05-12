import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatToolbarModule } from '@angular/material/toolbar';
import * as CustomerActions from './store/customer.actions';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { TableComponent } from './components/table/table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FileUploadComponent, TableComponent, MatToolbarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss', 
})
export class AppComponent implements OnInit {
  constructor(private store: Store) {}
  title = 'Customer Portfolio Uploader';

  ngOnInit() {
    // Try to restore any saved state when the app starts
    this.store.dispatch(CustomerActions.restoreCustomers());
  }
}
