import { BSModalContext } from 'single-angular-modal/plugins/bootstrap/index';

import { DialogRef, ModalComponent } from 'single-angular-modal';
import { Component } from '@angular/core';
import { Contract } from '../../../../models/contract';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

export class ContractPreviewModalContext extends BSModalContext {
  showFooter = true;
  canSign: boolean = true;
  contract: Contract;
}

@Component({
  selector: 'app-contract-preview-modal',
  templateUrl: './contract-preview-modal.component.html',
})
export class ContractPreviewModalComponent implements ModalComponent<ContractPreviewModalContext> {
  sign = new Subject<any>();
  private context: ContractPreviewModalContext;
  private valid = false;


  constructor(public dialog: DialogRef<ContractPreviewModalContext>,
              private router: Router) {
    this.context = dialog.context;
  }


  cancel() {
    this.dialog.dismiss();
  }

  edit() {
    if (this.context.canSign) {
      this.sign.next();
      this.dialog.close(true);
    } else {
      this.router.navigate(['/contracts', this.context.contract.id]);
      this.dialog.dismiss();

    }
  }

}
