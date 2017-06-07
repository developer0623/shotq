import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { DropdownSelectModule } from '../dropdown-select/dropdown-select.module';

import { ContactsUiService } from './contacts-ui.service';
import { ContactDialogComponent } from './contact-dialog.component';

@NgModule({
  imports: [
    CommonModule, DropdownSelectModule, FormsModule, NgxMyDatePickerModule,
    ReactiveFormsModule
  ],
  exports: [FormsModule],
  declarations: [ContactDialogComponent],
  providers: [ContactsUiService],
})
export class ContactsUiModule {
}
