import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild,
  DoCheck,
  ViewChildren,
  QueryList }                         from '@angular/core';
import { Router, ActivatedRoute }     from '@angular/router';
import { Observable }                 from 'rxjs/Observable';
/* Services */
import { FlashMessageService }        from '../../../services/flash-message';
import { ContactService }             from '../../../services/contact/contact.service';
import { PhoneService }               from '../../../services/phone/phone.service';
import { PhoneTypeService }           from '../../../services/phone-type/phone-type.service';
import { EmailService }               from '../../../services/email/email.service';
import { EmailTypeService }           from '../../../services/email-type/email-type.service';
import { AddressService }             from '../../../services/address/address.service';
import { AddressTypeService }         from '../../../services/address-type/address-type.service';
import { SocialNetworkService }       from '../../../services/social-network/social-network.service';
import { CustomFieldService }         from '../../../services/custom-field/custom-field.service';
import { BreadcrumbService }          from '../../../components/shared/breadcrumb/components/breadcrumb.service';
import { NgForm }                     from '@angular/forms';
/* Components */
import { FormFieldComponent }         from '../../shared/form-field/form-field.component';
import { FormFieldAddressComponent }  from '../../shared/form-field-address/form-field-address.component';
import { FilterSelectComponent }      from '../../shared/filter-select/filter-select.component';
/* Models */
import { Contact }                    from '../../../models/contact';
import { Email }                      from '../../../models/email';
import { Phone }                      from '../../../models/phone';
import { Address }                    from '../../../models/address';
import { CustomField }                from '../../../models/custom-field';
import { SocialNetwork }              from '../../../models/social-network';
import { ContactDate }                from '../../../models/contact-date';
/* Directives */
import { ImageResult, ResizeOptions } from '../../shared/image-upload/interfaces';
import { FileUploader }               from 'ng2-file-upload';
declare let require: (any);

const uploadURL = '';

@Component({
  selector: 'contacts-edit',
  templateUrl: 'contacts-edit.component.html',
  styleUrls: ['contacts-edit.component.scss'],
  providers: [PhoneService, PhoneTypeService, EmailService, EmailTypeService, AddressService, AddressTypeService,
    SocialNetworkService, CustomFieldService]
})
export class ContactsEditComponent {
  @Input() id;
  @Input() redirectTo: string = 'dashboard';
  @Output() closeModal = new EventEmitter();
  @ViewChild('newPhone') newPhone: FormFieldComponent;
  @ViewChild('newEmail') newEmail: FormFieldComponent;
  @ViewChild('newCustom1') newCustom1: FormFieldComponent;
  @ViewChild('newCustom2') newCustom2: FormFieldComponent;
  @ViewChild('newAddress') newAddress: FormFieldAddressComponent;
  @ViewChild('contactType') contactType: FilterSelectComponent;
  @ViewChild('birthdayDateRef') birthdayDateRef: any;
  @ViewChild('anniversaryDateRef') anniversaryDateRef: any;
  @ViewChildren(FormFieldComponent) formFields: QueryList<FormFieldComponent>;
  @ViewChildren(FormFieldAddressComponent) formAddresses: QueryList<FormFieldAddressComponent>;

