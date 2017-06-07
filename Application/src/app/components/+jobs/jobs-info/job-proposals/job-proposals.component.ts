import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';
import { Modal } from 'single-angular-modal/plugins/bootstrap';

import {
  Proposal, proposalStatusAccepted, proposalStatusArchived,
  proposalStatusDraft, proposalStatusSent
} from '../../../../models/proposal';
import { ProposalService } from '../../../../services/proposal/proposal.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';


@Component({
  selector: 'job-proposals',
  templateUrl: './job-proposals.component.html',
  styleUrls: ['./job-proposals.component.scss'],
  providers: []
})
export class JobProposalsComponent implements OnInit {
  @Input() jobId: number;
  @Output() showProposal: EventEmitter<number> = new EventEmitter;

  public proposals: Proposal[] = [];

  public isLoading: boolean = false;
  public isArchived: boolean = false;

  public proposalActions = [{
      id: 'proposal-view',
      name: 'View',
      icon: 'icon-open-eye',
      title: 'View',
      active: (proposal) => proposal.status === proposalStatusAccepted
    }, {
      id: 'proposal-edit',
      name: 'Edit',
      icon: 'icon-edit',
      title: 'Edit',
      active: (proposal) => proposal.status === proposalStatusDraft || proposal.status === proposalStatusSent
    }, {
      id: 'proposal-archive',
      name: 'Archive',
      icon: 'icon-archive',
      title: 'Archive',
      active: (proposal) => proposal.status === proposalStatusDraft || proposal.status === proposalStatusSent
    }];

  constructor(public proposalService: ProposalService,
              public router: Router,
              public route: ActivatedRoute,
              public flash: FlashMessageService,
              public modal: Modal) {

  }

  public ngOnInit() {
    this.loadProposals();
  }

  toggleView() {
    this.isArchived = !this.isArchived;
    this.loadProposals();
  }

  openProposal(proposal) {
    if (proposal.status === proposalStatusAccepted) {
      this.showProposal.emit(proposal.id);
      return;
    }

    this.router.navigate(['../', 'proposal'], {relativeTo: this.route});
  }

  getFilter() {
    let filter;

    filter = {
      job: this.jobId
    };
    if (this.isArchived)
      filter['status'] = proposalStatusArchived;
    else
      filter['status!'] = proposalStatusArchived;

    return filter;
  }

  loadProposals() {
    let filter = this.getFilter();

    this.isLoading = true;
    this.proposalService
      .getList(filter)
      .subscribe(
        (result) => {
          this.proposals = result.results;
          this.proposals.map((proposal) => {
            proposal['actions'] = this.getProposalActions(proposal);
          });
        },
        (err) => {
          console.error(err);
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  update(proposal, data) {
    this.isLoading = true;
    this.proposalService
      .partialUpdate(proposal.id, data)
      .subscribe(
        () => {
          this.flash.success('Proposal is successfully updated.');
          this.loadProposals();
        },
        (error) => {
          console.error(JSON.stringify(error));
          this.flash.error('Error while updating proposal.');
          this.isLoading = false;
        }
      );
  }

  getProposalActions(proposal: Proposal) {
    return _.filter(this.proposalActions, (action) => { return action.active(proposal); });
  }

  confirmArchive(proposal: Proposal) {
    this.modal
      .confirm()
      .isBlocking(true)
      .showClose(false)
      .title(`Archive ${proposal.name}?`)
      .dialogClass('modal-dialog modal-confirm')
      .body(`Are you sure you want to archive ${proposal.name}?`)
      .okBtn('Archive')
      .okBtnClass('btn btn_xs btn_red pull-right')
      .cancelBtnClass('btn btn_xs btn_transparent')
      .open()
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.update(proposal, {status: proposalStatusArchived});
          })
          .catch(() => {});
      });
  }

  singleAction(action, proposal: Proposal) {
    switch (action.id) {
      case 'proposal-edit':
        this.router.navigate(['../', 'proposal'], {relativeTo: this.route});
        break;

      case 'proposal-archive':
        this.confirmArchive(proposal);
        break;

      case 'proposal-view':
        this.showProposal.emit(proposal.id);
        break;

      default:
        break;
    }
  }

}
