import { OpenModalByUrlComponent } 		from '../shared/open-modal-by-url/open-modal-by-url.component';
import { ImportCSVComponent } 			from './import-csv/import-csv.component';
import { ContactProfileComponent } 		from './contact-profile/contact-profile.component';
import { ContactsMergeComponent } 		from './contacts-merge/contacts-merge.component';
import { ContactsListComponent } 		from './contacts-list/contacts-list.component';
import { ContactAddPageComponent } from './contact-add/contact-add-page.component';
import { ContactChangePageComponent } from './contact-change-page/contact-change-page.component';

export const CONTACTS_ROUTES = [
  {path: '', component: ContactsListComponent},
  {path: 'add', component: ContactAddPageComponent},
  {path: 'edit/:id', component: ContactChangePageComponent},
  {path: 'edit/:id/:referer', component: OpenModalByUrlComponent},
  {path: 'import-csv', component: ImportCSVComponent},
  {path: 'merge/:id1/:id2', component: OpenModalByUrlComponent},
  {path: 'profile/:id', component: ContactProfileComponent},
];
