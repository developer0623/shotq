import { Injectable } from '@angular/core';

import 'rxjs/Rx';

import { ContractTemplate } from '../../models/contract-template.model';
import { BaseTemplateService } from '../base-template/base-template.service';


@Injectable()
export class ContractTemplateService extends BaseTemplateService<ContractTemplate> {

  baseUrl = 'template/legal_document_template';

  /**
   * Format the contactTemplate data recived from api
   * @param {Object}
   */
  private formatContractTemplate(contractTemplate: ContractTemplate) {
    return contractTemplate;
  }
}
