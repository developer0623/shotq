import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import {
  AbstractControl, FormControl, FormGroup, ValidationErrors, Validators,
} from '@angular/forms';
import { AlertifyService } from '../../../services/alertify/alertify.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { CustomValidators } from 'ng2-validation';
import { Observable, Subject, BehaviorSubject, AsyncSubject } from 'rxjs';
import { DialogRef, overlayConfigFactory } from 'single-angular-modal/esm';
import { Modal } from 'single-angular-modal/plugins/bootstrap';

import {
  Contact, ContactType,
  DefaultAddressDetails, DefaultEmailDetails, DefaultPhoneDetails
} from '../../../models/contact';
import { ContactService } from '../../../services/contact/contact.service';
import {
  ContactDialogComponent, ContactDialogContext
} from './contact-dialog.component';
import { EmailTypeService } from '../../../services/email-type/email-type.service';
import { AddressTypeService } from '../../../services/address-type/address-type.service';
import { PhoneTypeService } from '../../../services/phone-type/phone-type.service';
import { EmailType } from '../../../models/email-type';
import { PhoneType } from '../../../models/phone-type';
import { AddressType } from '../../../models/address-type';
import { BaseAddress } from '../../../models/address';
import { DatePickerValue } from '../../../models/mydatepicker-model';
import {
  ContactDate, DATE_TYPE_ANNIVERSARY, DATE_TYPE_BIRTHDAY, DateType
} from '../../../models/contact-date';
import { JobRole } from '../../../models/job-role';
import { JobRoleService } from '../../../services/job-role/job-role.service';

interface PageCursor<T> {
  results: T[];
  count: number;
}

export class ContactPageCursor implements PageCursor<Contact> {
  results: Contact[];
  count: number;
}

function datePickerDateOrEmpty(control: AbstractControl): ValidationErrors | null {
  if (!control || !control.value)
    return null;
  if (!DatePickerValue.toDate(control.value))
    return {date: true};
  return null;
}

function emailOrEmpty(control: AbstractControl): ValidationErrors | null {
  if (!control || !control.value)
    return null;
  return Validators.email(control);
}

function postalAddressOrEmpty(control: AbstractControl): ValidationErrors | null {
  if (!control || !control.value)
    return null;
  let errors = {};
  let parsedAddress = BaseAddress.parse(control.value);
  if (!parsedAddress)
    errors['address'] = true;
  if (parsedAddress) {
    errors['zip'] = !parsedAddress.zip;
    errors['state'] = !parsedAddress.state;
    errors['city'] = !parsedAddress.city;
    errors['address1'] = !parsedAddress.address1;
  }
  let hasErrors = _.values(errors).reduce((l, r) => !!l || !!r);
  if (!hasErrors)
    return null;
  errors['any'] = true;
  return {postalAddress: errors};
}

class ContactFormContext {
  private content: Contact;
  private addressTypes: AddressType[];
  private contactTypes: ContactType[];
  private dateTypes: DateType[];
  private emailTypes: EmailType[];
  private phoneTypes: PhoneType[];

  private defaultAddressType: AddressType;
  private defaultContactType: ContactType;
  private defaultEmailType: EmailType;
  private defaultPhoneType: PhoneType;
  private anniversaryDateType: DateType;
  private birthdayDateType: DateType;
  private defaultAddress;
  private defaultEmail;
  private defaultPhone;
  private anniversary: ContactDate;
  private birthday: ContactDate;

  static createForContact(
      contactData$: Observable<object>, addressTypes$: Observable<AddressType[]>,
      contactTypes$: Observable<ContactType[]>, dateTypes$: Observable<DateType[]>,
      emailTypes$: Observable<EmailType[]>, phoneTypes$: Observable<PhoneType[]>
      ): Observable<ContactFormContext> {
    let retval = new Subject<ContactFormContext>();
    //noinspection JSIgnoredPromiseFromCall
    Observable.forkJoin(
          contactData$, addressTypes$, contactTypes$, dateTypes$,
          emailTypes$, phoneTypes$)
      .subscribe(results => {
        let result = new ContactFormContext();
        result.addressTypes = results[1];
        result.contactTypes = results[2];
        result.dateTypes = results[3];
        result.emailTypes = results[4];
        result.phoneTypes = results[5];
        result.defaultAddressType = _.head(result.addressTypes) || new AddressType();
        result.defaultContactType = _.head(result.contactTypes) || new ContactType();
        result.defaultEmailType = _.head(result.emailTypes) || new EmailType();
        result.defaultPhoneType = _.head(result.phoneTypes) || new PhoneType();
        result.anniversaryDateType = _.find(result.dateTypes, 'isAnniversary');
        result.birthdayDateType = _.find(result.dateTypes, 'isBirthday');
        result.resetFromContact(ContactService.newObject(results[0]));
        retval.next(result);
        retval.complete();
      });
    return retval;
  }

