import { NgModule }                     from '@angular/core';
/* Components */
import { JobsComponent }                from './jobs/jobs.component';
import { JobsListHeaderComponent }      from './jobs/jobs-list-header/jobs-list-header.component';
import { JobsEditComponent }            from './jobs-edit/jobs-edit.component';
import { JobInfoComponent }             from './jobs-info/job-info.component';
import { JobHeaderComponent }           from './jobs-info/job-header/job-header.component';
import { InvoicesComponent }            from './jobs-info/invoices/invoices.component';
import { JobContactListDialogComponent } from './jobs-info/contact-list-dialog/contact-list-dialog.component';
import { JobTopContactListComponent }   from './jobs-info/top-contact-list/jobs-info-top-contact-list.component';
import { JOB_EVENTS_EDITOR_COMPONENTS } from './jobs-info/job-events-editor';

/* Modules */
import { CommonModule }                 from '@angular/common';
import { RouterModule }                 from '@angular/router';
import { DropdownModule }               from 'ngx-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SqDatetimepickerModule } from 'ngx-eonasdan-datetimepicker';
import { SharedModule }                 from '../shared';
import { PreventClickModule } from '../../directives/prevent-click';
import { DropdownSelectModule } from '../shared/dropdown-select';
import { FormFieldModule }              from '../shared/form-field';
import { FormFieldAddressModule }       from '../shared/form-field-address';
import { FormFieldTextareaModule }      from '../shared/form-field-textarea';
import { FormNgSelectWrapModule }       from '../shared/form-ng-select-wrap';
import { AnimateDivModule }             from '../shared/animate-div';
import { JobsContactAddModule }         from './jobs-contact-add/jobs-contact-add.module';
import { MaterialTabModule }            from '../shared/material/tab';
import { EditableLabelModule }          from '../shared/editable-label';
import { PipesModule }                  from '../../pipes/pipes.module';
import { CustomDropdownModule }         from '../shared/dropdown';
import { ActivityFeedModule }           from '../shared/activity-feed';
import { EventGroupService } from '../../services/event-group';
import { EventService } from '../../services/event';
import {
  AccordionModule,
  ModalModule,
  PaginationModule,
  TabsModule,
  TooltipModule,
  TypeaheadModule,
  ButtonsModule
}                                       from 'ngx-bootstrap';

import { JOBS_ROUTES }                  from './jobs.routes';
import { ProposalsModule } from '../+proposals/proposals.module';
import { JobProposalResolver } from '../+proposals/proposal-editor/job-proposal.resolver';
import { ChooseContactModule } from '../shared/choose-contact/choose-contact.module';
import { JobContactDialogComponent } from '../shared/jobs-ui/job-contact-dialog.component';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { ContactsUiService } from '../shared/contacts-ui/contacts-ui.service';
import { JobUiModule } from '../shared/jobs-ui/jobs-ui.module';
import { JobsUiService } from '../shared/jobs-ui/jobs-ui.service';
import { JobContractsComponent } from './jobs-info/job-contracts/job-contracts.component';
import { JobProposalsComponent } from './jobs-info/job-proposals/job-proposals.component';
import { JobProposalOverviewComponent } from './jobs-info/job-proposals/proposal-overview/proposal-overview.component';
import { ChooseWorkerModule } from '../shared/choose-worker/choose-worker.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(JOBS_ROUTES),
    SharedModule,
    AccordionModule,
    ModalModule,
    PaginationModule.forRoot(),
    TabsModule,
    TooltipModule.forRoot(),
    TypeaheadModule,
    ButtonsModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    NgxMyDatePickerModule,
    FormFieldModule,
    FormFieldAddressModule,
    FormFieldTextareaModule,
    FormNgSelectWrapModule,
    JobUiModule,
    JobsContactAddModule,
    MaterialTabModule,
    AnimateDivModule,
    EditableLabelModule,
    PipesModule,
    ReactiveFormsModule,
    CustomDropdownModule,
    ActivityFeedModule,
    ProposalsModule,
    NgxMyDatePickerModule,
    ChooseContactModule,
    DropdownSelectModule,
    PreventClickModule,
    ChooseWorkerModule,
    SqDatetimepickerModule
  ],
  declarations: [
    InvoicesComponent,
    JobContactListDialogComponent,
    JobHeaderComponent,
    JobInfoComponent,
    JobTopContactListComponent,
    JobsComponent,
    JobsEditComponent,
    JobsListHeaderComponent,
    JobContractsComponent,
    JobProposalsComponent,
    JobProposalOverviewComponent,
    ...JOB_EVENTS_EDITOR_COMPONENTS
  ],
  entryComponents: [
    JobContactDialogComponent
  ],
  exports: [
    InvoicesComponent,
    JobContactListDialogComponent,
    JobHeaderComponent,
    JobInfoComponent,
    JobTopContactListComponent,
    JobsComponent,
    JobsEditComponent,
    JobsListHeaderComponent,
  ],
  providers: [
    ContactsUiService,
    JobProposalResolver,
    JobsUiService,
    EventGroupService,
    EventService
  ]
})
export class JobsModule {}
