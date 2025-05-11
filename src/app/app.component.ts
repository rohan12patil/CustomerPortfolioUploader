import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { TableComponent } from './table/table.component';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FileUploadComponent, TableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'customer-portfolio-uploader';
}
