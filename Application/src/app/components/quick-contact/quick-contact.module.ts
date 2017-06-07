import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { QuickContactComponent } from './quick-contact.component';
import { FormsModule } from '@angular/forms';
import { FormFieldModule } from '../shared/form-field';
import { FormFieldAddressModule } from '../shared/form-field-address';
import { FormNgSelectWrapModule } from '../shared/form-ng-select-wrap';
import { FilterSelectModule } from '../shared/filter-select';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormFieldModule,
    FormFieldAddressModule,
    FormNgSelectWrapModule,
    FilterSelectModule
  ],
  declarations: [QuickContactComponent],
  exports: [QuickContactComponent]
})
export class QuickContactModule {}
