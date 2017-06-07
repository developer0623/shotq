import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '../../shared/breadcrumb/components/breadcrumb.service';
import { Worker } from '../../../models/worker';
import { AccessService } from '../../../services/access/access.service';
import { WorkerInlineComponent } from './worker-inline/worker-inline.component';

@Component({
  selector: 'team-settings',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
  providers: [AccessService, WorkerInlineComponent]
})
export class TeamComponent implements OnInit {
  private contractorWorkers: Worker[] = [];
  private studioWorkers: Worker[] = [];
  private isLoading: boolean;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private accessService: AccessService,
  ) {
    breadcrumbService.addFriendlyNameForRoute('/settings/team', 'Team and User Roles');
  }

  ngOnInit() {
    this.getWorkers();
  }

  public getWorkers() {
    this.isLoading = true;
    this.accessService.getAccountWorkerList()
      .subscribe(
        (data) => {
          for (let worker of data) {
            if (worker.role === 'contractor') {
              this.contractorWorkers.push(worker);
            } else {
              this.studioWorkers.push(worker);
            }
          }
        },
        error => console.error(error),
        () => this.isLoading = false
      );
  }

}
