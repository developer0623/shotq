import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { TemplateVariable } from '../../models/template-variable.model';


@Injectable()
export class TemplateVariableService extends RestClientService<TemplateVariable> {
  baseUrl = 'template/template_variable';
}
