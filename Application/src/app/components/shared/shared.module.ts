import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
/* Components */
import { SearchbarComponent }               from '../shared/searchbar/searchbar.component';
import { TimelineComponent }                from '../shared/timeline/timeline.component';
import { NotesComponent }                   from '../shared/notes/notes.component';
import { ActivityFeedComponent }            from '../shared/activity-feed/activity-feed.component';
import { TinymceComponent }                 from '../shared/tinymce-editor/tinymce-editor.component';
import { ConfirmDialogComponent }           from './confirm-dialog/confirm-dialog.component';

import { AlertComponent }                   from '../shared/alert/';
import { DropdownComponent }                from '../shared/dropdown/dropdown.component';
import { PaginateComponent }                from '../shared/paginate/paginate.component';
import { CpagerComponent }                  from '../shared/pager/cpager.component';
import { SortBtnComponent }                 from '../shared/sort-btn';
import { OpenModalByUrlComponent }          from '../shared/open-modal-by-url';
import { MdCheckboxModule }                 from '@angular2-material/checkbox';
/* Modules */
import { RouterModule }                     from '@angular/router';
import { DropdownModule }                   from 'ngx-dropdown';
import { CommonModule }                     from '@angular/common';
import { FormsModule }                      from '@angular/forms';
import { FileUploadModule }                 from 'ng2-file-upload';
import { AccordionModule }                  from 'ngx-accordion';
import { EditableLabelModule }              from '../shared/editable-label';
import { DragAndDropImageModule }           from '../shared/drag-and-drop-image';
import { CustomDropdownModule }             from '../shared/dropdown';
import { PipesModule }                      from '../../pipes/pipes.module';
import { ModalModule }                      from 'ngx-bootstrap';

import {
  PaginationModule,
  TooltipModule,
  ButtonsModule
}                                           from 'ngx-bootstrap';
/* Pipes */
import { CanDeactivateChangesGuard } from './guards/can-deactivate-changes.guard';
import { DropdownSelectComponent } from './dropdown-select/dropdown-select.component';
import { DropdownSelectModule } from './dropdown-select/dropdown-select.module';
import { ClickOutsideDirective } from '../../directives/click-outside/click-outside.directive';
import { StepIndicatorComponent } from './step-indicator';
import { ValidationMessagesDirective } from './validation-messages/validation-messages.directive';
import { CorrespondenceListComponent } from './correspondence-list/correspondence-list.component';

const SHARED_COMPONENTS = [
  AlertComponent,
  CorrespondenceListComponent,
  SearchbarComponent,
  TimelineComponent,
  SortBtnComponent,
  PaginateComponent,
  CpagerComponent,
  OpenModalByUrlComponent,
  NotesComponent,
  TinymceComponent,
  ClickOutsideDirective,
  ConfirmDialogComponent,
  StepIndicatorComponent,
  ValidationMessagesDirective
];

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    DropdownModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    ButtonsModule,
    FileUploadModule,
    AccordionModule,
    MdCheckboxModule,
    EditableLabelModule,
    PipesModule,
    DragAndDropImageModule,
    CustomDropdownModule,
    DropdownSelectModule,
    ModalModule
  ],
  declarations: [
    ...SHARED_COMPONENTS
  ],
  exports: [
    ...SHARED_COMPONENTS
  ],
  providers: [
    CanDeactivateChangesGuard
  ]
})
export class SharedModule {
}
