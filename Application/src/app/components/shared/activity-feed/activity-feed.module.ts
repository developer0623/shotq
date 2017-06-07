import { NgModule }              from '@angular/core';
import { ActivityFeedComponent } from './activity-feed.component';
import { CommonModule }          from '@angular/common';
import { FormsModule }           from '@angular/forms';
import { SharedModule }          from '../';
import { FormFieldModule }       from '../form-field';
import { EditableLabelModule }   from '../editable-label/';
import { CustomDropdownModule }  from '../dropdown';
import { MdSlideToggleModule }   from '@angular2-material/slide-toggle';
import { ModalModule }           from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormFieldModule,
    EditableLabelModule,
    MdSlideToggleModule,
    CustomDropdownModule,
    ModalModule
  ],
  declarations: [
    ActivityFeedComponent,
  ],
  exports: [
    ActivityFeedComponent,
  ]
})
export class ActivityFeedModule {}
