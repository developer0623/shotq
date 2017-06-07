import { Component, AfterViewInit, Input, Output, EventEmitter, QueryList, ViewChildren, ViewChild, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
/* Components */
import { FormFieldComponent } from '../shared/form-field/form-field.component';
import { FilterSelectComponent }      from '../shared/filter-select/filter-select.component';
/* Services */
import { NgForm } from '@angular/forms';
import { ContactService } from '../../services/contact/contact.service';
import { FlashMessageService } from '../../services/flash-message';
import { EmailTypeService } from '../../services/email-type/email-type.service';
import { PhoneTypeService } from '../../services/phone-type/phone-type.service';
import { ModalService } from '../../services/modal/';
/* Models */
import { Contact } from '../../models/contact';
import { Email } from '../../models/email';
import { Phone } from '../../models/phone';

@Component({
  selector: 'app-quick-contact',
  templateUrl: 'quick-contact.component.html',
  styleUrls: ['quick-contact.component.scss'],
  providers: [PhoneTypeService, EmailTypeService]
})
export class QuickContactComponent {
  @Output() closeModal = new EventEmitter();
  @ViewChildren(FormFieldComponent) formFields: QueryList<FormFieldComponent>;
  @ViewChild('contactType') contactType: FilterSelectComponent;
  public contactTypesSelected: Array<any> = [];
  private response: string = '';
  private model = new Contact();
  private mainPhone = new Phone();
  private mainEmail = new Email();
  private phoneTypes: Array<any> = [];
  private emailTypes: Array<any> = [];
  private router;
  private componentRef;
  private isLoading: boolean = false;
  private generalFunctions: any;
  private isOpen: boolean = false;
  private checkContentWidth: boolean = true;

  private contactTypes = [];
  private contactTypesList = [];

  constructor(
    private contactService: ContactService,
    private flash: FlashMessageService,
    private emailTypeService: EmailTypeService,
    private phoneTypeService: PhoneTypeService,
    private modalService: ModalService,
    _router: Router
  ) { this.router = _router; }

  ngOnInit() {
    this.contactService.updateContactTypes();

    // get types to show on selectors
    this.phoneTypeService.getList()
      .subscribe(types => {
        this.phoneTypes = types.results;
        if (this.phoneTypes.length > 0) {
          this.mainPhone.phone_type = this.phoneTypes[0].id;
        }
    });
    this.emailTypeService.getList()
      .subscribe(types => {
        this.emailTypes = types.results;
        if (this.emailTypes.length > 0) {
          this.mainEmail.email_type = this.emailTypes[0].id;
        }
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
        auxTypes.push({ value: String(type.id), label: type.name, selected: false });
      }
      this.contactTypesList = auxTypes;
      this.isLoading = false;
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
   * Function to create a contact.
   */
  createQuickContact() {
    let errors = false;
    let firstField = null;
    let multiselectError = false;

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
    // validate Contact Type
    if (!this.contactType.getErrors()) {
      errors = true;
      multiselectError = true;
    }

    if (errors) {
      if (multiselectError) {
        this.contactType.focusSelector();
        return;
      }
      if (firstField) {
        firstField.onSpanClick();
        return;
      } else {
        return;
      }
    }

    // check if there are phones/emails
    let phones = [];
    let emails = [];
    if (this.mainPhone.number) {
      phones.push(this.mainPhone);
    }
    if (this.mainEmail.address) {
      emails.push(this.mainEmail);
    }

    this.isLoading = true;
    // Set minumim ammount of data to create contact until API create endpoint is finished.
    let minData = {
      'first_name': (this.model.first_name) ? this.model.first_name.toLowerCase() : undefined,
      'last_name': (this.model.last_name) ? this.model.last_name.toLowerCase() : undefined,
      'emails': emails,
      'phones': phones,
      'addresses': [],
      'social_networks': [],
      'contact_types': (this.model.contact_types) ? this.model.contact_types : []
    };
    this.contactService.create(minData)
      .subscribe(data => {
          this.response = data;
          this.isLoading = true;
          this.flash.success('The contact has been created.');
          this.model = new Contact();
          this.router.navigate(['contacts']);
          let contactListComponent = this.modalService.getParentRef();
          // update contact list
          if (contactListComponent !== undefined) {
            contactListComponent.getContacts();
          }
          this.closeModal.emit({action: 'close-modal'});
        },
        err => {
          console.error(err);
          this.flash.error('An error has occurred creating the contact, please try again later.');
        },
        () => this.isLoading = false
      );
  }
  /**
   * [setComponentRef description]
   * @param {[type]} ref [description]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }
}