  public _ = require('../../../../../node_modules/lodash');
  public src: string = 'assets/img/avatar.png';
  public resizeOptions: ResizeOptions = {
    resizeMaxHeight: 150,
    resizeMaxWidth: 150
  };
  public uploader: FileUploader = new FileUploader({ url: uploadURL });
  public hasBaseDropZoneOver: boolean = false;
  public contactTypesSelected: Array<any> = [];
  private alertify = require('../../../assets/theme/assets/vendor/alertify-js/alertify.js');
  private isLoading: boolean = false;
  private componentRef;
  private response: string = '';
  private model = new Contact();
  private mainPhone = new Phone();
  private phoneModel = new Phone();
  private mainEmail = new Email();
  private emailModel = new Email();
  private mainAddress = new Address();
  private addressModel = new Address();
  private customFieldModel = new CustomField();
  private contacts: Contact[];
  private router: Router; // Router object, with this we can call navigate function.
  private activatedRoute: ActivatedRoute; // Routes url params extractor.
  private selectedClass: string = 'icon fa-star light-blue-sq';
  private notSelectedClass: string = 'icon fa-star-o light-blue-sq';
  private paramsSub: any;
  private showNewFieldsSection = false;
  private showNewAddressSection = false;
  private selectedFieldType: string = null;
  private phoneTypes: Array<any> = [];
  private selectedPhoneType = null;
  private emailTypes: Array<any> = [];
  private selectedEmailType = null;
  private addressTypes: Array<any> = [];
  private selectedAddressType = null;
  private contactFacebook = new SocialNetwork();
  private contactInstagram = new SocialNetwork();
  private contactTwitter = new SocialNetwork();
  private contactWebSite = new SocialNetwork();
  private contactTypes = [];
  private contactTypesList = [];
  private filename: string;
  private filesLenght: number = 0;
  private fileDraged: any = undefined;
  private birthdayDate = new ContactDate();
  private anniversaryDate = new ContactDate();
  private myDatePickerOptions = {
    dateFormat: 'mm/dd/yyyy',
    showTodayBtn: false,
    showSelectorArrow: false,
  };
  private modelbirthdayDate: Object = { };
  private modelanniversaryDate: Object = { };
  private indexPhone: number = 0;
  private indexAddress: number = 0;
  private indexEmail: number = 0;
  private idAnniversary: number = -1;
  private idBirthday: number = -1;
  private invalidBirthday: boolean = false;
  private invalidAnniversary: boolean = false;
  private oldBirthday: any;
  private oldAnniversary: any;
  private datepickerRefB: any;
  private datepickerRefA: any;
  private checkContentWidth: boolean = true;
  /* image upload component */
  selected(imageResult: ImageResult) {
    this.src = imageResult.resized && imageResult.resized.dataURL || imageResult.dataURL;
  }
  /* image upload component end */

  constructor(
    private breadcrumbService: BreadcrumbService,
    private contactService: ContactService,
    private phoneService: PhoneService,
    private phoneTypeService: PhoneTypeService,
    private emailService: EmailService,
    private emailTypeService: EmailTypeService,
    private addressService: AddressService,
    private addressTypeService: AddressTypeService,
    private socialNetworkService: SocialNetworkService,
    private customFieldService: CustomFieldService,
    private flash: FlashMessageService,
    _router: Router,
    activatedRoute: ActivatedRoute
  ) {
  this.router = _router;
    this.activatedRoute = activatedRoute;
    breadcrumbService.addFriendlyNameForRoute('/contacts/edit', 'Edit');
  }

