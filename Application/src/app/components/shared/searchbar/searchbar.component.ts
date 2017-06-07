/**
 * Component SearchbarComponent
 */
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges
}                                  from '@angular/core';
/* Services */
import { GeneralFunctionsService } from '../../../services/general-functions';

@Component({
  selector: 'searchbar',
  templateUrl: 'searchbar.component.html',
  styleUrls: ['searchbar.component.scss'],
  providers: [GeneralFunctionsService]
})
export class SearchbarComponent {
  @Input() contactResults: any[] = [];
  @Input() jobResults: any[] = [];
  @Input() contactSpinLoading: boolean = false;
  @Input() jobSpinLoading: boolean = false;
  @Output() searchTerm = new EventEmitter();
  public search_box: string;
  public entityInfo: any;
  public isLoading: boolean = false;

  constructor(private grlFunc: GeneralFunctionsService) {}

  ngOnInit() {
    this.search_box = '';
  }

  ngOnChanges() {
    this.isLoading = this.jobSpinLoading || this.contactSpinLoading;
    if (!this.contactResults.length && !this.jobResults.length) {
      this.entityInfo = null;
    }
    if (this.search_box === '') {
      this.clearSearchInput();
    }
  }
  /**
   * onFocus
   */
  public onFocus() {
    let searchEl: any = document.querySelector('#search-box');
    let buttonClose: any = document.querySelector('.input-search-close');
    buttonClose.className = buttonClose.className.replace(' op0 ', '');
    searchEl.className = searchEl.className.replace(' on-focus-searchbar ', ' ');
    /* Hide info panel is there no information to display */
    // if (!this.contactResults.length && !this.jobResults.length) {
    //   let searchResultsEl: any = document.querySelector('.search-results');
    //   searchResultsEl.style = 'display: none';
    // }
  }

  /**
   * Send Search Term.
   * @param {any} e [description]
   */
  public sendSearch(e: any) {
    if (this.search_box === '') {// If is backspace and there are no chars.
      this.clearSearchInput();
    }
    this.isLoading = true;
    /* Show info panel */
    // let searchResultsEl: any = document.querySelector('.search-results');
    // searchResultsEl.style = 'display: block';
    this.searchTerm.emit(this.search_box);
  }
  /**
   * Get the entity selected and set to show in mouseover.
   * @param {[type]} contact [description]
   */
  public modifyEntityInfo(entity) {
    this.entityInfo = entity;
  }
  /**
   * Function to clear search input text.
   */
  public clearSearchInput() {
    this.search_box = '';
    this.contactResults = [];
    this.jobResults = [];
    this.entityInfo = null;
    this.isLoading = false;
  }
  /**
   * This function perform the action for contacts.
   * Redirect to contact profile page.
   *
   * @param {any} contact [description]
   */
  public doContactAction(contact: any) {
    this.grlFunc.navigateTo('contacts/profile', [contact.id]);
  }
  /**
   * [doJobAction description]
   * @param {any} job [description]
   */
  public doJobAction(job: any) {
    this.grlFunc.navigateTo('jobs/info', [job.id]);
  }
  /**
   * Function to get job name.
   *
   * @param {any} job [description]
   */
  public getJobName(job: any) {
    if (job.job_type && job.name) {
      return job.name;
    }

  }
  /**
   * Function to get job status.
   *
   * @param {any} job [description]
   */
  public getJobStatus(job: any) {
    if (job.job_type && job.status) {
      return job.status;
    }
  }
  /**
   * [getContactEmailAddress description]
   * @param {any} entity [description]
   */
  public getContactEmailAddress(entity) {
    if (entity.external_owner !== null) {
      if (entity.job_type && entity.external_owner.default_email_address) {
        return entity.external_owner.default_email_address;
      } else if (entity.emails.length !== 0) {
        return entity.emails[0]['address'];
      }
    }
  }
  /**
   * [getContactPhoneNumber description]
   * @param {any} entity [description]
   */
  public getContactPhoneNumber(entity) {
    if (entity.external_owner !== null) {
      if (entity.job_type && entity.external_owner.default_phone_number) {
        return entity.external_owner.default_phone_number;
      } else if (entity.phones.length !== 0) {
        return entity.phones[0]['number'];
      }
    }
  }
  /**
   * [getFullName description]
   * @param {any} entity [description]
   */
  public getContactFullName(entity) {
    if (entity.external_owner !== null) {
      if (entity.job_type && entity.external_owner) {
        return this.grlFunc.getContactFullName(entity.external_owner);
      } else {
        return this.grlFunc.getContactFullName(entity);
      }
    }
  }
}