  resetFromContact(contact: Contact) {
    this.content = contact;
    this.defaultAddress = Object.assign(new DefaultAddressDetails(), contact.default_address_details || {});
    this.defaultEmail = Object.assign(new DefaultEmailDetails(), contact.default_email_details || {});
    this.defaultPhone = Object.assign(new DefaultPhoneDetails(), contact.default_phone_details || {});
    this.anniversary = _.find(contact.dates, item => {
        return item.date_type_details && item.date_type_details.slug === DATE_TYPE_ANNIVERSARY;
      }) || new ContactDate();
    this.birthday = _.find(contact.dates, item => {
        return item.date_type_details && item.date_type_details.slug === DATE_TYPE_BIRTHDAY;
      }) || new ContactDate();
  }

  applyToForm(form: FormGroup, extra?: object) {
    let value = Object.assign({
      firstName: this.content.first_name || '',
      lastName: this.content.last_name || '',
      email: this.defaultEmail.address || '',
      phone: this.defaultPhone.number || '',
      postalAddress: this.defaultAddress.toString(),
      anniversary: DatePickerValue.fromDateString(this.anniversary ? this.anniversary.date : '') || '',
      birthday: DatePickerValue.fromDateString(this.birthday ? this.birthday.date : '') || '',
    }, extra || {});
    form.setValue(value);
  }

  getFormSubmitValue(form: FormGroup): Contact {
    // make sure that existing array values are not truncated
    // remove duplicate values from the form data
    let shouldSubmitAddress = !!form.value.postalAddress && !!this.defaultAddressType;
    let newAddress = (form.value.postalAddress || '').trim().toLocaleLowerCase();
    let addresses: object[] = _(this.content.addresses)
      .reject(item => item.toString().toLocaleLowerCase() === newAddress)
      .value();
    if (shouldSubmitAddress) {
      let parsedAddress = BaseAddress.parse(form.value.postalAddress) || {};
      addresses.push(Object.assign(parsedAddress, {
        'default': true,
        visible: true,
        address_type: this.defaultAddressType.id
      }));
    }

    let dates: object[] = [];
    if (!!form.value.anniversary && !!this.anniversaryDateType)
      dates.push({
        date_type: this.anniversaryDateType.id,
        date: DatePickerValue.toDateString(form.value.anniversary),
        id: this.anniversary.id
      });
    if (!!form.value.birthday && !!this.birthdayDateType)
      dates.push({
        date_type: this.birthdayDateType.id,
        date: DatePickerValue.toDateString(form.value.birthday),
        id: this.birthday.id
      });

    // Make non-default all the emails currently present in the contact,
    // and set the value entered in the form field as the default one.
    let shouldSubmitEmail = !!form.value.email && !!this.defaultEmailType;
    let newEmail = (form.value.email || '').trim().toLocaleLowerCase();
    let emails: object[] = _(this.content.emails)
      .reject(item => item.address.trim().toLocaleLowerCase() === newEmail)
      .map(item => {
        return {
          // reset the `default` flag only of the form value isn't empty
          'default': !shouldSubmitEmail && item['default'],
          address: item.address,
          email_type: item.email_type,
          id: item.id
        };
      }).value();
    if (shouldSubmitEmail)
      emails.push({
        'default': true,
        address: form.value.email,
        email_type: this.defaultEmailType.id,
        id: this.defaultEmail.id
      });

    // Make non-default all the phone numbers currently present in the contact,
    // and set the value entered in the form field as the default one.
    let shouldSubmitPhone = form.value.phone && this.defaultPhoneType;
    let phones: object[] = _(this.content.phones)
      .reject(['number', form.value.phone])
      .map(item => {
        return {
          // reset the `default` flag only of the form value isn't empty
          'default': !shouldSubmitPhone && item['default'],
          number: item.number,
          phone_type: item.phone_type,
          id: item.id || null
        };
      }).value();
    if (shouldSubmitPhone)
      phones.push({
        'default': true,
        number: form.value.phone,
        phone_type: this.defaultPhoneType.id,
        id: this.defaultPhone.id
      });
    return Object.assign(new Contact(), this.content, {
      first_name: form.value.firstName,
      last_name: form.value.lastName,
      brands: [],
      contact_types: [],
      dates: dates,
      addresses: addresses,
      emails: emails,
      phones: phones,
      social_networks: []
    });
  }
}

@Injectable()
export class ContactsUiService {
  detailContent$: Observable<Contact>;
  masterContent$: Observable<ContactPageCursor>;
  addressTypes$: Observable<AddressType[]>;
  contactTypes$: Observable<ContactType[]>;
  dateTypes$: Observable<DateType[]>;
  emailTypes$: Observable<EmailType[]>;
  jobRoles$: Observable<JobRole[]>;
  phoneTypes$: Observable<PhoneType[]>;

  private masterViewContent = new Subject<ContactPageCursor>();
  private detailViewContent = new BehaviorSubject<Contact>(Contact.Empty);
  private addressTypesSubject = new AsyncSubject<AddressType[]>();
  private contactTypesSubject = new AsyncSubject<ContactType[]>();
  private dateTypesSubject = new AsyncSubject<DateType[]>();
  private emailTypesSubject = new AsyncSubject<EmailType[]>();
  private jobRolesSubject = new AsyncSubject<JobRole[]>();
  private phoneTypesSubject = new AsyncSubject<PhoneType[]>();
  private isLoading: boolean = false;
  private contactDialog: DialogRef<any>;

