import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import * as _ from 'lodash';

import { DialogRef, ModalComponent } from 'single-angular-modal';
import { ContactService } from '../../../../services/contact/contact.service';
import { Contact } from '../../../../models/contact';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';


export class ClientUserWindowData extends BSModalContext {
  public contactId: number;
}


@Component({
  selector: 'app-client-user-edit',
  templateUrl: './client-user-edit.component.html',
  styleUrls: [
    './client-user-edit.component.scss'
  ]
})
export class ClientUserEditComponent implements ModalComponent<ClientUserWindowData> {
  isLoading: boolean = false;
  contactId: number;
  contactInfo: Contact;
  form: FormGroup;

  constructor(private fb: FormBuilder,
              private contactService: ContactService,
              private flash: FlashMessageService,
              public dialog: DialogRef<ClientUserWindowData>) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.contactId = this.dialog.context['contactId'];

    this.initForm();
    this.getUserInfo();
  }

  initForm() {
    this.form = this.fb.group({
      id: [''],
      first_name: ['', Validators.compose([
        Validators.required, Validators.maxLength(30)
      ])],
      last_name: ['', Validators.compose([
        Validators.required, Validators.maxLength(30)
      ])],
      default_email_details: this.fb.group({
        address: ['', Validators.compose([
          Validators.required, Validators.email
        ])],
      }),
      default_address_details: this.fb.group({
        address1: ['', Validators.required],
      })
    });
  }

  getUserInfo() {
    this.contactService
      .getContact(this.contactId)
      .subscribe(
        response => {
          this.contactInfo = response;
          this.form.patchValue(this.contactInfo);
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

  prepareData() {
    let data = this.form.value,
      defaultEmail, defaultAddress;

    data['id'] = this.contactInfo.id;
    data['emails'] = this.contactInfo.emails;
    data['addresses'] = this.contactInfo.addresses;

    defaultEmail = _.find(data['emails'], {id: this.contactInfo.default_email_details['id']});
    defaultEmail = Object.assign(defaultEmail, data['default_email_details']);

    defaultAddress = _.find(data['addresses'], {id: this.contactInfo.default_address_details['id']});
    defaultAddress = Object.assign(defaultAddress, data['default_address_details']);

    return data;
  }

  save() {
    if (this.form.pristine) {
      this.close();
      return;
    }

    let data = this.prepareData();
    this.isLoading = true;
    this.contactService
      .update(data)
      .subscribe(
        response => {
          this.close(response);
          this.flash.success('Data was successfully saved.');
        },
        err => {
          console.error(err);
          this.flash.error('Error occurred during saving data.');
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  valid() {
    return this.form.valid;
  }

  close(result?: any) {
    if (result) {
      this.dialog.close(result);
      return;
    }

    this.dialog.dismiss();
  }

}
