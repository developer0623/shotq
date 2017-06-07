import { NgModule } from '@angular/core';
/* Components */
import { AccountComponent } from './account/';
import { CommunicationComponent } from './communication/';
import { InvoicesComponent } from './invoices/';
import { OverviewComponent } from './overview/';
import { ClientPageComponent, JobResolve } from './client-page';
/* Modules */
import { RouterModule } from '@angular/router';
import { DropdownModule } from 'ngx-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared';
import { ModalModule, TooltipModule } from 'ngx-bootstrap';
import { PipesModule } from '../../pipes/pipes.module';
import { CustomDropdownModule } from '../shared/dropdown';
import { ClientAccessAuthGuard } from '../../services/access';
import { JobService } from '../../services/job';
import { SentCorrespondenceService } from '../../services/sent-correspondence';
import { CommonModule } from '@angular/common';
/* Routes */
import { CLIENT_ACCESS_ROUTES } from './client-access.routes';
import { ClientUserEditComponent } from './account/client-user-edit';
import { JobsModule } from 'app/components/+jobs';
import { ScheduledPaymentsComponent } from './invoices/scheduled-payments/scheduled-payments.component';
import { AppliedPaymentsComponent } from './invoices/applied-payments/applied-payments.component';

@NgModule({
  providers: [
    JobService,
    SentCorrespondenceService,
    JobResolve,
    ClientAccessAuthGuard
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(CLIENT_ACCESS_ROUTES),
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    JobsModule,
    SharedModule,
    TooltipModule.forRoot(),
    PipesModule,
    CustomDropdownModule
  ],
  declarations: [
    AccountComponent,
    CommunicationComponent,
    InvoicesComponent,
    OverviewComponent,
    ScheduledPaymentsComponent,
    AppliedPaymentsComponent,
    ClientPageComponent,
    ClientUserEditComponent
  ],
  exports: [
    AccountComponent,
    CommunicationComponent,
    InvoicesComponent,
    OverviewComponent
  ],
  entryComponents: [
    ClientUserEditComponent
  ]
})
export class ClientAccessModule {
}
