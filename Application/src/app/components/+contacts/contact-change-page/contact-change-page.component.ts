import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Overlay } from 'single-angular-modal/esm';

import { ContactsUiService } from '../../shared/contacts-ui/contacts-ui.service';
import { ContactService } from '../../../services/contact/contact.service';
import { Contact } from '../../../models/contact';

@Component({
  selector: 'app-contact-change-page',
  template: '',
  // providers: [ContactsUiService]
})
export class ContactChangePageComponent implements OnInit {
  constructor(private presenter: ContactsUiService,
              private contactService: ContactService,
              overlay: Overlay,
              vcRef: ViewContainerRef,
              private route: ActivatedRoute, private router: Router) {
    // This is a workaround for the issue where Modal doesn't work with lazy
    // modules. See http://bit.ly/2qqlpDX for details.
    overlay.defaultViewContainer = vcRef;
  }

  ngOnInit() {
    this.route.params.subscribe(
      (params: { id: string }) => {
        //noinspection JSIgnoredPromiseFromCall
        this.contactService.getContact(Number(params.id))
          .map(ContactService.newObject)
          .subscribe((contact: Contact) => {
            //noinspection JSIgnoredPromiseFromCall
            this.presenter.displayAddOrUpdateDialog(contact)
              .finally(() => this.router.navigateByUrl('/contacts'))
              .subscribe(result => {
                this.contactService.update(result)
                  .subscribe(data => {
                      this.presenter.displaySuccessMessage('The contact has been updated.');
                    },
                    err => {
                      console.error(err);
                      this.presenter.displayErrorMessage(
                        'An error has occurred updating the contact, please try again later.'
                      );
                    });
              });
          });
      });
  }
}
