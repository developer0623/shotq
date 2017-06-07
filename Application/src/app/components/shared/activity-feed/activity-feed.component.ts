import {
  Component,
  Input,
  Output,
  OnInit,
  OnChanges,
  HostListener,
  EventEmitter
}                                          from '@angular/core';
/* Components */
import { ActivityTypeMap }                 from './activity-type-map';
import { FormFieldComponent }              from '../../shared/form-field/form-field.component';
/* Services */
import { GeneralFunctionsService }         from '../../../services/general-functions';
import { ContactService }                  from '../../../services/contact/contact.service';
import { ActivityService }                 from '../../../services/activity/activity.service';
/* Other vars */
declare let window: any;

@Component({
  selector: 'activity-feed',
  templateUrl: 'activity-feed.component.html',
  styleUrls: ['activity-feed.component.scss'],
  providers: [GeneralFunctionsService, ContactService, ActivityService ]
})
export class ActivityFeedComponent {
   public tabs: Array<any> = [
    {
      name: 'All', status: 'all', id: 1, filters: []
    },
    {
      name: 'Recent', status: 'recent', id: 2, filters: []
    },
    {
      name: 'Upcoming', status: 'upcoming', id: 3, filters: []
    }
  ];
  public currentTab =                 this.tabs[0];
  public currentStatus =              this.currentTab['status'];
  public isLoading =                  false;
  public activityFeedList:            Array<any>;
  public activityFeedListPast:        Array<any>;
  public activityFeedListYesterday:   Array<any>;
  public activityFeedListToday:       Array<any>;
  public activityFeedListUpcoming:    Array<any>;
  private contactId:                  any;
  private isClassApplied:             any = false;
  private isJobs:                     boolean = false;
  private types = [];
  private selectedCategory =          this.tabs[0];

  constructor(
    private generalFunctions:         GeneralFunctionsService,
    private contactService:           ContactService,
    private activityService:          ActivityService
  ) {

  }
  /**
   * OnInit function executed on component initialization.
   */
  public ngOnInit() {
    this.isClassApplied =             false;
    this.activityFeedList =           [];
    this.activityFeedListPast =       [];
    this.activityFeedListYesterday =  [];
    this.activityFeedListToday =      [];
    this.activityFeedListUpcoming =   [];
    /* Get contact id from url params */
    this.generalFunctions.getUrlParams()
      .subscribe(
        params => {
          let aux = this.generalFunctions.getCurrentUrl();
          if (aux.search('jobs') === -1) {
            if (params['id']) {
                this.contactId = +params['id'];
                this.getActivityFeeds();
              }
          } else {
            this.isJobs = true;
            if (params['id']) {
                this.contactId = +params['id'];
                // this.getActivityFeeds();
              }
          }
        },
        err => {
          console.error(err);
        }
      );
  }
  /**
   * Function to get the activity type list from API.
   */
  public getActivityTypes() {
    this.activityService.getActivityType()
    .subscribe(data => {
      this.types = data;
    });
  }
  /**
   * Function to get the activity feed list from API.
   */
  public getActivityFeeds() {
    this.isLoading = true;
    this.contactService.getContactActivityList(this.contactId)
      .subscribe(
        response => {
          this.activityFeedList = response;
          this.processActivityIconMap(); // Map the icon with activity_type field.
          this.setDateTypeOfActivity(); // Set if date is TODAY, YESTERDAY or PAST.
          this.makeActivitiesArray(); // Make activities separated array.
        },
        err => {
          console.error(err);
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }
  /**
   * Function to set selected clicked tab (UPCOMING, RECENT, ALL)
   * @param {string} selectedTab / The selected tab.
   */
  public setTab(selectedTab: string) {
    for (let c of this.tabs) {
      if (c.id === selectedTab) {
        this.currentStatus = c.status;
        this.currentTab = c;
      }
    }
  }
  @HostListener('scroll', ['$event'])
  private onScroll($event: Event): void {
    let headerEl = document.querySelector('div.titleBlock');
    if (this.isClassApplied === false && $event.srcElement.scrollTop > 50) {
      this.isClassApplied = true;
      headerEl.className = headerEl.className + ' box-shadow-apply';
    } else if ($event.srcElement.scrollTop < 50) {
      if (headerEl !== null) {
        headerEl.classList.remove('box-shadow-apply');
      }
      setTimeout(() => {
        this.isClassApplied = false;
      });
    }
  }
  /**
   * Function to add the proper icon map to the activity.
   */
  private processActivityIconMap() {
    for (let activity of this.activityFeedList) {
      if (activity.icon === undefined) {
        activity.icon = ActivityTypeMap[activity.activity_type];
      }
    }
  }
  /**
   * Function to set if the activity is:
   *  - UPCOMING // days_offset was introduced after the development of this logic.
   *  - TODAY
   *  - YESTERDAY
   *  - PAST
   *
   */
  private setDateTypeOfActivity() {
    let today: Date = new Date();
    let yesterday: Date = new Date();
    let past: Date = new Date();
    let upcoming: Date = new Date();

    yesterday.setDate(today.getDate() - 1);
    past.setDate(today.getDate() - 2);
    upcoming.setDate(today.getDate() + 1);

    for (let a of this.activityFeedList) {
      let activityDate = new Date(a.date);
      // today
      if (activityDate.getFullYear() === today.getFullYear()
        && activityDate.getMonth() === today.getMonth()
        && activityDate.getDate() === today.getDate()) {
        a.today = true;
      } else if (activityDate.getFullYear() === yesterday.getFullYear()
        && activityDate.getMonth() === yesterday.getMonth()
        && activityDate.getDate() === yesterday.getDate()) {
        a.yesterday = true;
        a.past = true;
      } else if ((activityDate.getFullYear() === past.getFullYear()
        && activityDate.getMonth() === past.getMonth()
        && activityDate.getDate() === past.getDate())
        || (activityDate <= past)) {
        a.past = true;
      } else if ((activityDate.getFullYear() === upcoming.getFullYear()
        && activityDate.getMonth() === upcoming.getMonth()
        && activityDate.getDate() === upcoming.getDate())
        || (activityDate >= upcoming)) {
        a.upcoming = true;
      }
    }
  }


  /**
   * Map activities in separate array
   *  - UPCOMING // days_offset was introduced after the development of this logic.
   *  - TODAY
   *  - YESTERDAY
   *  - PAST
   */
  private makeActivitiesArray() {
    for (let activity of this.activityFeedList) {
      if (activity.upcoming !== undefined) {// Upcoming
        this.activityFeedListUpcoming.push(activity);
      }
      if (activity.today !== undefined) {// Today
        this.activityFeedListToday.push(activity);
      }
      if (activity.yesterday !== undefined) {// Yesterday
        this.activityFeedListYesterday.push(activity);
      }
      if (activity.past !== undefined) {// Past
        this.activityFeedListPast.push(activity);
      }
    }
  }
}
