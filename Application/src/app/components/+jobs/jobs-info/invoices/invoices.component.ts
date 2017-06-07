import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  Inject,
  OnDestroy
}                                    from '@angular/core';
import { Router, ActivatedRoute }    from '@angular/router';
import { DOCUMENT }                  from '@angular/platform-browser';
import { Observable }                from 'rxjs/Observable';
/* Services */
import { JobContractInvoiceService } from '../../../../services/job-contract-invoice/job-contract-invoice.service';
import { GeneralFunctionsService }   from '../../../../services/general-functions';

declare let require: (any);

@Component({
    selector: 'invoices',
    templateUrl: './invoices.component.html',
    styleUrls : ['./invoices.component.scss'],
    providers: [JobContractInvoiceService]
})
export class InvoicesComponent {
  public _ = require('../../../../../../node_modules/lodash');
  public categories: Array<any> = [
    {
      id: 0,
      name: 'Contracts'
    },
    {
      id: 1,
      name: 'Invoices'
    }
  ];
  public totalItems = 0;
  public currentPage = 1;
  public perPage = 5;
  private paginator = {
    totalItems: 100,
    currentPage: 1,
    perPage: 5,
  };
  private router: Router;
  private activatedRoute: ActivatedRoute; // Routes url params extractor.
  private hasPages: boolean = false;
  private selectedCategoryId: number = 0;
  private jobInvoices: Array<any> = [];
  private jobContracts: Array<any> = [];
  private sub: any;
  private selectAllChecked: boolean = false;
  private itemsChecked: Array<any> = [];
  private isLoading: boolean = false;
  private checkTable: boolean = true;
  private tableAbleToDisplay: boolean = false;
  private jobId: number = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    _router: Router,
    activatedRoute: ActivatedRoute,
    private jobContractInvoiceService: JobContractInvoiceService,
    private generalFunctions: GeneralFunctionsService
  ) {
      this.router = _router;
      this.activatedRoute = activatedRoute;
  }

  ngOnInit() {
    let observableArray = [];
    this.sub = this.activatedRoute.params.subscribe(params => {
      if (params.hasOwnProperty('id') && params['id'].length) {
        let id = +params['id']; // (+) converts string 'id' to a number
        if (id) {
          this.jobId = id;
          this.getContracts();
        }
      }
    });
  }

  ngAfterViewInit() {
    let wrapper = document.getElementById('wrapper');
    if (wrapper) {
      wrapper.style.height = 'auto';
    }

    let $this = this;
    this.setTableHeight();
    // Add handler to recalculate table height when window is resized
    window.onresize = function() {
      $this.setTableHeight();
      $this.setTableWidth();
    };
    // Add scripts to handle the dropdown menu inside the responsive table
    let el: any = document.getElementById('table-container');
    let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (w < 768) {
      el.className += ' table-responsive ';
      el.addEventListener('click', function () {
        let dropdown: any = document.querySelector('div.btn-group.no-shadow.open');
        if (dropdown) {
          let options: any = document.querySelector('div.btn-group.no-shadow.open ul.dropdown-menu');
          let divh = options.clientHeight;
          let offset = dropdown.offsetTop;
          // Set the dropdown options position depends on the distance to the table top
          if (offset > divh) {
            options.style.top = 'inherit';
            options.style.bottom = '0';
          } else {
            options.style.top = '0';
            options.style.bottom = 'inherit';
          }
        }
      });
    }
  }

  ngDoCheck() {
    if (this.checkTable) {
      this.setTableHeight();
      this.setTableWidth();
    }
  }

  ngOnDestroy() {
    let wrapper = document.getElementById('wrapper');
    if (wrapper) {
      wrapper.style.height = '100%';
    }
  }
  /**
   * Get invoices and display them in a list.
   */
  private getInvoices() {
    this.isLoading = true;
    this.tableAbleToDisplay = false;
    this.jobContractInvoiceService.getJobInvoices(this.jobId)
      .subscribe(data => {
        this.jobInvoices = data.results as Array<any>;
      },
      err => {
        console.error(err);
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
        setTimeout(() => {
          this.setTableWidth();
        });
        setTimeout(() => {
          this.tableAbleToDisplay = true;
        }, 500);
        setTimeout(() => {
          this.setTableHeight();
        }, 560);
      });
  }
  /**
   * Get contracts and display them in a list.
   */
  private getContracts() {
    this.isLoading = true;
    this.tableAbleToDisplay = false;
    this.jobContractInvoiceService.getJobContracts(this.jobId)
      .subscribe(data => {
        this.jobContracts = data.results as Array<any>;
      },
      err => {
        console.error(err);
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
        setTimeout(() => {
          this.setTableWidth();
        });
        setTimeout(() => {
          this.tableAbleToDisplay = true;
        }, 500);
        setTimeout(() => {
          this.setTableHeight();
        }, 560);
      });
  }
  /**
   * Function to set the width of the th element of the table.
   */
  private setTableWidth() {
    this.generalFunctions.setTableWidth(this.document);
  }
  /**
   * Function to set the height of the th element of the table.
   */
  private setTableHeight() {
    this.generalFunctions.setTableHeight(this.document, this.checkTable);
  }
  /**
   * Update the list when a change page event is emited by pagination component.
   *
   * @param {any} event [description]
   */
  private handlePageChange(e: any) {
    this.paginator.perPage = e.perPage;
    this.hasPages = (this.paginator.perPage !== 0 && this.paginator.totalItems > this.paginator.perPage);
  }
  /**
   * Handle subtab changes
   *
   * @param {string} status [new current status]
   */
  private selectedCategoryChanged(categoryId: number) {
    this.isLoading = true;
    this.selectedCategoryId = categoryId;
    this.itemsChecked = [];
    this.selectAllChecked = false;
    if (this.selectedCategoryId === 0) {
      this.getContracts();
    } else if (this.selectedCategoryId === 1) {
      this.getInvoices();
    }
  }
  /**
   * Check all Invoices/Contracts
   */
  private checkAll() {
    this.selectAllChecked = !this.selectAllChecked;
    this.itemsChecked.splice(0);
    let activeList = this.selectedCategoryId === 0 ? this.jobContracts : this.jobInvoices;
    if (this.selectAllChecked && activeList) {
      for (let item of activeList) {
        this.checkItem(item);
      }
    }
  }
  /**
   * Check if an item is checked or not
   */
  private isChecked(item) {
    return (this.itemsChecked.indexOf(item.id) !== -1);
  }
  /**
   * Toogle the item selected status
   * @param {[Contact]}
   */
  private toggleCheck(item) {
    if (!this.isChecked(item)) {
      this.checkItem(item);
    } else {
      this.uncheckItem(item);
    }
  }
  /**
   * Check an item
   * @param {[type]}
   */
  private checkItem(item) {
    this.itemsChecked.push(item.id);
    let activeList = this.selectedCategoryId === 0 ? this.jobContracts : this.jobInvoices;
    if (this.itemsChecked.length === activeList.length) {
      this.selectAllChecked = true;
    } else {
      this.selectAllChecked = false;
    }
  }
  /**
   * Uncheck an item
   * @param {[type]}
   */
  private uncheckItem(item) {
    let i = this.itemsChecked.indexOf(item.id);
    this.itemsChecked.splice(i, 1);
    this.selectAllChecked = false;
  }
}