  /**
   * Initialize
   * https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html
   */
  ngOnInit() {
    this.isLoading = true;
    /* Set alertify theme */
    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');

    this.model = new Contact();
    // get types to show on selectors
    this.phoneTypeService.getList()
      .subscribe(types => {
        this.phoneTypes = types.results;
        if (this.phoneTypes.length > 0) {
          this.mainPhone.phone_type = this.phoneTypes[0].id;
          this.phoneModel.phone_type = this.phoneTypes[0].id;
        }
      });
    this.emailTypeService.getList()
      .subscribe(types => {
        this.emailTypes = types.results;
        if (this.emailTypes.length > 0) {
          this.mainEmail.email_type = this.emailTypes[0].id;
          this.emailModel.email_type = this.emailTypes[0].id;
        }
      });
    this.addressTypeService.getList()
      .subscribe(types => {
        this.addressTypes = types.results;
        if (this.addressTypes.length > 0) {
          this.mainAddress.address_type = this.addressTypes[0].id;
          this.selectedAddressType = this.addressTypes[0].id;
          this.addressModel.address_type = this.addressTypes[0].id;
        }
      });

    if (this.id !== undefined) {
      this.isLoading = true;
      this.model.id = this.id; // Add id (Primary Key [pk]) to the form in order to get the pk on update.
      this.contactService.getContact(this.id)
        .subscribe(contactData => {
          if (contactData.active === false || contactData.archived === true) {
            this.flash.error('The contact you are trying to access does not exist.');
            this.cancel();
          }
          this.model = contactData;
          // check if there is a phone, address, email to show on the default inputs (not on iteration fields)
          if ( this.model.phones.length > 0 ) {
            for ( let i = 0; i < this.model.phones.length; i++ ) {
              this.model.phones[i].isLoading = false;
              if (+this.model.default_phone === this.model.phones[i].id) {
                this.indexPhone = i;
                let newMainPhone = this.model.phones[i] as Phone;
                this.mainPhone = newMainPhone;
              }
            }
            if (this.mainPhone.id) {
              this.model.phones.splice(this.indexPhone, 1);
            }
          }
          if ( this.model.emails.length > 0 ) {
            for (let i = 0; i < this.model.emails.length; i++) {
              this.model.emails[i].isLoading = false;
              if (+this.model.default_email === this.model.emails[i].id) {
                this.indexEmail = i;
                let newMainEmail = this.model.emails[i] as Email;
                this.mainEmail = newMainEmail;
              }
            }
            if (this.mainEmail.id) {
              this.model.emails.splice(this.indexEmail, 1);
            }
          }
          if (this.model.addresses.length > 0) {
            for ( let i = 0; i < this.model.addresses.length; i++ ) {
              this.model.addresses[i].isLoading = false;
              if (+this.model.default_address === this.model.addresses[i].id) {
                this.indexAddress = i;
                let newMainAddress = this.model.addresses[i] as Address;
                this.mainAddress = newMainAddress;
              }
            }
            if (this.mainAddress.id) {
              this.model.addresses.splice(this.indexAddress, 1);
            }
          }

          // check social networks
          if (this.model.social_networks.length > 0) {
            for (let social of this.model.social_networks) {
              let newSocial = social as SocialNetwork;
              newSocial.isLoading = false;
              switch (newSocial.network.toLowerCase()) {
                case 'facebook':
                  this.contactFacebook = newSocial;
                  break;
                case 'twitter':
                  this.contactTwitter = newSocial;
                  break;
                case 'instagram':
                  this.contactInstagram = newSocial;
                  break;
                case 'website':
                  this.contactWebSite = newSocial;
                  break;
                default:
                  break;
              }
            }
          }

          // check dates
          if (this.model.dates.length > 0) {
            for (let d of this.model.dates) {
              let date = d as ContactDate;
              // As the date was created with 00:00:00 hrs, 'T23:59:59Z' is added to avoid the timezone difference issues
              if (date.date_type === 1) {
                this.idBirthday = date.id;
                this.birthdayDate = date;
                this.birthdayDate['$date'] = new Date(date.date.toString() + 'T23:59:59Z');
                this.modelbirthdayDate = {
                    date: {
                        year: this.birthdayDate['$date'].getFullYear(),
                        month: this.birthdayDate['$date'].getMonth() + 1,
                        day: this.birthdayDate['$date'].getDate()
                    }
                };
                this.oldBirthday = this._.cloneDeep(this.modelbirthdayDate);
              } else if (date.date_type === 2) {
                this.idAnniversary = date.id;
                this.anniversaryDate = date;
                this.anniversaryDate['$date'] = new Date(date.date.toString() + 'T23:59:59Z');
                this.modelanniversaryDate = {
                    date: {
                        year: this.anniversaryDate['$date'].getFullYear(),
                        month: this.anniversaryDate['$date'].getMonth() + 1,
                        day: this.anniversaryDate['$date'].getDate()
                    }
                };
                this.oldAnniversary = this._.cloneDeep(this.modelanniversaryDate);
              }
            }
          }
          this.isLoading = false;
        }, err => {
          this.isLoading = false;
          this.flash.error('The contact you are trying to access does not exist.');
          this.cancel();
        });
    } else {
      console.error('Undefined Contact Id');
      this.isLoading = false;
    }
    this.getContactTypes();
  }

  ngDoCheck() {
    if (this.checkContentWidth) {
      this.getModalContentWidth();
    }
  }
  /**
   * Gets the width from modal-content div, and assign it to the footer bar
   */
  getModalContentWidth() {
    let content = document.getElementById('modal-content');
    let width = null;
    if (content) {
      width = content.offsetWidth;
      if (width > 0) {
        let buttonsContainer = document.getElementById('buttons-container');
        if (buttonsContainer) {
          buttonsContainer.style.width = (width - 60).toString() + 'px';
          this.checkContentWidth = false;
        }
      }
    }
  }

