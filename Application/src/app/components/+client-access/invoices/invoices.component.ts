import {
  Component,
  OnInit
}                                  from '@angular/core';
/* Services */
import { InvoiceService }          from '../../../services/client-access/billing/billing.service';
import { PackageService }          from '../../../services/client-access/package/package.service';
import { GeneralFunctionsService } from '../../../services/general-functions';
import { ModalService }            from '../../../services/modal/';
/* Modules */
import { PayInvoiceModule }        from './pay-invoice';
import { ActivatedRoute } from '@angular/router';
import { Job } from '../../../models/job';
import { Package } from '../../../models/package';
import { JobService } from '../../../services/job/job.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'invoices',
  templateUrl: 'invoices.component.html',
  styleUrls: ['invoices.component.scss'],
  providers: [InvoiceService, PackageService, GeneralFunctionsService]
})
export class InvoicesComponent {
  private job: Job;
  private isLoading: boolean = false;
  private openAddOns: boolean = false;
  private openShipping: boolean = false;
  private openTax: boolean = false;
  private invoice: any;
  private package: Package;
  private modalInstance: any = null;
  private paymentHistory: Array<any> = [
    {
      'transaction_id': '000000001',
      'description': 'Refunded on',
      'date': new Date(),
      'payment_type': 'credit card',
      'amount': 10
    },
    {
      'transaction_id': '000000002',
      'description': 'Paid on',
      'date': new Date(),
      'payment_type': 'stripe',
      'amount': 20
    },
    {
      'transaction_id': '000000003',
      'description': 'Refunded on',
      'date': new Date(),
      'payment_type': 'credit card',
      'amount': 30
    },
    {
      'transaction_id': '000000004',
      'description': 'Paid on',
      'date': new Date(),
      'payment_type': 'stripe',
      'amount': 40
    }
  ];

  constructor(private invoiceService: InvoiceService,
              private packageService: PackageService,
              private generalFunctions: GeneralFunctionsService,
              private modalService: ModalService,
              private jobService: JobService,
              private route: ActivatedRoute) {
  }

  /**
   * Init hook
   */
  ngOnInit() {
    this.route.parent.data
      .switchMap((data: { job: Job }) => {
        this.job = data.job;
        return Observable.forkJoin([
          this.jobService.getOrCreateProposal(this.job.id)
            .map(proposal => proposal.approved_package_data),
          this.invoiceService.getInvoiceInfoByJob(this.job.id)
            .map(invoices => invoices[0])
        ]);
      })
      .subscribe(([pckg, invoice]: [Package, any]) => {
        this.package = pckg;
        this.invoice = invoice;

        this.package.addons = this.package.addons.filter(addon => addon.approved);
      }, err => {
        console.error(err);
        this.isLoading = false;
      });

    /* Temporary fix for location on app reload and modal still open. */
    // if (location.hash.search('modalOpen') > -1) {
    //   location.hash = location.hash.replace('?modalOpen', '');
    // }
    // Remove this test object when API will be fully integrated.
    // this.invoiceInfo = {
    //   'number': '#SQ1101384',
    //   'event': 'Virginia & Bill\'s Wedding',
    //   'date': new Date(),
    //   'due_date': new Date(),
    //   'package_name': '2016 Wedding Package',
    //   'package_description': 'This package includes 4hrs of coverage, an engagement session, 12 fine art prints, and one 8x8 sunrise album.',
    //   'package_price': 2500,
    //   'add_ons': [
    //     {
    //       'id': 1,
    //       'description': '8x8 Sunrise Book: 20 Extra Pages',
    //       'price': 1598
    //     },
    //   ],
    //   'shipping': 60,
    //   'tax': 100,
    //   'total': 1520
    // };

  }

  /**
   * Open pay invoice modal.
   */
  private openModal() {
    let style = 'modal-lg client-access-modal';
    let title = 'Pay Invoice';
    let submitText = 'Save';
    this.modalService.setModalContent(PayInvoiceModule, title, style);

    if (this.modalInstance) {
      this.modalInstance.ngOnInit();
    }
    this.modalService.setParentRef(this);
    this.modalService.setModalFooterBar(submitText, false, false);
    this.modalService.showModal(false, true);
    setTimeout(() => {
      let subscriber = this.modalService.templateChange.subscribe(data => {
        this.modalInstance = data.instance;
        this.modalInstance.setComponentRef(this);
        this.modalInstance.ngOnInit();
      });
      this.modalService.subscribeTemplateChange(subscriber);
    });
  }
}
