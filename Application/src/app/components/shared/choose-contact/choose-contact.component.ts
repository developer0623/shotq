/**
 * Component ChooseContactComponent
 */
import { Component } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router, ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import { DialogRef, ModalComponent } from 'single-angular-modal';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';

import { ModalService }             from '../../../services/modal/';
import { ContactService }           from '../../../services/contact';
import { JobService }               from '../../../services/job';
import { JobContactService }        from '../../../services/job-contact';
import { JobRoleService }           from '../../../services/job-role';
import { GeneralFunctionsService }  from '../../../services/general-functions';
import { FlashMessageService }      from '../../../services/flash-message';
import { Job } from '../../../models/job';


export class ChooseContactWindowData extends BSModalContext {
  jobId: number;
}


@Component({
  selector: 'choose-contact',
  templateUrl: 'choose-contact.component.html',
  styleUrls: ['choose-contact.component.scss'],
  providers: [ContactService, JobContactService, GeneralFunctionsService, FlashMessageService, JobRoleService, JobService]
})
export class ChooseContactComponent implements ModalComponent<ChooseContactWindowData> {
  searchTextChanged: Subject<string> = new Subject<string>();

  jobData = new Job;
  jobId: number;
  public _ = require('../../../../../node_modules/lodash');

  private alertify = require('../../../assets/theme/assets/vendor/alertify-js/alertify.js');
  private search_box: string;
  private limit: number = 10;
  private submitDisabled: boolean = true;
  private orderBy: string;
  private orderDirection: string;
  private currentFilter: string = 'all';
  private totalItems: number = 0;
  private currentPage: number = 1;
  private perPage: number = 10;
  private isLoading: boolean = false;
  private contactsToAdd: Array<any> = [];
  private contacts: Array<any> = [];
  private jobRoles: Array<any> = [];
  private initialContacts: Array<any> = [];
  private initialContactsIds: Array<number> = [];
  private contactsToAddIds: Array<number> = [];
  private initialContactsAdded: number = 0;
  private newName: string = null;
  private newLastName: string = null;
  private newEmail: string = null;
  private newRole: number;
  private newChecked: boolean = false;
  private currentUrl: string = null;
  private showNewContactRow: boolean = false;
  private sub;
  private addContactFlag = false;

  constructor(
    private route: ActivatedRoute,
    private contactService: ContactService,
    private jobContactService: JobContactService,
    private jobRoleService: JobRoleService,
    private jobService: JobService,
    private generalFunctions: GeneralFunctionsService,
    private modalService: ModalService,
    private flash: FlashMessageService,
    public router: Router,
    public dialog: DialogRef<ChooseContactWindowData>
    ) {
    this.currentUrl = this.router.url;
    // Initialize search input.
    this.search_box = '';
    this.searchTextChanged
      .debounceTime(1000) // wait 300ms after the last event before emitting last event
      .distinctUntilChanged() // only emit if value is different from previous value
      .subscribe(text => {
        this.search_box = text;
        this.search(true);
      });
  }

  ngOnInit() {
    this.jobId = this.dialog.context['jobId'];
    this.loadJobData(this.jobId);

    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');
  }

  /**
   * Function called when input search is changed
   */
  changed(text: string) {
    if (this.currentFilter === 'all') {
      this.searchTextChanged.next(text);
    } else {
      this.search_box = text;
      this.searchSelected();
    }
  }

