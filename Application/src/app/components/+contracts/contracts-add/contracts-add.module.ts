import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormFieldModule } from '../../shared/form-field';
import { FormNgSelectWrapModule } from '../../shared/form-ng-select-wrap';
import { ContractsAddComponent } from './contracts-add.component';
import { ChooseContactModule } from '../../shared/choose-contact/choose-contact.module';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'angular2-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'angular2-perfect-scrollbar';
import { DropdownSelectModule } from '../../shared/dropdown-select/dropdown-select.module';
import { CommonModule }                    from '@angular/common';

const PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  // suppressScrollX: true
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormFieldModule,
    FormNgSelectWrapModule,
    RouterModule,
    DropdownSelectModule,
    ReactiveFormsModule, ChooseContactModule,
        PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG),

  ],
  declarations: [ContractsAddComponent],
  exports: [ContractsAddComponent]
})
export class ContractsAddModule {
}
