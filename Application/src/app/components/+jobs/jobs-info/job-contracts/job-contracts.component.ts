import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import { Modal } from 'single-angular-modal/plugins/bootstrap';
import { overlayConfigFactory } from 'single-angular-modal';

import { Contract, contractStatusArchived, contractStatusSigned } from '../../../../models/contract';
import { ContractService } from '../../../../services/contract/contract.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import {
  QuickContractComponent,
  QuickContractWindowData
} from '../../../top-navbar/quick-contract/quick-contract.component';
import { Job } from '../../../../models/job';
import {
  ContractPreviewModalComponent,
  ContractPreviewModalContext
} from '../../../+contracts/contract-preview/contract-preview-modal/contract-preview-modal.component';


@Component({
  selector: 'job-contracts',
  templateUrl: 'job-contracts.component.html',
  styleUrls: ['job-contracts.component.scss'],
  providers: []
})
export class JobContractsComponent implements OnInit {
  @Input() job: Job;

  public jobId: number;
  public contracts: Contract[] = [];

  public isLoading: boolean = false;
  public isArchived: boolean = false;

  public contractActions = [
    {
      id: 'contract-archive',
      name: 'Archive',
      icon: 'icon-archive',
      title: 'Archive',
      active: (contract) => !_.includes([contractStatusSigned, contractStatusArchived], contract.status)
    },
    {
      id: 'contract-preview',
      name: 'Preview Contract',
      icon: 'icon-open-eye',
      title: 'Preview',
      active: (contract) => true
    },
    {
      id: 'contract-edit',
      name: 'Edit Contract',
      icon: 'icon-edit',
      title: 'Edit',
      active: (contract) => !_.includes([contractStatusSigned, contractStatusArchived], contract.status)
    }
  ];

  constructor(public contractService: ContractService,
              public flash: FlashMessageService,
              public modal: Modal,
              private router: Router) {

  }

  public ngOnInit() {
    this.jobId = this.job.id;
    this.loadContracts();
  }

  toggleView() {
    this.isArchived = !this.isArchived;
    this.loadContracts();
  }

  getFilter() {
    let filter;

    filter = {
      job: this.jobId
    };
    if (this.isArchived)
      filter['status'] = contractStatusArchived;
    else
      filter['status!'] = contractStatusArchived;

    return filter;
  }

  loadContracts() {
    let filter = this.getFilter();

    this.isLoading = true;
    this.contractService
      .getList(filter)
      .subscribe(
        (result) => {
          this.contracts = result.results;
          this.contracts.map((contract) => {
            contract['actions'] = this.getContractActions(contract);
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
    this.contractService
      .partialUpdate(proposal.id, data)
      .subscribe(
        () => {
          this.flash.success('Contract is successfully updated.');
          this.loadContracts();
        },
        (error) => {
          console.error(JSON.stringify(error));
          this.flash.error('Error while updating contract.');
          this.isLoading = false;
        }
      );
  }

  newContract() {
    this.modal
      .open(QuickContractComponent, overlayConfigFactory({
        job: this.job
      }, QuickContractWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.loadContracts();
          })
          .catch(() => {
          });
      });
  }

  getContractActions(contract: Contract) {
    return _.filter(this.contractActions, (action) => { return action.active(contract); });
  }

  previewContract(contract) {
    this.modal
          .open(ContractPreviewModalComponent,
            overlayConfigFactory({
              isBlocking: false,
              canSign: false,
              contract: contract
            }, ContractPreviewModalContext)
          );

    // this.previewService.openModal(this, contract, {canSubmit: false, signing: false});
  }

  confirmArchive(contract: Contract) {
    this.modal
      .confirm()
      .isBlocking(true)
      .showClose(false)
      .title(`Archive ${contract.title}?`)
      .dialogClass('modal-dialog modal-confirm')
      .body(`Are you sure you want to archive ${contract.title}?`)
      .okBtn('Archive')
      .okBtnClass('btn btn_xs btn_red pull-right')
      .cancelBtnClass('btn btn_xs btn_transparent')
      .open()
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.update(contract, {status: contractStatusArchived});
          })
          .catch(() => {});
      });
  }

  singleAction(action, contract: Contract) {
    switch (action.id) {
      case 'contract-edit':
        this.router.navigate(['/contracts', contract.id]);
        break;

      case 'contract-archive':
        this.confirmArchive(contract);
        break;

      case 'contract-preview':
        this.previewContract(contract);
        break;

      default:
        break;
    }
  }

}
