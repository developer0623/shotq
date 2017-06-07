import { RestClientService } from '../rest-client/rest-client.service';
import { AppliedPayment } from '../../models/applied-payment.model';

export class AppliedPaymentService extends RestClientService<AppliedPayment> {
  baseUrl = 'billing/applied_payment';
}
