import * as _ from 'lodash';
import { Component, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MerchantAccount, PAYMENT_PROVIDERS } from '../../../../models/merchant-account';
import { Proposal } from '../../../../models/proposal';
import { MerchantAccountService } from '../../../../services/merchant-account';
import { Observable } from 'rxjs/Observable';
import { MerchantGateway } from '../../../../models/merchant-gateway';

interface PaymentRecieving {
  merchant_account: number;
  collect_manually: boolean;
  pay_with_check: boolean;
}

@Component({
  selector: 'proposal-receive-payment',
  templateUrl: './receive-payment.component.html'
})
export class ProposalReceivePaymentComponent implements OnChanges {
  @Input() proposal: Proposal;
  @Output() paymentUpdated: EventEmitter<PaymentRecieving> = new EventEmitter<PaymentRecieving>();
  @Output() stepChange: EventEmitter<{ tab?: number, option: number }> = new EventEmitter<{ tab?: number, option: number }>();
  form: FormGroup;
  paymentProviders = PAYMENT_PROVIDERS;
  merchantAccounts: MerchantAccount[] = [];
  paymentData: PaymentRecieving;

  constructor(private fb: FormBuilder,
              private merchantAccountService: MerchantAccountService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['proposal']) {
      this.updateForm();
    }
  }

  updateForm() {
    this.paymentData = {
      merchant_account: this.proposal.merchant_account,
      collect_manually: this.proposal.collect_manually,
      pay_with_check: this.proposal.pay_with_check
    };
    this.form = this.fb.group({
      merchant_account: [this.paymentData.merchant_account],
      collect_manually: [Boolean(this.paymentData.collect_manually)],
      pay_with_check: [Boolean(this.paymentData.pay_with_check)]
    });
    this.form.controls['collect_manually'].valueChanges.subscribe((collectMannualy) => {
      if (collectMannualy) {
        this.form.patchValue({merchant_account: null});
      } else {
        this.form.patchValue({pay_with_check: false});
      }
    });
    this.form.controls['pay_with_check'].valueChanges.subscribe((payWithCkeck) => {
      if (payWithCkeck && this.paymentData.collect_manually) {
        this.form.patchValue({collect_manually: false});
      }
    });
    this.form.controls['merchant_account'].valueChanges.subscribe((merchantAccount) => {
      if (merchantAccount && this.paymentData.collect_manually) {
        this.form.patchValue({collect_manually: false});
      }
    });
    this.form.valueChanges.subscribe((values) => {
      this.paymentData = _.assign(this.paymentData, values);
      this.paymentUpdated.emit(this.paymentData);
    });
    Observable.zip(
      this.merchantAccountService.getList(),
      this.merchantAccountService.getMerchantGateways()
    )
    .subscribe(([accounts, gateways]: [MerchantAccount[], MerchantGateway[]]) => {
      this.merchantAccounts = accounts.filter(acc => !!gateways.find(gw => gw.key === acc.merchant_type));
      if (this.merchantAccounts.length === 0) {
        this.form.patchValue({
          collect_manually: true
        });
      }
    });
  }

  back(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.stepChange.emit({tab: -1, option: 1});
  }

  save(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.stepChange.emit({option: 5});
  }
}
