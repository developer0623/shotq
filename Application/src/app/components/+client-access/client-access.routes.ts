import { Routes } from '@angular/router';
import { AccountComponent } from './account/';
import { CommunicationComponent } from './communication/';
import { InvoicesComponent } from './invoices/';
import { OverviewComponent } from './overview/';
import { ClientPageComponent, JobResolve } from './client-page';
import { ClientAccessAuthGuard } from '../../services/access';

export const CLIENT_ACCESS_ROUTES: Routes = [
  {
    path: ':jobId',
    component: ClientPageComponent,
    resolve: {
      job: JobResolve
    },
    canActivate: [ ClientAccessAuthGuard ],
    children: [
      { path: 'account', component: AccountComponent },
      { path: 'communication', component: CommunicationComponent },
      { path: 'invoices', component: InvoicesComponent },
      { path: 'overview', component: OverviewComponent }
    ]
  }
];
