import * as _ from 'lodash';
import moment from 'moment';
import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { EventGroup } from '../../../../../models/event-group';
import { EventGroupFormModel } from './event-group-form.model';
import { datesIntervalValidator } from '../../../../../validators';

@Component({
  selector: 'event-group-form',
  templateUrl: 'event-group-form.component.html',
  styleUrls: ['./event-group-form.component.scss']
})
export class EventGroupFormComponent implements OnInit, OnChanges {
  @Input() eventGroup: EventGroup;
  @Input() isMainEvent: boolean = false;
  @Output() onCloseForm: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSave: EventEmitter<EventGroup> = new EventEmitter<EventGroup>();
  @Output() onDeleteGroup: EventEmitter<EventGroup> = new EventEmitter<EventGroup>();
  @Output() onMainGroup: EventEmitter<EventGroup> = new EventEmitter<EventGroup>();
  form: FormGroup;
  formValue: EventGroupFormModel;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.formValue = this.eventGroupToFormValue(this.eventGroup);
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    let formValue = this.eventGroupToFormValue(this.eventGroup);
    if (!this.formValue) {
      this.formValue = formValue;
    } else {
      if (changes['eventGroup'] && !changes['eventGroup'].firstChange && changes['eventGroup'].previousValue.id !== changes['eventGroup'].currentValue.id) {
        this.formValue = formValue;
        this.initForm();
      } else {
        _.assign(this.formValue, formValue);
      }
    }
  }

  closeForm() {
    this.onCloseForm.emit();
  }

  deleteGroup(group: EventGroup) {
    this.onDeleteGroup.emit(group);
  }

  makeGroupMain() {
    this.onMainGroup.emit(this.eventGroup);
  }

  private eventGroupToFormValue(eventGroup: EventGroup): EventGroupFormModel {
    let formModel = <EventGroupFormModel>Object.assign(
      _.pick(eventGroup, ['name', 'address', 'description', 'all_day', 'start', 'end'])
    );
    return formModel;
  }

  private formValueToEventGroup(formValue: EventGroupFormModel): EventGroup {
    return Object.assign({}, this.eventGroup, formValue);
  }

  private initForm() {
    this.form = this.fb.group({
      name: [this.formValue.name, Validators.required],
      start: [this.formValue.start, Validators.required],
      end: [this.formValue.end, Validators.required],
      address: this.formValue.address,
      description: this.formValue.description,
      all_day: this.formValue.all_day,
    }, {
      validator: Validators.compose([
        datesIntervalValidator('start', 'end'), this.validateGroupInterval()
      ])}
    );
    this.form.valueChanges.debounceTime(500).subscribe((changes) => {
      if (this.form.valid) {
        _.assign(this.formValue, changes);
        this.onSave.emit(this.formValueToEventGroup(this.formValue));
      }
    });
    this.form.controls['all_day'].valueChanges.subscribe((allDay) => {
      if (!allDay) {
        return;
      }
      let data = {};
      let startDt = this.form.controls['start'].value;
      if (startDt) {
        data['start'] = moment(startDt).startOf('date');
      }
      let endDt = this.form.controls['end'].value;
      if (endDt) {
        data['end'] = moment(endDt).endOf('date');
      }
      this.form.patchValue(data);
    });
  }

  private validateGroupInterval(): ValidatorFn {
    return (group: FormGroup): {[key: string]: any} => {
      let startCtrl = group.controls['start'];
      let endCtrl = group.controls['end'];
      let events = this.eventGroup.events;
      if (startCtrl.value && endCtrl.value && events.length > 0) {
        let groupStartDt = moment(startCtrl.value);
        let groupEndDt = moment(endCtrl.value);
        if (groupStartDt.isAfter(events[0].start) || groupEndDt.isBefore(events[events.length - 1].end)) {
          return { groupInvalidInterval: true };
        }
      }
    };
  }
}
