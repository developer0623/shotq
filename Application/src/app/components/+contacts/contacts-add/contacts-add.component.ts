/**
 * Component ContactsAddComponent
 */
import {
  Component,
  OnInit,
  ViewChild,
  ViewChildren,
  OnChanges,
  OnDestroy,
  SimpleChange,
  QueryList,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  DoCheck }                             from '@angular/core';
import { Router }                       from '@angular/router';
import { NgForm }                       from '@angular/forms';
/* Services */
import { FlashMessageService }          from '../../../services/flash-message';
import { ContactService }               from '../../../services/contact/contact.service';
import { PhoneService }                 from '../../../services/phone/phone.service';
import { PhoneTypeService }             from '../../../services/phone-type/phone-type.service';
import { EmailService }                 from '../../../services/email/email.service';
import { EmailTypeService }             from '../../../services/email-type/email-type.service';
import { AddressService }               from '../../../services/address/address.service';
import { AddressTypeService }           from '../../../services/address-type/address-type.service';
import { SocialNetworkService }         from '../../../services/social-network/social-network.service';
import { CustomFieldService }           from '../../../services/custom-field/custom-field.service';
import { ModalService }                 from '../../../services/modal/';
import { BreadcrumbService }            from '../../../components/shared/breadcrumb/components/breadcrumb.service';
import { GeneralFunctionsService }      from '../../../services/general-functions';
/* Components */
import { FormFieldAddressComponent }    from '../../shared/form-field-address/form-field-address.component';
import { FormFieldComponent }           from '../../shared/form-field/form-field.component';
import { FileUploader }                 from 'ng2-file-upload';
import { FilterSelectComponent }        from '../../shared/filter-select/filter-select.component';
/* Models */
import { Contact }                      from '../../../models/contact';
import { Email }                        from '../../../models/email';
import { Phone }                        from '../../../models/phone';
import { Address }                      from '../../../models/address';
import { CustomField }                  from '../../../models/custom-field';
import { SocialNetwork }                from '../../../models/social-network';
import { ContactDate }                  from '../../../models/contact-date';
/* Directives */
import { ImageResult, ResizeOptions }   from '../../shared/image-upload/interfaces';
const uploadURL = '';
/* Modules */
import { StepZeroModule }               from '../import-csv/step-zero/step-zero.module';
declare let require: (any);

@Component({
  selector: 'contacts-add',
  templateUrl: 'contacts-add.component.html',
  styleUrls: ['contacts-add.component.scss'],
  providers: [PhoneService, PhoneTypeService, EmailService, EmailTypeService, AddressService,
  AddressTypeService, SocialNetworkService, CustomFieldService]
})
export class ContactsAddComponent {
  @Input() redirectTo: string = 'dashboard';
  @Output() closeModal = new EventEmitter();
  /* image upload component */
  @ViewChild('newPhone') newPhone: FormFieldComponent;
  @ViewChild('newEmail') newEmail: FormFieldComponent;
  @ViewChild('newCustom1') newCustom1: FormFieldComponent;
  @ViewChild('newCustom2') newCustom2: FormFieldComponent;
  @ViewChild('newAddress') newAddress: FormFieldAddressComponent;
  @ViewChild('birthdayDateRef') birthdayDateRef: any;
  @ViewChild('anniversaryDateRef') anniversaryDateRef: any;
  @ViewChildren(FormFieldAddressComponent) formAddresses: QueryList<FormFieldAddressComponent>;
  @ViewChildren(FormFieldComponent) formFields: QueryList<FormFieldComponent>;
  @ViewChild('contactType') contactType: FilterSelectComponent;

