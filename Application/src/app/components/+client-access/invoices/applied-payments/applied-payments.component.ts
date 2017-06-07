import { Component, Input } from '@angular/core';
import { Invoice } from '../../../../models/invoice';
import { AppliedPaymentService } from '../../../../services/applied-payment/applied-payment.service';
import { AppliedPayment } from '../../../../models/applied-payment.model';
@Component({
  selector: 'app-applied-payments',
  templateUrl: './applied-payments.component.html',
  styleUrls: [
    './applied-payments.component.scss'
  ]
})
export class AppliedPaymentsComponent {
  @Input() invoice: Invoice;
  private isLoading: boolean = false;
  private appliedPayments: AppliedPayment[] = [];

  constructor(private appliedPaymentsService: AppliedPaymentService) {

  }

  ngOnChanges(changes) {
    if (changes.invoice && changes.invoice.currentValue) {
      this.isLoading = true;
      this.appliedPaymentsService.getList({invoice: this.invoice.id})
        .map(res => res.results)
        .subscribe(res => {
          this.isLoading = false;
          this.appliedPayments = res;
        });
    }
  }

}
