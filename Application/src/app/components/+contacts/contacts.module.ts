import { NgModule }                          from '@angular/core';
import { ContactsListComponent }             from './contacts-list/contacts-list.component';
import { ContactProfileComponent }           from './contact-profile/contact-profile.component';
import { ImportCSVComponent }                from './import-csv/import-csv.component';
import { RouterModule }                      from '@angular/router';
import { DropdownModule }                    from 'ngx-dropdown';
import { CommonModule }                      from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule }                  from 'ngx-bootstrap';
import { SharedModule }                      from '../shared';
import { FormFieldModule }                   from '../shared/form-field';
import { FormFieldAddressModule }            from '../shared/form-field-address';
import { FormNgSelectWrapModule }            from '../shared/form-ng-select-wrap';
import { FileUploadModule }                  from 'ng2-file-upload';
import { MdCheckboxModule }                  from '@angular2-material/checkbox';
import { MyDatePickerModule }                from 'mydatepicker';
import { PipesModule }                       from '../../pipes/pipes.module';
import { CustomDropdownModule }              from '../shared/dropdown';
import { ActivityFeedModule }                from '../shared/activity-feed';
import { DragAndDropImageModule }            from '../shared/drag-and-drop-image';

import { CONTACTS_ROUTES }                   from './contacts.routes';
import { ContactChangePageComponent } from './contact-change-page/contact-change-page.component';
import { ContactAddPageComponent } from './contact-add/contact-add-page.component';
import { ContactDialogComponent } from '../shared/contacts-ui/contact-dialog.component';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { ContactsUiModule } from '../shared/contacts-ui/contacts-ui.module';
import { ImportCSVStepFourModalComponent } from './import-csv/step-four-modal/step-four-modal.component';

/* Directives */
@NgModule({
  imports: [
    RouterModule.forChild(CONTACTS_ROUTES),
    CommonModule,
    ContactsUiModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    PaginationModule.forRoot(),
    FormFieldModule,
    SharedModule,
    FormFieldAddressModule,
    FormNgSelectWrapModule,
    FileUploadModule,
    MdCheckboxModule,
    MyDatePickerModule,
    PipesModule,
    CustomDropdownModule,
    ActivityFeedModule,
    DragAndDropImageModule,
    NgxMyDatePickerModule,
  ],
  declarations: [
    ContactAddPageComponent,
    ContactChangePageComponent,
    ContactProfileComponent,
    ContactsListComponent,
    ImportCSVComponent,
    ImportCSVStepFourModalComponent
  ],
  entryComponents: [
    ContactDialogComponent,
    ImportCSVStepFourModalComponent
  ],
  exports: [
    ContactAddPageComponent,
    ContactChangePageComponent,
    ContactsListComponent,
    ContactProfileComponent,
    ImportCSVComponent,
    ImportCSVStepFourModalComponent
  ]
})
export class ContactsModule {
}
