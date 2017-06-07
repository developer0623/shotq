import moment from 'moment';
import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { Proposal } from '../../../../models/proposal';
import { ProposalSchedulePaymentValidaton } from '../../../../models/proposal-schedule-payment-validation';
import { ProposalService } from '../../../../services/proposal';
import { ProposalSchedulePaymentService } from '../../../../services/proposal-schedule-payment';

interface ValidationInfo {
  is_valid: boolean;
  result: Array<{
    remaining: number;
    payment_amount: number;
    payment_date: string;
    payment_tax: number;
    shipping_price: number;
    full_payment: number;
  }>;
}

@Component({
  selector: 'schedule-payment-table',
  templateUrl: './schedule-payment-table.component.html',
  styleUrls: ['./schedule-payment-table.component.scss']
})
export class SchedulePaymentTableComponent implements OnInit, OnChanges {
  @Input() proposal: Proposal;
  @Input() subtotalPrice: number;
  @Input() totalPrice: number;
  @Input() shippingPrice: number;
  selectedSchedule: ProposalSchedulePaymentValidaton;
  paymentTableData: ValidationInfo;

  constructor(
    private proposalService: ProposalService,
    private proposalSchedulePaymentService: ProposalSchedulePaymentService
  ) { }

  ngOnInit() {
    this.validateSchedule();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['totalPrice']) {
      this.validateSchedule();
    }
  }

  private validateSchedule() {
    if (this.totalPrice === 0) {
      return;
    };
    this.proposalSchedulePaymentService.getList({proposal: this.proposal.id})
      .subscribe((schedules) => {
        if (schedules.length > 0) {
          this.selectedSchedule = schedules[0];
          this.selectedSchedule.price = this.totalPrice;
          this.selectedSchedule.subtotal = this.subtotalPrice;
          this.selectedSchedule.shipping_price = this.shippingPrice;
          this.selectedSchedule.autocorrect = true;
          this.proposalService.validatePaymentSchedule(this.proposal.id, this.selectedSchedule)
            .subscribe((res: ValidationInfo) => {
              res.result.forEach((p) => {
                let dt = moment(p.payment_date);
                if (dt.isValid()) {
                  p.payment_date = dt.format('MMMM D, YYYY');
                }
              });
              this.paymentTableData = res;
            });
        };
      });
  }

}
