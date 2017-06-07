import { Component, Input } from '@angular/core';
import { Proposal } from '../../../../models/proposal';
import { BookingOverview } from '../../../../models/proposal-payment-overview.model';

@Component({
  selector: 'booking-payment',
  templateUrl: './booking-payment.component.html',
  styleUrls: ['./booking-payment.component.scss'],
})
export class BookingPaymentComponent {
  @Input() proposal: Proposal;
  @Input() overview: BookingOverview;
}