  /**
   * Gets contact types from contact service
   */
  getContactTypes() {
    this.isLoading = true;
    let types = this.contactService.getContactTypes();
    if (types.length !== 0) {
      let auxTypes = [];
      for (let type of types) {
        auxTypes.push({ value: String(type.id), label: type.name, selected: false });
      }
      this.contactTypesList = auxTypes;
    } else {
      this.contactService.getRequestContactTypes()
        .subscribe(iTypes => {
          let auxTypes = [];
          for (let type of iTypes) {
            auxTypes.push({ value: String(type.id), label: type.name, selected: false });
          }
          this.contactTypesList = auxTypes;
          this.isLoading = false;
        });
    }
  }
  /**
   * Function when contact type is added on selector
   * @param {any} option [added element]
   */
  addSelectedContactType(option) {
  }
  /**
   * Function when contact type is removed on selector
   * @param {any} option [removed element]
   */
  removeSelectedContactType(option) {
  }
  /**
   * Delete date
   * @param {date} date [Date to delete]
   * @param {string} name [Field name]
   */
  onDeleteDate(dateId: number, name: string, confirm?) {
    if (dateId !== -1) {
     let $this = this;
     this.invalidBirthday = false;
     this.invalidAnniversary = false;
      this.contactService.deleteContactDate(dateId)
      .subscribe(data => {
       if (name === 'birthday') {
        this.idBirthday = -1;
        this.modelbirthdayDate = {};
        this.birthdayDate = new ContactDate();
        } else {
          this.idAnniversary = -1;
          this.modelanniversaryDate = {};
          this.anniversaryDate = new ContactDate();
        }
        $this.flash.success('The date has been deleted.');
      },
      err => {
        $this.flash.error('An error has occurred deleting the date, please try again later.');
      });
    }
  }

  /**
   * Focus on datepicker when its span is clicked
   * @param {string} datepickerId [datepicker to set focus on]
   */
  public focusDatepicker(datepickerId: string) {
  }

  /**
   * Function to assign each property to Angular2 model.
   * @param {Object} contactDataMapped [description]
   */
  assignToModel(contactDataMapped: any) {
    for (let item of contactDataMapped) {
      this.model[item] = item;
    }
  }
  /**
   * Destroy
   * https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html
   */
  ngOnDestroy() {
    this.id = null;
    this.model = new Contact();
    this.mainPhone = new Phone();
    this.mainEmail = new Email();
    this.mainAddress = new Address();
    this.contactFacebook = new SocialNetwork();
    this.contactInstagram = new SocialNetwork();
    this.contactTwitter = new SocialNetwork();
    this.contactWebSite = new SocialNetwork();
  }

