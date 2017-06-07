import { NgModule }               from '@angular/core';
import { TopNavbarComponent }     from './top-navbar.component';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';

/* Modules */
import { RouterModule }           from '@angular/router';
import { DropdownModule }         from 'ngx-dropdown';
import { FormsModule, ReactiveFormsModule }            from '@angular/forms';
import { SqDatetimepickerModule } from 'ngx-eonasdan-datetimepicker';
import { CommonModule }           from '@angular/common';
import { FormFieldModule }        from '../shared/form-field';
import { SharedModule }           from '../shared';
import { CustomDropdownModule }   from '../shared/dropdown';
import { JobService } from '../../services/job';
import { ModalModule, TypeaheadModule } from 'ngx-bootstrap';
import { QuickContractComponent } from './quick-contract/quick-contract.component';
import { ClientNavbarComponent } from './client-navbar';
import { DropdownSelectModule } from '../shared/dropdown-select/dropdown-select.module';
import { QuickJobComponent } from './quick-job/quick-job.component';

@NgModule({
  providers: [
    JobService
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FormFieldModule,
    DropdownModule,
    SharedModule,
    CustomDropdownModule,
    DropdownSelectModule,
    ModalModule.forRoot(),
    TypeaheadModule.forRoot(),
    NgxMyDatePickerModule,
    SqDatetimepickerModule
  ],
  declarations: [
    TopNavbarComponent,
    QuickContractComponent,
    QuickJobComponent,
    ClientNavbarComponent
  ],
  exports: [
    TopNavbarComponent
  ],
  entryComponents: [
    QuickContractComponent,
    QuickJobComponent
  ]
})
export class TopNavbarModule {}
