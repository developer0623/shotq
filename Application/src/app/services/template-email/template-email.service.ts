import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { EmailTemplate } from '../../models/template-email';


@Injectable()
export class TemplateEmailService extends RestClientService<EmailTemplate> {
  baseUrl = 'template/email_template';
}
