import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Proposal } from '../../../../models/proposal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Contact } from '../../../../models/contact';
import { Worker } from '../../../../models/worker';

import { ContactService } from '../../../../services/contact/contact.service';
import { Observable } from 'rxjs';
import { ProposalService } from '../../../../services/proposal/proposal.service';
import { AddressTypeService } from '../../../../services/address-type/address-type.service';
import { AddressType } from '../../../../models/address-type';


@Component({
  selector: 'booking-event-details',
  templateUrl: './booking-event-details.component.html',
  styleUrls: ['./booking-event-details.component.scss']
})
export class BookingEventDetailsComponent {
  @Input() proposal: Proposal;
  @Output() valid = new EventEmitter<boolean>();

  contact: Contact;
  contactForm: FormGroup;
  eventForm: FormGroup;
  phoneTypes;
  workers: Worker[];
  addressTypes: AddressType[] = [];

  constructor(private formBuilder: FormBuilder,
              private addressTypeService: AddressTypeService,
              private contactService: ContactService,
              private proposalService: ProposalService) {
    this.buildForms();
  }

  ngOnInit() {
    this.getWorkers();
    this.getAddressTypes();
  }

  ngOnChanges(changes) {
    if (this.proposal.job.external_owner) {
      this.contactService.getContact(this.proposal.job.external_owner.id)
        .subscribe(contact => {
          this.contact = contact;
          this.contact.social_networks = [];
          this.contact.address = this.contact.addresses &&
            this.contact.addresses.find(item => item.id === this.contact.default_address) ||
            this.contact.addresses[0] ||
            {};

          this.contact.default_phone_details = this.contact.phones &&
            this.contact.phones.find(item => item.id === this.contact.default_phone) ||
            this.contact.phones[0] || {};

          this.contact.default_email_details = this.contact.default_email_details || {};
          this.contactForm.patchValue(this.contact);
          this.contactService.contactAvailablePhoneTypes(this.contact.id).subscribe(phoneTypes => {
            this.phoneTypes = phoneTypes;
          });
        });
    }
  }

  buildForms() {
    this.contactForm = this.formBuilder.group({
      first_name: ['', Validators.compose([
        Validators.required,
      ])],
      last_name: ['', Validators.compose([
        Validators.required,
      ])],
      default_email_details: this.formBuilder.group({
        email_type: '',
        address: ['', Validators.compose([
          Validators.required,
        ])],
      }),
      default_phone_details: this.formBuilder.group({
        phone_type: '',
        number: '',
      }),
      address: this.formBuilder.group({
        address1: ['', Validators.compose([
          Validators.required,
        ])],
        city: ['', Validators.compose([
          Validators.required,
        ])],
        state: ['', Validators.compose([
          Validators.required,
        ])],
        zip: ['', Validators.compose([
          Validators.required,
        ])],
      }),
    });

    this.eventForm = this.formBuilder.group({
      number_of_people: '',
      location: this.formBuilder.group({
        address1: '',
        city: '',
        state: '',
        zip: '',
      }),
    });

    this.contactForm.valueChanges
      .subscribe(value => {
        this.valid.emit(this.contactForm.valid);
      });
  }

  applyChanges() {
    if (this.contactForm.valid) {
      Object.assign(this.contact, this.contactForm.value);

      let defaultEmail = this.contact.emails.find(email => email.id === this.contact.default_email);
      if (defaultEmail) {
        Object.assign(defaultEmail, this.contactForm.value.default_email_details);
      }
      let defaultPhone = this.contact.phones.find(phone => phone.id === this.contact.default_phone);
      if (defaultPhone) {
        Object.assign(defaultPhone, this.contactForm.value.default_phone_details);
      } else {
        this.contact.phones.push(this.contactForm.value.default_phone_details);
      }
      let formAddress = this.contactForm.value.address;
      formAddress.address_type = this.addressTypes[0].id;
      let address = this.contact.addresses.find(a => a.id === this.contact.default_address);
      if (address) {
        Object.assign(address, this.contactForm.value.address);
      } else {
        this.contact.addresses.push(this.contactForm.value.address);
      }

    }
  }

  save() {
    return Observable.create(observer => {
      if (this.contactForm.valid) {
        this.applyChanges();
        this.contactService.update(this.contact)
          .subscribe(c => {
            observer.next(true);
            observer.complete();
          }, error => {
            observer.next(false);
            observer.complete();
          });

      } else {
        observer.next(false);
        observer.complete();
      }
    });
  }

  getWorkers() {
    this.proposalService.getWorkers(this.proposal.id)
      .subscribe((workers: Worker[]) => {
        this.workers = workers;
      });
  }

  private getAddressTypes() {
    this.addressTypeService.getList()
      .map(res => res.results)
      .subscribe((res: AddressType[]) => {
        this.addressTypes = res;
      });
  }
}