  public _ = require('../../../../../node_modules/lodash');
  public src: string = 'assets/img/avatar.png';
  public resizeOptions: ResizeOptions = {
    resizeMaxHeight: 150,
    resizeMaxWidth: 150
  };
  public uploader: FileUploader = new FileUploader({url: uploadURL});
  public hasBaseDropZoneOver: boolean = false;
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
  private router: Router;
  private showNewFieldsSection = false;
  private showNewAddressSection = false;
  private selectedFieldType: string = null;
  private phoneTypes = [];
  private selectedPhoneType = null;
  private emailTypes = [];
  private selectedEmailType = null;
  private addressTypes = [];
  private selectedAddressType: {'name': ''};
  private phones = [];
  private addresses = [];
  private emails = [];
  private socialNetworks = [];
  private contactFacebook = new SocialNetwork();
  private contactInstagram = new SocialNetwork();
  private contactTwitter = new SocialNetwork();
  private contactWebSite = new SocialNetwork();
  private contactTypes = [];
  private contactTypesList = [];
  private streetOpened = false;
  private filename: string;
  private filesLenght: number = 0;
  private exampleLocations = {};
  private exampleAddressType;
  private fileDraged: any = undefined;
  private modalInstance = null;
  private birthdayDate = new ContactDate();
  private anniversaryDate = new ContactDate();
  private newPhoneErrors = [];
  private myDatePickerOptions = {
    dateFormat: 'mm/dd/yyyy',
    showTodayBtn: false,
    showSelectorArrow: false,
  };
  private modelbirthdayDate: Object = { };
  private modelanniversaryDate: Object = {};
  private validPhoneFormats: any;
  private invalidBirthday: boolean = false;
  private invalidAnniversary: boolean = false;
  private checkContentWidth: boolean = true;
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
    private modalService: ModalService,
    private functions: GeneralFunctionsService,
    _router: Router
  ) {
    this.router = _router;
    breadcrumbService.addFriendlyNameForRoute('/contacts/add', 'Add');
  }

  /**
   * Initialize
   * https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html
   */
  ngOnInit() {
    this.isLoading = true;
    this.mainPhone.visible = true;
    this.mainEmail.visible = true;
    this.mainAddress.visible = true;
    this.validPhoneFormats = this.functions.getValidPhoneFormats();

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
              this.selectedAddressType = this.addressTypes[0];
              this.addressModel.address_type = this.addressTypes[0].id;
            }
            this.isLoading = false;
    });
    this.getContactTypes();
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
        auxTypes.push({value: String(type.id) , label: type.name, selected: false});
      }
      this.contactTypesList = auxTypes;
      this.isLoading = false;
    } else {
      this.contactService.getRequestContactTypes()
        .subscribe(iTypes => {
          let auxTypes = [];
          for (let type of iTypes) {
            auxTypes.push({value: String(type.id) , label: type.name, selected: false});
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

  ngAfterViewInit() {
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
   * Set date format to: Nov 9, 2016
   * @param {date} date [Date to format]
   */
  formatDate(date: Date) {
    let monthNames = [
      'Jan', 'Feb', 'Mar',
      'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct',
      'Nov', 'Dec'
    ];

    if (date) {
      let year = date.getFullYear();
      let month = monthNames[date.getMonth()];
      let day = date.getDate();
      let format = month + ' ' + day + ', ' + year;
      return format;
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
   * Function to create a contact.
   */
  createContact() {// Create contact
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
      multiselectError = true;
      errors = true;
    } else {
        this.model.contact_types = this.contactType.data;
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
            this.flash.error('Please, You must enter a valid birthday date');
            this.invalidBirthday = false;
        } else {
            this.flash.error('Please, You must enter a valid anniversary date');
            this.invalidAnniversary = false;
        }
        return;
      }
    }

    this.isLoading = true;
    // Add last addres to array
    let phonesList = this.getPhones();
    let emailsList = this.getEmails();
    let addressesList = this.getAddresses();
    let socaialNetworksList = this.getSocialNetworks();
    let datesList = this.getDates();
    let newContact = {
      'first_name': (this.model.first_name) ? this.model.first_name.toLowerCase() : undefined,
      'last_name': (this.model.last_name) ? this.model.last_name.toLowerCase() : undefined,
      'maiden_name': (this.model.maiden_name) ? this.model.maiden_name.toLowerCase() : undefined,
      'emails': emailsList,
      'phones': phonesList,
      'addresses': addressesList,
      'social_networks': socaialNetworksList,
      'dates': datesList,
      'contact_types': this.model.contact_types
    };

    this.contactService.create(newContact)
      .subscribe(data => {
          this.response = data;
          this.model.id = data.id;
          this.flash.success('The contact has been created.');
          this.router.navigate([this.redirectTo]);
          this.closeModal.emit({action: 'close-modal'});
        },
        err => {
          this.logError(err);
          this.flash.error('An error has occurred creating the contact, please try again later.');
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  logError(err) {
    console.error('Error was:' + err);
  }

  /**
   * Show section to add new fields
   *
   *
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
   * Add the new phone to the list of phones
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
      this.phones.push(this.phoneModel);
      this.phoneModel = new Phone();
    } else {
      this.flash.error('Please, you need to complete main phone information');
    }
    this.toggleNewFieldsSection();
  }

  /**
   * Add the new email address to the to the list of emails
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
      this.emails.push(this.emailModel);
      this.emailModel = new Email();
    } else {
      this.flash.error('Please, you need to complete main email information');
    }
    this.toggleNewFieldsSection();
  }

  /**
   * Add the new address to the to the list of addresses
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
        this.addresses.push(this.addressModel);
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
   * Save the contact's phones on db
   *
   */
  public getPhones() {
    let phonesList = this._.cloneDeep(this.phones);
    // Add the main phone
    if (this.mainPhone.number) {
      this.mainPhone['default'] = true;
      phonesList.push(this.mainPhone);
    }
    return phonesList;
  }

  /**
   * Save the contact's emails on db
   *
   */
  public getEmails() {
    let emailsList = this._.cloneDeep(this.emails);
    // check if there is a main email
    if (this.mainEmail.address && this.mainEmail.address !== '') {
      this.mainEmail['default'] = true;
      emailsList.push(this.mainEmail);
    }
    return emailsList;
  }

  /**
   * Save the contact's addresses on db
   *
   */
  public getAddresses() {
    let addressesList = this._.cloneDeep(this.addresses);
    // check if there is a main email
    if (this.mainAddress.address1 && this.mainAddress.address1 !== '') {
      this.mainAddress['default'] = true;
      addressesList.push(this.mainAddress);
    }
    return addressesList;
  }

  /**
   * Get contact dates to save
   *
   */
  public getDates() {
    let datesList = [];
    if (this.modelbirthdayDate !== undefined) {
      if (this.modelbirthdayDate['jsdate']) {
        this.birthdayDate.date = this.modelbirthdayDate['jsdate'];
        this.birthdayDate.date_type = 1;
        let birthday = this._.cloneDeep(this.birthdayDate);
        birthday.date = birthday.date.toISOString().slice(0, 10);
        datesList.push(birthday);
      }
    }
    if (this.modelanniversaryDate !== undefined) {
      if (this.modelanniversaryDate['jsdate']) {
        this.anniversaryDate.date = this.modelanniversaryDate['jsdate'];
        this.anniversaryDate.date_type = 2;
        let anniversary = this._.cloneDeep(this.anniversaryDate);
        anniversary.date = anniversary.date.toISOString().slice(0, 10);
        datesList.push(anniversary);
      }
    }
    return datesList;
  }

  /**
   * Get contact types to save
   *
   */
  public getSelectedContactTypes() {

  }

  /**
   * Save the contact's social networks on db
   *
   */
  public getSocialNetworks() {
    this.socialNetworks = [];
    // create or edit Facebook
    if (this.contactFacebook && this.contactFacebook.network_id) {
        if (this.contactFacebook.network_id) {
          this.contactFacebook.network = 'facebook';
          this.socialNetworks.push(this.contactFacebook);
        }
    }

    // create or edit Twitter
    if (this.contactTwitter) {
        if (this.contactTwitter.network_id) {
          this.contactTwitter.network = 'twitter';
          this.socialNetworks.push(this.contactTwitter);
        }
    }

    // create or edit Instagram
    if (this.contactInstagram) {
      if (this.contactInstagram.network_id) {
        this.contactInstagram.network = 'instagram';
        this.socialNetworks.push(this.contactInstagram);
      }
    }

    // create or edit Web Site
    if (this.contactWebSite) {
        if (this.contactWebSite.network_id) {
          let web = this.contactWebSite.network_id;
            if (!(web.substring(0, 7) === 'http://' || web.substring(0, 8) === 'https://')) {
             this.contactWebSite.network_id = 'http://' + web;
            }
            this.contactWebSite['default'] = true;
            this.contactWebSite.network = 'website';
            this.socialNetworks.push(this.contactWebSite);
        }
    }

    return this.socialNetworks;
  }

  /**
   * [fileOverBase description]
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
    this.router.navigate([this.redirectTo]);
    this.closeModal.emit({action: 'close-modal'});
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

  private getCheckedState(checked: boolean) {
    if (checked) {
      return 'checked';
    } else {
      return '';
    }
  }

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
        this.fileDraged = undefined;
      }
      this.filesLenght = this.uploader.queue.length;
    }
  }

  private openDialogBox(e: any) {
    document.getElementById('img-upload-input').click();
  }

  /**
   * Redirect to import csv and close modal without saving modifications
   *
   */
  private goToImportCsv() {
    this.closeModal.emit({action: 'close-modal'});
    this.router.navigate(['contacts/import-csv']);
  }

  /**
   * Open modal depends of type: new/edit contact
   */
  private openModal() {
    let title = null;
    let submitText = null;
    let style = 'import-csv-center';
    title = 'New Contact';
    submitText = 'IMPORT CSV';
    this.modalService.setModalContent(StepZeroModule, title, style);

    if (this.modalInstance) {
      this.modalInstance.ngOnInit();
    }

    this.modalService.setModalFooterBar(submitText.toUpperCase(), true, false);
    this.modalService.showModal();
    let subscriber = this.modalService.templateChange.subscribe(data => {
      this.modalInstance = data.instance;
      this.modalInstance.setComponentRef(this);
      this.modalInstance.ngOnInit();
    });
    this.modalService.subscribeTemplateChange(subscriber);
  }

  /**
   * Function triggered when contact fields (phones, emails, addresses, social and custom) are deleted
   * @param {any} e [event]
   * @param {string} field [field type to delete]
   * @param {any} elem [element position (number) on array if it isn't the main field. else main field is deleted]
   */
  private onDelete(e: any, field: string, elem: any) {
    if (typeof elem === 'number') {
      this[field].splice(elem, 1);
    } else {
      switch (field) {
        case 'phones':
          if (this.phones.length > 0) {
            this.mainPhone = this.phones[0];
            this.phones.splice(0, 1);
          } else {
            this.mainPhone = new Phone();
          }
          break;
        case 'emails':
          if (this.emails.length > 0) {
            this.mainEmail = this.emails[0];
            this.emails.splice(0, 1);
          } else {
            this.mainEmail = new Email();
          }
          break;
        case 'addresses':
          if (this.addresses.length > 0) {
            this.mainAddress = this.addresses[0];
            this.addresses.splice(0, 1);
          } else {
            this.mainAddress = new Address();
          }
          break;
        case 'social':
          this[elem] = new SocialNetwork();
          break;
        default:
          break;
      }
    }
  }
}
