import * as _ from 'lodash';
import moment from 'moment';
import { SetOptions } from 'eonasdan-bootstrap-datetimepicker';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FlashMessageService } from '../../../../../services/flash-message/flash-message.service';
import { EventGroup } from '../../../../../models/event-group';
import { Event } from '../../../../../models/event';

@Component({
  selector: 'group-events',
  templateUrl: './group-events.component.html',
  styleUrls: ['./group-events.component.scss']
})
export class GroupEventsComponent {
  currentEventItemIndex: number;
  eventItemForm: FormGroup;
  options: SetOptions;
  @Input() eventGroup: EventGroup;
  @Output() saveEvent: EventEmitter<{index: number, event: Event}> = new EventEmitter<{index: number, event: Event}>();
  @Output() addNewEvent: EventEmitter<number> = new EventEmitter<number>();
  @Output() deleteEvent: EventEmitter<number> = new EventEmitter<number>();
  private timeFormat: string = 'HH:mm';

  constructor(
    private fb: FormBuilder,
    public flash: FlashMessageService
  ) { }

  selectEventItem(index: number) {
    if (index === this.currentEventItemIndex) {
      this.closeEventItem();
      return;
    }
    this.currentEventItemIndex = index;
    this.updateDatetimepickerOptions();
    this.setupEventItemForm();
  }

  closeEventItem() {
    this.currentEventItemIndex = null;
    this.eventItemForm = null;
  }

  setupEventItemForm() {
    let eventItem = this.eventGroup.events[this.currentEventItemIndex];
    this.eventItemForm = this.fb.group({
      name: [eventItem.name, Validators.required],
      start: [eventItem.start, Validators.required],
      end: [eventItem.end, Validators.required]
    });
    if (this.options.minDate && !eventItem.start) {
      this.eventItemForm.patchValue({start: this.options.minDate});
    }
    if (this.options.maxDate && !eventItem.end) {
      this.eventItemForm.patchValue({end: this.options.maxDate});
    }
  }

  addEventItem(index: number) {
    this.addNewEvent.emit(index);
    setTimeout(() => {
      let interval = this.getStartEnd(index);
      if (interval.end.diff(interval.start, 'minutes') >= 15) {
        this.selectEventItem(index);
        this.saveEventItem();
      } else {
        this.deleteEventItem(index);
        this.flash.error('Not enough time period to create an event');
      }
    });
  }

  saveEventItem() {
    let oldEvent = this.eventGroup.events[this.currentEventItemIndex];
    let startDt = oldEvent.start;
    let endDt = oldEvent.end;
    if (!startDt && !endDt) {
      startDt = this.eventGroup.start;
      endDt = this.eventGroup.end;
    }
    let event: Event = Object.assign(
      {event_group: this.eventGroup.id},
      oldEvent,
      this.eventItemForm.value,
    );
    this.saveEvent.emit({
      index: this.currentEventItemIndex,
      event: event
    });
    this.closeEventItem();
  }

  deleteEventItem(index: number) {
    this.closeEventItem();
    this.deleteEvent.emit(index);
  }

  private getStartEnd(index: number): {start: moment.Moment, end: moment.Moment} {
    let start, end;
    if (this.eventGroup.events.length < 2) {
      start = this.eventGroup.start;
      end = this.eventGroup.end;
    } else {
      if (index === 0) {
        start = this.eventGroup.start;
      } else {
        start = this.eventGroup.events[index - 1].end;
      }
      if (index === this.eventGroup.events.length - 1) {
        end = this.eventGroup.end;
      } else {
        end = this.eventGroup.events[index + 1].start;
      }
    }
    let startDt = moment(start);
    let endDt = moment(end);
    return {start: startDt, end: endDt};
  }

  private updateDatetimepickerOptions() {
    let intervalDate = this.getStartEnd(this.currentEventItemIndex);
    let diffInHours = intervalDate.end.diff(intervalDate.start, 'hours');
    this.timeFormat = diffInHours > 23 ? 'l LT' : 'LT';
    this.options = {
      format: this.timeFormat,
      minDate: intervalDate.start,
      maxDate: intervalDate.end
    };
  }

}
