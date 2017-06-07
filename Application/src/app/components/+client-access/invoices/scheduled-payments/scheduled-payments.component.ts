import { Component, Input } from '@angular/core';
import { Invoice } from '../../../../models/invoice';
import { ScheduledPaymentService } from '../../../../services/scheduled-payment/scheduled-payment.service';
import { ScheduledPayment } from '../../../../models/scheduled-payment.model';
@Component({
  selector: 'app-scheduled-payments',
  templateUrl: './scheduled-payments.component.html',
  styleUrls: [
    './scheduled-payments.component.scss'
  ]
})
export class ScheduledPaymentsComponent {
  @Input() invoice: Invoice;

  scheduledPayments: ScheduledPayment[] = [];
  isLoading = false;

  constructor(private scheduledPaymentService: ScheduledPaymentService) {

  }

  ngOnChanges(changes) {
    if (changes.invoice) {
      this.isLoading = true;
      this.scheduledPaymentService.getList({invoice: this.invoice.id})
        .map(res => res.results)
        .subscribe(res => {
          this.isLoading = false;
          this.scheduledPayments = res;
        });
    }
  }

}