  /**
   * Function to update a contact.
   */
  updateContact() {
    let errors = false;
    let firstField = null;
    let firstAddressField = null;
    let multiselectError = false;

    // close new fields section and new address section to skip their validation
    if (this.showNewFieldsSection) {
      this.toggleNewFieldsSection();
    }
    if (this.showNewAddressSection) {
      this.toggleNewAddressSection();
    }

    // validate Contact Type
    if (!this.contactType.getErrors()) {
      errors = true;
      multiselectError = true;
    }
    // validate all Form Fields
    // @@ check how to use FormBuilder, FormControl, FormValidation on components
    let fields = this.formFields.toArray();
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].getErrorsFromParent()) {
        if (!firstField) {
          firstField = fields[i] as FormFieldComponent;
        }
        errors = true;
      }
    }
    // validate all Addresses (each of their fields)
    let addresses = this.formAddresses.toArray();
    for (let i = 0; i < addresses.length; i++) {
      let aux = addresses[i].getErrorsFromParent();
      if (aux && !firstAddressField) {
        firstAddressField = aux;
        errors = true;
      }
    }
    // validate dates
    if (this.invalidAnniversary || this.invalidBirthday) {
       errors = true;
    }
    // check the first field with error to set focus on
    if (errors) {
      if (multiselectError) {
        this.contactType.focusSelector();
        return;
      } else if (firstField) {
        firstField.onSpanClick();
        return;
      } else if (firstAddressField) {
        firstAddressField.onSpanClick();
        return;
      } else {
        if (this.invalidBirthday) {
            this.flash.error('Please, enter a valid birthday date');
            this.invalidBirthday = false;
            this.datepickerRefB.setDate(this.oldBirthday);
        } else {
            this.flash.error('Please, enter a valid anniversary date');
            this.invalidAnniversary = false;
            this.datepickerRefA.setDate(this.oldAnniversary);
        }
        return;
      }
    }

    this.isLoading = true;

    let phonesList = this.getPhones();
    let emailsList = this.getEmails();
    let addressesList = this.getAddresses();
    let socialNetworksList = this.getSocialNetworks();
    let datesList = this.getDates();
    let minData = {
      'id': this.model.id,
      'first_name': (this.model.first_name) ? this.model.first_name.toLowerCase() : undefined,
      'last_name': (this.model.last_name) ? this.model.last_name.toLowerCase() : undefined,
      'maiden_name': (this.model.maiden_name) ? this.model.maiden_name.toLowerCase() : undefined,
      'emails': emailsList,
      'phones': phonesList,
      'addresses': addressesList,
      'social_networks': socialNetworksList,
      'dates': datesList,
      'contact_types': this.model.contact_types
    };

    this.contactService.update(minData)
      .subscribe(data => {
        this.response = data;
        this.flash.success('The contact has been updated.');
        let url = localStorage.getItem('currentUrl');
        this.closeModal.emit({ action: 'close-modal' });
        if (url && url !== undefined && url !== null) {
          this.router.navigate([url]);
        }
      },
      err => {
        this.flash.error('An error has occurred updating the contact, please try again later.');
      },
      () => {
        this.isLoading = false;
      }
      );
  }

  /**
   * Move this function to general functions.
   * @param {string} param url to navigate to.
   */
  public navigateTo(param) {
    this.router.navigate([param]);
  }

  /**
   * Show section to add new fields
   */
  public toggleNewFieldsSection() {
    this.showNewFieldsSection = !this.showNewFieldsSection;
    if (this.showNewFieldsSection) {
      this.selectedFieldType = 'phone';
    } else {
      this.phoneModel = new Phone();
      this.emailModel = new Email();
      this.addressModel = new Address();
    }
  }

  /**
   *  Show section to add a new address
   *
   */
  public toggleNewAddressSection() {
    this.showNewAddressSection = !this.showNewAddressSection;
    this.addressModel = new Address();
    this.newAddress.getErrorsFromParent();
  }

  /**
   *  Get type name of selected type
   *
   */
  public getFieldTypeName() {
    return this.selectedFieldType.toUpperCase();
  }

  /**
   *  Add new contact field
   *
   */
  public addNewField() {
    switch (this.selectedFieldType) {
      case 'phone':
        this.addNewPhone();
        break;
      case 'email':
        this.addNewEmail();
        break;
      default:
        break;
    }
  }

  /**
   * Add the new phone to the contact fields
   *
   */
  public addNewPhone() {
    if (this.newPhone && this.newPhone.getErrorsFromParent()) {
      this.newPhone.onSpanClick();
      return;
    }
    // check if the main phone is completed
    if (this.mainPhone.number !== undefined && this.mainPhone.number !== '') {
      if (this.selectedPhoneType) {
        this.phoneModel.phone_type = this.selectedPhoneType;
      } else if (this.phoneTypes.length > 0) {
        this.phoneModel.phone_type = this.phoneTypes[0].id;
      }
      this.phoneModel.visible = true;
      this.model.phones.push(this.phoneModel);
      this.phoneModel = new Phone();
    } else {
      this.flash.error('Please, you need to complete main phone information');
    }
    this.toggleNewFieldsSection();
  }

  /**
   * Add the new email address to the contact fields
   *
   */
  public addNewEmail() {
    if (this.newEmail && this.newEmail.getErrorsFromParent()) {
      this.newEmail.onSpanClick();
      return;
    }
    if (this.mainEmail.address !== undefined && this.mainEmail.address !== '') {
      if (this.selectedEmailType) {
        this.emailModel.email_type = this.selectedEmailType;
      } else if (this.emailTypes.length > 0) {
        this.emailModel.email_type = this.emailTypes[0].id;
      }
      this.emailModel.visible = true;
      this.model.emails.push(this.emailModel);
      this.emailModel = new Email();
    } else {
      this.flash.error('Please, you need to complete main email information');
    }
    this.toggleNewFieldsSection();
  }

  /**
   * Add the new address to the contact fields
   *
   */
  public addNewAddress() {
    if (this.newAddress) {
      let field = this.newAddress.getErrorsFromParent();
      if (field) {
        field.onSpanClick();
        return;
      }
    }
    if (this.mainAddress.address1 !== undefined && this.mainAddress.address1 !== '') {
      if (this.addressModel.address1 !== undefined && this.addressModel.address1 !== '') {
        this.addressModel.visible = true;
        this.model.addresses.push(this.addressModel);
        this.addressModel = new Address();
        this.toggleNewAddressSection();
      } else {
        this.flash.error('Please, complete new address information');
      }
    } else {
      this.flash.error('Please, you need to complete main address information');
    }
  }

  /**
   * Returns the contact phones with main phone on it
   *
   */
  public getPhones() {
    let phonesList = this._.cloneDeep(this.model.phones);
    // check if there is a main phone
    if (this.mainPhone.number) {
      this.mainPhone['default'] = true;
      phonesList.push(this.mainPhone);
    }
    return phonesList;
  }

  /**
   * Returns the contact emails with main email on it
   *
   */
  public getEmails() {
    let emailsList = this._.cloneDeep(this.model.emails);
    // check if there is a main email
    if (this.mainEmail.address && this.mainEmail.address !== '') {
      this.mainEmail['default'] = true;
      emailsList.push(this.mainEmail);
    }
    return emailsList;
  }

  /**
   * Returns the contact addresses with main address on it
   *
   */
  public getAddresses() {
    let addressesList = this._.cloneDeep(this.model.addresses);
    // check if there is a main address
    if (this.mainAddress.address1 && this.mainAddress.address1 !== '') {
      this.mainAddress['default'] = true;
      addressesList.push(this.mainAddress);
    }
    return addressesList;
  }

  /**
   * Returns the contact social list
   *
   */
  public getSocialNetworks() {
    let socialList = [];
    if (this.contactFacebook) {
      if (this.contactFacebook.network_id) {
        this.contactFacebook.network = 'facebook';
        this.contactFacebook.person = this.model.id;
        this.contactFacebook.visible = true;
        socialList.push(this.contactFacebook);
      }
    }
    if (this.contactTwitter) {
      if (this.contactTwitter.network_id) {
        this.contactTwitter.network = 'twitter';
        this.contactTwitter.person = this.model.id;
        this.contactTwitter.visible = true;
        socialList.push(this.contactTwitter);
      }
    }
    if (this.contactInstagram) {
      if (this.contactInstagram.network_id) {
        this.contactInstagram.network = 'instagram';
        this.contactInstagram.person = this.model.id;
        this.contactInstagram.visible = true;
        socialList.push(this.contactInstagram);
      }
    }
    if (this.contactWebSite) {
      if (this.contactWebSite.network_id) {
        let web = this.contactWebSite.network_id;
        if (!(web.substring(0, 7) === 'http://' || web.substring(0, 8) === 'https://')) {
           this.contactWebSite.network_id = 'http://' + web;
        }
        this.contactWebSite.network = 'website';
        this.contactWebSite.person = this.model.id;
        this.contactWebSite.visible = true;
        socialList.push(this.contactWebSite);
      }
    }

    return socialList;
  }

  /**
   * Get contact dates to save
   *
   */
  public getDates() {
    let datesList = [];
    if (this.modelbirthdayDate !== undefined && this.modelbirthdayDate['jsdate']) {
      this.birthdayDate.date = this.modelbirthdayDate['jsdate'];
      this.birthdayDate.date_type = 1;
      let birthday = this._.cloneDeep(this.birthdayDate);
      birthday.date = birthday.date.toISOString().slice(0, 10);
      datesList.push(birthday);
    }
    if (this.modelanniversaryDate !== undefined && this.modelanniversaryDate['jsdate']) {
      this.anniversaryDate.date = this.modelanniversaryDate['jsdate'];
      this.anniversaryDate.date_type = 2;
      let anniversary = this._.cloneDeep(this.anniversaryDate);
      anniversary.date = anniversary.date.toISOString().slice(0, 10);
      datesList.push(anniversary);
    }
    return datesList;
  }

  /**
   * Handle when a file is over the drop zone
   * @param {any} e [description]
   */
  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
    if (!e) {
      this.addImageFile();
    }
  }

  /**
   * Close modal without saving modifications
   *
   */
  public cancel() {
    let url = localStorage.getItem('currentUrl');
    this.closeModal.emit({ action: 'close-modal' });
    if (url && url !== undefined && url !== null) {
      this.router.navigate([url]);
    }
  }

  /**
   * Set parent component ref
   * @param {[type]} ref [reference od parent component object]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }

  /**
   * Add "selected" class to span when input has focus
   */
  public addSelectedClass(groupId: string) {
    let inputGroup = document.getElementById(groupId);
    inputGroup.classList.add('input-group-focused');
  }
  /**
   * Remove "selected" class to span when input lost focus
   */
  public removeSelectedlass(groupId: string) {
    let selectGroup = document.getElementById(groupId);
    selectGroup.classList.remove('input-group-focused');
  }
  /**
   * Set focus to element
   */
  public setFocus(elementId: string) {
    let element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  }

  private getAddressTypeName(id: number) {
    for (let type of this.addressTypes) {
      if (type.id === id) {
        return type.name;
      }
    }
    return '';
  }

  /**
   * Add and generate the image file
   */
  private addImageFile() {
    if (this.uploader.queue.length > 0) {
      // remove other files, leave the last element
      if (this.uploader.queue.length > 1) {
        this.uploader.queue.splice(0, this.uploader.queue.length - 1);
      }
      // validate that file is an image
      let type: string = this.uploader.queue[this.uploader.queue.length - 1].file.type;
      if (type.indexOf('image') !== -1) {
        this.filename = this.uploader.queue[this.uploader.queue.length - 1].file.name;
        // Pass file object to image uploader component
        this.fileDraged = this.uploader.queue[this.uploader.queue.length - 1]._file;
      } else {
        // delete last image and display message
        this.uploader.queue.splice(0, 1);
        this.filename = undefined;
        // console.info('is not an image');
        this.fileDraged = undefined;
      }
      this.filesLenght = this.uploader.queue.length;
    }
  }
  /**
   * [openDialogBox description]
   * @param {any} e [description]
   */
  private openDialogBox(e: any) {
    document.getElementById('img-upload-input').click();
  }

  /**
   * Function triggered when contact fields (phones, emails, addresses, social) are deleted
   * @param {any} e [event]
   * @param {string} service [field type to delete]
   * @param {string} field [field type to delete]
   * @param {any} elem [element position (number) on array if it isn't the main field. else main field is deleted]
   */
  private onDelete(e: any, service: string, arrayName: string, elem: any, confirm?) {
    if (typeof elem === 'number') {
      if (this.model[arrayName][elem] && this.model[arrayName][elem].hasOwnProperty('id')) {
        let $this = this;
        if (confirm === false) {
          $this.deleteElemOnAPI(service, arrayName, elem, false, false);
        } else {
          this.alertify.confirm(
            'Are you sure that you want to perform this action? It is not reversible.',
            () => {
              $this.deleteElemOnAPI(service, arrayName, elem, false);
            });
        }
      } else {
        this.model[arrayName].splice(elem, 1);
      }
    } else {
      if (elem.hasOwnProperty('id')) {
        let $this = this;
        if (confirm === false) {
          $this.deleteElemOnAPI(service, arrayName, elem, true, false);
        } else {
          this.alertify.confirm(
            'Are you sure that you want to perform this action? It is not reversible.',
            () => {
              $this.deleteElemOnAPI(service, arrayName, elem, true);
            });
        }
      } else {
          this.replaceMainData(elem, arrayName, true);
      }
    }
  }
  /**
   * [changeEmpty description]
   * @param {any}    e         [description]
   * @param {string} service   [description]
   * @param {string} arrayName [description]
   * @param {any}    elem      [description]
   */
  private changeEmpty(e: any, service: string, arrayName: string, elem: any) {
    if (e !== undefined) {
       if (e.target.value !== undefined && (e.target.value === '' || /^\s+$/.test(e.target.value))) {
        this.onDelete(e, service, arrayName, elem, false);
      }
    }
  }

  /**
   * Function to delete contact fields (phones, emails, addresses, social) from API
   * @param {string} service [field type to delete]
   * @param {string} field [field type to delete]
   * @param {any} elem [element position (number) on array if it isn't the main field. else main field is deleted]
   */
  private deleteElemOnAPI(service: string, arrayName: string, elem: any, mainData: boolean, refresh?) {
    let response = null;
    if (!mainData) {
      if (this.model[arrayName][elem].hasOwnProperty('isLoading')) { this.model[arrayName][elem].isLoading = true; }
      this[service].delete(this.model[arrayName][elem].id)
        .subscribe(res => {
          response = res;
          this.flash.success('The field has beed deleted.');
        },
        err => {
          this.flash.error('An error has occurred deleting the field, please try again later.');
        },
        () => {
          if (this.model[arrayName][elem]['isLoading'] !== undefined) { this.model[arrayName][elem]['isLoading'] = false; }
          if (response) {
            this.model[arrayName].splice(elem, 1);
          }
        }
      );
    } else {
      if (elem['isLoading'] !== undefined) { elem['isLoading'] = true; }
      this[service].delete(elem['id'])
        .subscribe(res => {
          response = res;
          this.flash.success('The field has beed deleted.');
          this.replaceMainData(elem, arrayName, mainData);
        },
        err => {
          this.flash.error('An error has occurred deleting the field, please try again later.');
        },
        () => { if (elem['isLoading'] !== undefined) { elem['isLoading'] = false; } }
      );
    }
  }

  /**
   * Function to delete contact fields (phones, emails, addresses, social) from API
   * @param {string} service [field type to delete]
   * @param {string} field [field type to delete]
   * @param {any} elem [element position (number) on array if it isn't the main field. else main field is deleted]
   */
  private replaceMainData(elem: any, arrayName: string, mainData: boolean) {
    switch (arrayName) {
      case 'phones':
       if (mainData === true) {
           if (this.model[arrayName] !== undefined && this.model[arrayName][0] === undefined) {
              this.mainPhone = new Phone;
              this.mainPhone.phone_type = 1;
              this.mainPhone.number = '';
            } else {
              this.contactService.setDefaultPhone(this.model.id, this.model[arrayName][0].id)
              .subscribe(data => {});
              this.mainPhone = this.model[arrayName][0];
              this.model[arrayName].splice(0, 1);
            }
          } else {
            this.mainPhone.number = '';
          }
        break;
      case 'emails':
       if (mainData === true) {
         if (this.model[arrayName] !== undefined && this.model[arrayName][0] === undefined) {
            this.mainEmail = new Email;
            this.mainEmail.email_type = 1;
          } else {
            this.contactService.setDefaultEmail(this.model.id, this.model[arrayName][0].id)
            .subscribe(data => {});
            this.mainEmail = this.model[arrayName][0];
            this.model[arrayName].splice(0, 1);
          }
        } else {
          this.mainEmail.address = '';
        }
        break;
      case 'addresses':
       if (mainData === true) {
          if (this.model[arrayName] !== undefined && this.model[arrayName][0] === undefined) {
            this.mainAddress = new Address;
            this.mainAddress.country = 'US';
            this.mainAddress.address_type = 1;
          } else {
             this.contactService.setDefaultAddress(this.model.id, this.model[arrayName][0].id)
             .subscribe(data => {});
             this.mainAddress = this.model[arrayName][0];
             this.model[arrayName].splice(0, 1);
          }
        } else {
          this.mainAddress.address1 = '';
          this.mainAddress.address2 = '';
          this.mainAddress.city = '';
          this.mainAddress.state = '';
          this.mainAddress.zip = '';
        }
        break;
      case 'social_networks':
        switch (elem.network) {
          case 'facebook':
            this.contactFacebook = new SocialNetwork;
            break;
          case 'twitter':
            this.contactTwitter = new SocialNetwork;
            break;
          case 'instagram':
            this.contactInstagram = new SocialNetwork;
            break;
          case 'website':
            this.contactWebSite = new SocialNetwork;
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }
  /**
   * Puts as invalid a date (birthday or anniversary)
   */
  private setInvalidDate(e: any, name: string) {
    if (name === 'birthday' && this.checkExistingDate(1)) {
      this.invalidBirthday = true;
      this.datepickerRefB = e.ref;
    }
    if (name === 'anniversary' && this.checkExistingDate(2)) {
      this.invalidAnniversary = true;
      this.datepickerRefA = e.ref;
    }
  }
  /**
   * Checks if the contact already has a saved date from given type
   */
  private checkExistingDate(typeId: number) {
    for (let d of this.model.dates) {
      let date = d as ContactDate;
      if (date.date_type === typeId) {
        return true;
      }
    }
    return false;
  }
}