  public loadJobData(id: number) {
    this.jobId = id;
    this.isLoading = true;
    this.jobService.get(this.jobId)
      .subscribe(data => {
        this.jobData = data;
        this.getInitialContacts();
        this.getRoles();
        this.search();
      }, err => console.error(err), () => {});
  }
  /**
   * Function to get Job Roles
   */
  public getRoles() {
    this.isLoading = true;
    this.jobRoleService.getList()
      .subscribe(roles => {
        this.jobRoles = roles.results;
        this.jobRoles.unshift({
          'id': 0,
          'name': 'Job Role...'
        });
      });
  }
  /**
   * Function to get already associated contacts when modal opens
   */
  public getInitialContacts() {
    this.contactsToAdd = [];
    this.initialContactsAdded = 0;
    this.initialContacts = [];
    this.initialContactsIds = [];
    for (let contact of this.jobData.job_contacts) {

      let aux = this._.cloneDeep(contact);
      // set job contacts as selected
      aux.isJobContact = true;
      aux.selected = true;
      aux.role = 0;
      // Set role
      if (aux.roles && aux.roles.length > 0) {
        aux.role = aux.roles[0].id;
        aux.roleName = aux.roles[0].name;
      }
      this.contactsToAdd.push(aux);
      this.initialContacts.push(aux);
      // the contact property on job contact is the contact id,
      // add it to the array to avoid duplicated on the list
      // this array will be checked looking for contact ids
      // in order to show or don't show a contact if it is already
      // a job contact
      this.initialContactsIds.push(contact.contact);
      this.contactsToAddIds.push(contact.contact);
    }
  }
  /**
   * Function to close current choose contact modal.
   */
  public modalClose() {
    this.dialog.close();
    this.contactsToAdd = [];
    this.search_box = '';
    this.currentFilter = 'all';
  }

  /**
   * Function to search contacts calling API.
   *
   * @param {event} e [description]
   */
  public search(newSearch?: boolean) {
    if (newSearch && newSearch !== undefined) {
      // Each time the user types a letter the search must be restarted
      this.contacts = [];
      this.totalItems = 0;
      this.currentPage = 1;

    }

    if (typeof this.search_box !== undefined) {
      this.isLoading = true;
      this.contactService.searchContact(this.search_box, { archived: 'False', active: 'True', page: this.currentPage, page_size: this.perPage })
        .subscribe(response => {
          // Add selected contacts
          if (this.contacts.length === 0) {
            for (let existingContact of this.initialContacts) {
              if (this.filterContact(existingContact, this.search_box)) {
                this.contacts.push(existingContact);
              }
            }
          }
          // add search result contacts to contact list
          for (let contact of response.contacts) {
            contact.role = 0;
            // if the contact is already a job contact don't display it
            if (this.initialContactsIds.indexOf(contact.id) !== -1) {
              contact.notAdd = true;
            } else if (this.contactsToAddIds.indexOf(contact.id) !== -1) {
              let toAdd = _.find(this.contactsToAdd, {id: contact.id});
              contact.selected = true;
              if (toAdd)
                contact.role = toAdd.role;
            }
            // Set roles
            if (contact.roles && contact.roles.length > 0) {
              contact.role = contact.roles[0].id;
            }
            // Add contacts to list
            if (!contact.notAdd) {
              this.contacts.push(contact);
            }
          }
          this.totalItems = this.contacts.length;
        },
        err => {
          console.error(`ERROR: ${err}`);
          this.isLoading = false;
        },
        () => { this.isLoading = false; }
        );
    }
  }
  /**
   * Clear the ContactsToAdd array
   *
   */
  public clearContactsToAdd() {
    this.contactsToAdd = [];
  }
  /**
   * Function triggered when role is changed
   *
   * @param {any} contact [description]
   */
  public roleChange(contact: any, event: any) {
    for (let r of this.jobRoles) {
      if (r.id === event) {
        contact.role = r.id;
        break;
      }
    }
  }
  public newRoleChange(event: any) {
    for (let r of this.jobRoles) {
      if (r.id === event) {
        this.newRole = r.id;
        break;
      }
    }
  }

