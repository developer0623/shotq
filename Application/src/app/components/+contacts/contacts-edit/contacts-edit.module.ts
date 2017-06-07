import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ContactsEditComponent } from './contacts-edit.component';
import { CommonModule }                 from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormFieldModule } from '../../shared/form-field';
import { FormFieldAddressModule } from '../../shared/form-field-address';
import { FormNgSelectWrapModule } from '../../shared/form-ng-select-wrap';
import { FilterSelectModule } from '../../shared/filter-select';
import { MyDatePickerModule } from 'mydatepicker';
import { DatePickerNewModule } from '../../shared/datepicker-new';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormFieldModule,
    FormFieldAddressModule,
    FormNgSelectWrapModule,
    FilterSelectModule,
    MyDatePickerModule,
    DatePickerNewModule
  ],
  declarations: [ContactsEditComponent],
  exports: [ContactsEditComponent]
})
export class ContactsEditModule {}
