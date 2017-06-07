import { RestClientService } from '../rest-client/rest-client.service';
import { ScheduledPayment } from '../../models/scheduled-payment.model';

export class ScheduledPaymentService extends RestClientService<ScheduledPayment> {
  baseUrl = 'billing/scheduled_payment';
}