  /**
   * Increase search to currentPage plus one.
   * @param {[type]} $event [description]
   * @param {string} section [section paginator to increase]
   */
  public onScroll() {
    if (this.currentFilter === 'all' && this.currentPage <= Math.floor(this.totalItems / this.perPage)) {
      this.currentPage += 1;
      this.search();
    }
  }
  /**
   * Set contact selected
   *
   * @param {Object} contact Contact object.
   */
  public setSelected(contact: any) {
    // iterate contacts.
    if (contact.selected) {
      contact.selected = false;
      let index = -1;
      for (let i = 0; i < this.contactsToAdd.length; i++) {
        if (this.contactsToAdd[i].id === contact.id) {
          index = i;
          break;
        }
      }
      if (index > -1) { // Remove contact from array.
        this.contactsToAdd.splice(index, 1);
      }
      index = -1;
      index = this.contactsToAddIds.indexOf(contact.id);
      if (index > -1) {
        this.contactsToAddIds.splice(index, 1);
      }
      if (this.contactsToAdd.length === this.initialContacts.length) { // Disable button if there're no contacts to add for relation.
        this.submitDisabled = true;
      }
    } else {
      this.submitDisabled = false; // Enable button for contact relation.
      contact.selected = true;
      this.contactsToAdd.push(contact);
      this.contactsToAddIds.push(contact.id);
    }
  }
  /**
   * Function to add job contact relation.
   */
  public addJobContact(e: any) {
    let i = 0;
    let contactsAdded = 0;
    let newJobContacts = (this.contactsToAdd.length - this.initialContacts.length);
    let primary = ((this.jobData.external_owner === null || this.jobData.external_owner === undefined) && newJobContacts === 1);
    for (let contact of this.contactsToAdd) {
      this.isLoading = true;
      if (!contact.isJobContact) {
        let roles = [];
        if (contact.role !== 0) {
          roles.push(contact.role);
        } else {
          this.flash.error('Couldn\'t add ' + this.getFullName(contact) + ' to the job. Job role is required');
          i++;
          this.isLoading = false;
          break;
        }
        let data = {
          job: this.jobData.id,
          contact: contact.id,
          roles: roles
        };
        this.jobContactService.create(data)
          .subscribe(jobContact => {
            // if this is the first contact, then set as primary.
            // only if one is selected
            if (primary) {
              // set this as primary
              let aux =  {
                external_owner: jobContact.contact
              };
              this.jobService
                .partialUpdate(this.jobData.id, aux)
                .subscribe(
                  () => {},
                  err => console.error(err),
                  () => {
                    if (primary) {
                      this.isLoading = false;
                      this.modalService.data = {
                        'primary': true
                      };
                      this.modalClose();
                      this.contactsToAdd = [];
                      this.currentFilter = 'all';
                      this.search_box = '';
                    }
                  }
                );
            }
          },
          err => {
            console.error(`ERROR: ${err}`);
          },
          () => {
            i++;
            contactsAdded++;
            // finish to add all contacts;
            if (i === newJobContacts && !primary) {
              this.isLoading = false;
              this.modalClose();
              this.contactsToAdd = [];
              this.currentFilter = 'all';
              this.search_box = '';
            }
          }
        );
      }
    }
  }
  /**
   * Function to get the contact full name.
   *
   * @param  {Contact} contact [description]
   * @return {string}          [description]
   */
  public getFullName(contact: any): string {
    let value = '';
    if (contact.isJobContact) {
      value = contact.name;
    } else {
      value = this.generalFunctions.getContactFullName(contact);
    }
    value = value.replace(/_/g, ' ');
    value = value.replace(/\b\w/g, l => l.toUpperCase());
    return value;
  }
  /**
   * Function to get the contact email.
   *
   * @param  {Contact} contact [description]
   * @return {string}          [description]
   */
  public getEmail(contact: any): string {
    if (contact.isJobContact) {
      return contact.default_email_address;
    } else if (contact.emails && contact.emails.length > 0) {
      return contact.emails[0].address;
    } else {
      return '';
    }
  }
  /**
   * Function to cut the text to enter on the available space
   *
   */
  public checkLength(text: string, type: string) {
    if (type === 'name') {
      return text.slice(0, 20) + '...';
    } else {
      return text.slice(0, 17) + '...';
    }
  }
  /**
   * Function to get the contact full name.
   *
   * @param  {string} filter [filter to apply]
   */
  public setFilter(filter: string) {

    if (this.showNewContactRow && !this.addContactFlag) {
      let $this = this;
      let message = 'The contact is not saved yet. Do you want to continue?';
      this.alertify.confirm(message, () => {
        $this.cancelAddNew();
        $this.setFilter(filter);
      });
    } else {
      this.search_box = '';
      this.contacts = [];
      if (filter === 'all') {
        this.currentFilter = 'all';
        this.totalItems = 0;
        this.currentPage = 1;
        this.search();
      } else if (filter === 'selected') {
        this.currentFilter = 'selected';
        this.contacts = this.contactsToAdd;
        this.searchSelected();
      }
    }
    if (this.addContactFlag) {
      this.cancelAddNew();
      this.addContactFlag = false;
    }

  }
  /**
   * Function to search on selected contacts
   *
   */
  public searchSelected() {
    this.contacts = [];
    if (this.search_box.trim() !== '') {
      for (let contact of this.contactsToAdd) {
        let index = this.getFullName(contact).toLowerCase().indexOf(this.search_box.toLowerCase());
        if (index > -1) {
          this.contacts.push(contact);
        }
      }
    } else {
      this.contacts = this.contactsToAdd;
    }
    this.totalItems = this.contacts.length;
  }
  /**
   * Function to set the new contact as selected when is created
   *
   */
  public setNewSelected() {
    this.newChecked = !this.newChecked;
  }
  /**
   * Function to add new contact
   *
   */
  public addNewContact() {
    this.addContactFlag = true;
    let hasErrors = false;
    let primary = ((this.jobData.external_owner === null || this.jobData.external_owner === undefined) && this.initialContacts.length === 0);
    if (this.newRole === undefined || this.newRole === 0) {
      this.flash.error('You must select a role.');
      hasErrors = true;
    }
    if (this.newEmail !== undefined && !this.validateEmail(this.newEmail)) {
      hasErrors = true;
    }
    if (this.newName !== undefined && !this.validateLetters(this.newName, 'name')) {
      hasErrors = true;
    }
    if (this.newLastName !== undefined && !this.validateLetters(this.newLastName, 'last name')) {
      hasErrors = true;
    }
    if (hasErrors) {
      return;
    }
    let newContact = {
      'first_name': this.newName.toLowerCase(),
      'last_name': this.newLastName.toLowerCase(),
      'account': 1,
      'emails': [{
        'address': this.newEmail,
        'email_type': 1
      }]
    };
    this.isLoading = true;
    this.contactService.create(newContact)
      .subscribe(contactData => {
          contactData.role = this.newRole;
          this.setSelected(contactData);
          this.flash.success('The contact has been created.');
          this.setFilter('all');
        },
        err => {
          this.flash.error('An error has occurred creating the contact, please try again later.');
        },
        () => {}
      );
  }

