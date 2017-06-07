import { Injectable } from '@angular/core';
import { ModalService } from '../../../services/modal/modal.service';
import { ContractsAddModule } from './contracts-add.module';
import { modalConfig } from './contracts-add.component';

declare let require: (any);


@Injectable()
export class ContractsAddModalService {
  private modalInstance = null;


  constructor(public modalService: ModalService) {

  }

  public openModal(parentCmp, config?: modalConfig) {
    config = config || {};
    this.modalService.setModalContent(ContractsAddModule, '');
    this.modalService.setModalFooterBar('', true);
    this.modalService.hideFooter();

    if (location.hash.search('modalOpen') > -1) {
      location.hash = location.hash.replace('?modalOpen', '');
    }

    this.modalService.templateChange
      .first()
      .subscribe(data => {
        this.modalInstance = data.instance;
        this.modalInstance.setComponentRef(parentCmp);

        if (this.modalInstance.initializeData) {
          this.modalInstance.initializeData(config);
        }

      });
    if (!config.showOnErrors) {
      this.modalService.showModal();
    }
    return this.modalService.templateChange;

  }
}