  static createContactBasicDetailsForm(): FormGroup {
    return new FormGroup({
      firstName: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(200)
      ])),
      lastName: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(200)
      ])),
      email: new FormControl('', Validators.compose([
        emailOrEmpty, Validators.maxLength(254)
      ])),
      phone: new FormControl('', Validators.compose([
        Validators.maxLength(30),
        CustomValidators.phone
      ])),
      postalAddress: new FormControl('', Validators.compose([
        postalAddressOrEmpty, Validators.maxLength(255)
      ])),
      birthday: new FormControl('', datePickerDateOrEmpty),
      anniversary: new FormControl('', datePickerDateOrEmpty),
    });
  }

  constructor(private alertify: AlertifyService,
              private addressTypeService: AddressTypeService,
              private contactService: ContactService,
              private emailTypeService: EmailTypeService,
              private flash: FlashMessageService,
              private jobRoleService: JobRoleService,
              private phoneTypeService: PhoneTypeService,
              private modal: Modal) {
    this.detailContent$ = this.detailViewContent.asObservable();
    this.masterContent$ = this.masterViewContent.asObservable();
    this.addressTypes$ = this.addressTypesSubject.asObservable();
    this.contactTypes$ = this.contactTypesSubject.asObservable();
    this.dateTypes$ = this.dateTypesSubject.asObservable();
    this.emailTypes$ = this.emailTypesSubject.asObservable();
    this.jobRoles$ = this.jobRolesSubject.asObservable();
    this.phoneTypes$ = this.phoneTypesSubject.asObservable();
    this.addressTypeService.getList()
      .map(response => _.map(response.results, AddressTypeService.newObject))
      .subscribe(this.addressTypesSubject);
    this.contactService.getRequestContactTypes()
      .map(results => _.map(results, item => Object.assign(new ContactType(), item)))
      .subscribe(this.contactTypesSubject);
    this.contactService.getDateTypes().subscribe(this.dateTypesSubject);
    this.emailTypeService.getList()
      .map(response => _.map(response.results, EmailTypeService.newObject))
      .subscribe(this.emailTypesSubject);
    this.jobRoleService.getList()
      .map(response => _.map(response.results, JobRoleService.newObject))
      .subscribe(this.jobRolesSubject);
    this.phoneTypeService.getList()
      .map(response => _.map(response.results, PhoneTypeService.newObject))
      .subscribe(this.phoneTypesSubject);
  }

  get detailContent(): Contact {
    return this.detailViewContent.value;
  }

  set detailContent(value: Contact) {
    this.detailViewContent.next(value);
  }

  createContactFormContext(contact$: Observable<object>): Observable<ContactFormContext> {
    return ContactFormContext.createForContact(
        contact$, this.addressTypes$, this.contactTypes$, this.dateTypes$,
        this.emailTypes$, this.phoneTypes$);
  }

  public displaySuccessMessage(message: string): void {
    this.flash.success(message);
  }

  public displayErrorMessage(message: string): void {
    this.flash.error(message);
  }

  public displayYesNoMessage(message: string): Observable<boolean> {
    let result = new Subject<boolean>();
    this.alertify.confirm(message,
      () => {
        result.next(true);
      },
      () => {
        result.next(false);
      });
    return result;
  }

  // prepareContent() {}
  // newObject(): Contact

  fetch(params: any = {}): void {
    this.isLoading = true;
    this.contactService.getList(params)
      .map(response => {
        return Object.assign(new ContactPageCursor(), {
          count: response.count,
          results: _.map(response.results, ContactService.newObject)
        });
      })
      .subscribe(response => {
        this.isLoading = false;
        this.masterViewContent.next(response);
      });
  }

  // selectedObjects: Contact[]

  // selectObjectById(id: number, forceRemote?: boolean) {
  //   this.contactService.getContact(id)
  //     .subscribe((contactData: object) => {
  //       this.detailContent = this.contactService.newObject(contactData);
  //     });
  // }

  public displayAddOrUpdateDialog(value?: Contact): Observable<Contact> {
    let result = new Subject<Contact>();
    if (this.contactDialog && !this.contactDialog.destroyed) {
      this.contactDialog.destroy();
      this.contactDialog = null;
    }

    let config = overlayConfigFactory({content: value}, ContactDialogContext);
    this.modal.open(ContactDialogComponent, config)
      .then(dialog => {
        this.contactDialog = dialog;
        dialog.result.then(data => {
          result.next(data);
          result.complete();
        }, () => { result.complete(); });
      }, () => { result.complete(); });
    return result;
  }

  public createLead() {}

  public archiveContacts(contacts: Contact[]) {
  }

  public disableContacts(contacts: Contact[]) {
  }

  public enableContacts(contacts: Contact[]) {
  }

  public exportContacts(contacts: Contact[] /*, format?: ExportContactFormat*/) {
  }

  // TODO: selection management

  // TODO: search and sorting management

  // TODO: pagination management

}
