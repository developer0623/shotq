import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContactsUiService } from '../../shared/contacts-ui/contacts-ui.service';
import { Contact } from '../../../models/contact';
import { ContactService } from '../../../services/contact/contact.service';

@Component({
  selector: 'app-contact-add',
  template: '',
  providers: [ContactsUiService]
})
export class ContactAddPageComponent implements OnInit {
  constructor(
    private contactService: ContactService,
    private presenter: ContactsUiService, private router: Router) {
  }

  ngOnInit() {
    this.presenter.displayAddOrUpdateDialog(ContactService.newObject())
      .finally(() => { this.router.navigateByUrl('/contacts'); })
      .subscribe(contact => {
        this.presenter.displaySuccessMessage('dialog returned a contact');
      });
  }
}
