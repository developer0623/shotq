import { NgModule }                 from '@angular/core';
import { ContactsAddComponent }     from './contacts-add.component';
import { FormsModule }              from '@angular/forms';
import { CommonModule }             from '@angular/common';
import { FormFieldModule }          from '../../shared/form-field';
import { FormFieldAddressModule }   from '../../shared/form-field-address';
import { FormNgSelectWrapModule }   from '../../shared/form-ng-select-wrap';
import { FilterSelectModule }       from '../../shared/filter-select';
import { MyDatePickerModule }       from 'mydatepicker';
import { DatePickerNewModule }      from '../../shared/datepicker-new';
import { TooltipModule }            from 'ngx-tooltip';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormFieldModule,
    FormFieldAddressModule,
    FormNgSelectWrapModule,
    FilterSelectModule,
    MyDatePickerModule,
    DatePickerNewModule,
    TooltipModule
  ],
  declarations: [ContactsAddComponent],
  exports: [ContactsAddComponent]
})
export class ContactsAddModule {}