  /**
   * Add new contact event handler
   * display the new contact row
   */
  private addNewContactRow() {
    if (!this.showNewContactRow) {
      let el: any = document.querySelector('.list-group.list-group-full');
      if (el !== undefined) {
        el.scrollTop = 0;
      }
      this.newName = undefined;
      this.newRole = undefined;
      this.newLastName = undefined;
      this.newEmail = undefined;
      this.showNewContactRow = true;
    }
  }

  /**
   * Cancel add new contact event
   * Hide the add new contact row
   * and restart the new contact variables
   */
  private cancelAddNew() {
    this.showNewContactRow = false;
    this.newName = undefined;
    this.newRole = undefined;
    this.newLastName = undefined;
    this.newEmail = undefined;
  }

  /**
   * Validate email format
   * Alert user with flash message if email isn't valid
   * @param {string} email [description]
   */
  private validateEmail(email: string) {
    if (!email.match('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)' +
      '+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)')) {
      this.flash.error('Please, enter a valid Email');
      return false;
    } else {
      return true;
    }
  }

  /**
   * Validate that the string passed has only letters
   * if it doesn't, display a flash error and use the label parameter
   * to alert user
   * @param {string} value [description]
   * @param {string} label [description]
   */
  private validateLetters(value: string, label: string) {
    let exp = new RegExp(/^[A-zÀ-úA-zÀ-ÿ\s\']*$/g);
    if (!exp.test(value)) {
      this.flash.error('Please, enter a valid ' + label);
      return false;
    } else {
      return true;
    }
  }

  /**
   * Filter contacts searching the filter string
   * on his name or email
   * @param {any}    contact [description]
   * @param {string} filter  [description]
   */
  private filterContact(contact: any, filter?: string) {
    if (filter === undefined || filter === '') {
      return true;
    }
    filter = filter.toLowerCase();
    let name = this.getFullName(contact).toLowerCase();
    let email = this.getEmail(contact).toLowerCase();
    let findName = name.indexOf(filter);
    let findEmail = email.indexOf(filter);
    return (findName !== -1 || findEmail !== -1);
  }
}
