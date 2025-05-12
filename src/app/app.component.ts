import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as CustomerActions from './store/customer.actions';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { TableComponent } from './components/table/table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FileUploadComponent,
    TableComponent,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(private store: Store) {}
  title = 'Customer Portfolio Uploader';
  isDarkMode = false;

  ngOnInit() {
    // Restore any saved state when the app starts
    this.store.dispatch(CustomerActions.restoreCustomers());
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme');
  }
}
