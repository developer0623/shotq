import * as _ from 'lodash';
import moment from 'moment';
import { Component, Input } from '@angular/core';
import { Job } from '../../../../models/job';
import { Event } from '../../../../models/event';
import { EventGroup } from '../../../../models/event-group';
import { JobService } from '../../../../services/job';
import { EventGroupService } from '../../../../services/event-group';
import { EventService } from '../../../../services/event';
import { AlertifyService } from '../../../../services/alertify/alertify.service';

@Component({
  selector: 'job-events-editor',
  templateUrl: './job-events-editor.component.html'
})
export class JobEventsEditorComponent {
  @Input() job: Job;
  confirmMsg: string = 'Are you sure that you want to do this?';
  currentGroup: EventGroup;

  constructor(
    private alertify: AlertifyService,
    private jobService: JobService,
    private eventGroupService: EventGroupService,
    private eventService: EventService
  ) { }

  editGroup(group: EventGroup) {
    if (this.currentGroup) {
      this.closeGroupForm();
    }
    setTimeout(() => {
      this.currentGroup = group;
    }, 0);
  }

  closeGroupForm() {
    this.currentGroup = null;
  }

  addNewGroup(index: number) {
    let data = {
      name: 'Event group',
      job: this.job.id,
      start: moment().startOf('day').endOf('minute').toISOString(),
      end: moment().endOf('day').startOf('minute').toISOString(),
    };
    this.eventGroupService.create(data).subscribe((group) => {
      this.job.eventgroups.splice(index, 0, group);
      this.sortGroups();
      this.editGroup(group);
    });
  }

  saveGroup(group: EventGroup) {
    this.eventGroupService.save(group).subscribe((groupData) => {
      let index = this.job.eventgroups.findIndex(g => g.id === groupData.id);
      if (index !== -1) {
        this.job.eventgroups[index] = groupData;
        this.sortGroups();
      }
      this.currentGroup = groupData;
    });
  }

  deleteGroup(group: EventGroup) {
    this.alertify.confirm(this.confirmMsg, () => {
      this.eventGroupService.delete(group.id).subscribe(() => {
        this.currentGroup = null;
        let index = this.job.eventgroups.findIndex(g => g.id === group.id);
        this.job.eventgroups.splice(index, 1);
      });
    });
  }

  addNewEventItem(index: number) {
    let groupIndex = this.getCurrentGroupIndex();
    let newEventItem = {
      name: 'New event',
      event_group: this.currentGroup.id,
      account: this.currentGroup.account
    };
    this.job.eventgroups[groupIndex].events.splice(index, 0, newEventItem);
  }

  saveEventItem(data: {index: number, event: Event}) {
    this.eventService.save(data.event).subscribe((event) => {
      let groupIndex = this.getCurrentGroupIndex();
      this.job.eventgroups[groupIndex].events[data.index] = event;
    });
  }

  deleteEventItem(index: number) {
    let groupIndex = this.getCurrentGroupIndex();
    let eventId = this.job.eventgroups[groupIndex].events[index].id;
    if (eventId) {
      this.alertify.confirm(this.confirmMsg, () => {
        this.eventService.delete(eventId).subscribe(() => {
          this.job.eventgroups[groupIndex].events.splice(index, 1);
        });
      });
    } else {
      this.job.eventgroups[groupIndex].events.splice(index, 1);
    }
  }

  setMainEventGroup(group: EventGroup) {
    let data = {main_event_group: group};
    this.jobService.partialUpdate(this.job.id, data).subscribe((job) => {
      _.assign(this.job, job);
    });
  }

  private getCurrentGroupIndex(): number {
    return this.job.eventgroups.findIndex(g => g.id === this.currentGroup.id);
  }

  private sortGroups() {
    let eventgroups = _.sortBy(this.job.eventgroups, g => g.start ? moment(g.start).unix() : 0);
    this.job.eventgroups = eventgroups;
  }
}
