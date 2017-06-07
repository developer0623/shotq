import * as _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
/* Components */
import { TimelineComponent } from '../../shared/timeline/timeline.component';
/* Services */
import { JobService } from '../../../services/job';
import { TaxService } from '../../../services/tax';
import { DiscountService } from '../../../services/discount';
import { ProposalService } from '../../../services/proposal';
import { JobTypeService } from '../../../services/client-access/job-type/';
import { FlashMessageService } from '../../../services/flash-message';
import { InvoiceService } from '../../../services/client-access/billing';
/* Models */
import { Package } from '../../../models/package';
import { Proposal } from '../../../models/proposal';
import { JobType } from '../../../models/job-type';
import { Job } from '../../../models/job';
import { Discount } from '../../../models/discount.model';
import { Tax } from '../../../models/tax.model';
import { BookingOverview } from '../../../models/proposal-payment-overview.model';

@Component({
  selector: 'overview',
  templateUrl: 'overview.component.html',
  styleUrls: ['overview.component.scss'],
  providers: [JobService, JobTypeService, InvoiceService, TaxService, DiscountService, ProposalService]
})
export class OverviewComponent {
  private job: Job;
  private overview: BookingOverview;
  private isLoading: boolean = false;
  private jobTypes: JobType[] = [];
  private pckg: Package;
  private packageInvoices: Array<any> = [];
  private examplePackageInvoices: Array<any> = [
    {
      'due': '2017-11-30',
      'amount': '12.00',
      'status': 'paid'
    },
    {
      'due': '2017-12-31',
      'amount': '12.00',
      'status': 'paid'
    },
    {
      'due': '2017-04-08',
      'amount': 12.00,
      'status': 'new'
    },
    {
      'due': '2017-05-04',
      'amount': 12.00,
      'status': 'new'
    }
  ];
  private nextPayment: any = {};

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private discountService: DiscountService,
    private taxesService: TaxService,
    private jobTypeService: JobTypeService,
    private proposalService: ProposalService,
    private billingService: InvoiceService,
    private flash: FlashMessageService
  ) { }

  ngOnInit() {
    this.route.parent.data.subscribe(data => {
      this.job = data['job'];
      this.loadData();
    });
  }

  loadData() {
    this.isLoading = true;

    let observableArray = [
      this.jobService.getOrCreateProposal(this.job.id)
    ];
    Observable.forkJoin(observableArray)
      .subscribe(([proposal]: [Proposal]) => {
        this.formatWorkerRoles();

        Observable.zip(
          this.discountService.getList({proposal: proposal.id}).map(res => res.results),
          this.taxesService.getList({proposal: proposal.id}).map(res => res.results)
        ).subscribe(([discounts, taxes]: [Discount[], Tax[]]) => {
          this.overview = this.proposalService.generateProposalPaymentOverview(proposal, discounts, taxes);
        });
        this.pckg = proposal.approved_package_data;
        this.isLoading = false;
      });
  }

  /**
   * Format the worker roles
   */
  public formatWorkerRoles() {
    for (let worker of this.job.job_workers) {
      if (worker.roles && worker.roles.length === 1) {
        worker['$formattedRoles'] = worker.roles[0].name;
      } else if (worker.roles) {
        let aux = [];
        for (let role of worker.roles) {
          aux.push(role.name);
        }
        if (aux.length > 0) {
          worker['$formattedRoles'] = _.compact(aux).join(', ');
        }
      }
    }
  }

  /**
   * Format payment due (convert to Date) and amount (convert to float)
   */
  public formatPayments() {
    for (let i = 0; i < this.packageInvoices.length; i++) {
      if (this.packageInvoices[i].due) {
        this.packageInvoices[i].due = new Date(this.packageInvoices[i].due + 'T23:59:59Z');
      }
      if (this.packageInvoices[i].amount && typeof this.packageInvoices[i].amount === 'String') {
        this.packageInvoices[i].amount = parseFloat(this.packageInvoices[i].amount);
      }
    }
    this.getNextPayment();
  }

  /**
   * Get the next payment to show on its section
   */
  public getNextPayment() {
    let today = new Date();
    let smallerPayDiff = null;
    let smallerPayIdx = null;
    for (let i = 0; i < this.packageInvoices.length; i++) {
      if (this.packageInvoices[i].status && this.packageInvoices[i].status === 'new' && this.packageInvoices[i].due) {
        let paymentDue = this.packageInvoices[i].due;
        // check if is the closest date
        if (this.packageInvoices[i].due.getTime() >= today.getTime()) {
          // assign the first 'new' payment as closest
          if (!smallerPayDiff) {
            smallerPayDiff = this.packageInvoices[i].due.getTime();
            smallerPayIdx = i;
          } else if (smallerPayDiff && smallerPayDiff > this.packageInvoices[i].due.getTime()) {
            smallerPayDiff = this.packageInvoices[i].due.getTime();
            smallerPayIdx = i;
          }
        }
      }
    }
    // assign the closest payment
    if (smallerPayIdx && this.packageInvoices[smallerPayIdx]) {
      this.nextPayment = this.packageInvoices[smallerPayIdx];
      this.packageInvoices.splice(smallerPayIdx, 1);
    }
  }
}
