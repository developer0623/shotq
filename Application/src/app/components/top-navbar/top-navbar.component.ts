import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewEncapsulation, ViewChild, ViewContainerRef
}                                       from '@angular/core';
import { Router }                       from '@angular/router';
import {
  cameraIconActions,
  accountActions
}                                       from './camera-icon-actions';
/* Services */
import { ModalService }                 from '../../services/modal/';
import { ContactService }               from '../../services/contact/contact.service';
import { JobService }                   from '../../services/job/job.service';
import { GeneralFunctionsService }      from '../../services/general-functions';
/* Modules */
import { QuickContactModule }           from '../quick-contact/quick-contact.module';
import { JobTypeService }               from '../../services/job-type/';
import { ApiService }                   from '../../services/api/';
import { FlashMessageService }          from '../../services/flash-message';
import { ContractsAddModalService }     from '../+contracts/contracts-add/contracts-add-modal.service';
import { Modal } from 'single-angular-modal/plugins/bootstrap';
import { QuickContractComponent, QuickContractWindowData } from './quick-contract/quick-contract.component';
import { overlayConfigFactory } from 'single-angular-modal';
import { QuickJobComponent, QuickJobWindowData } from './quick-job/quick-job.component';


@Component({
  selector: 'top-navbar',
  templateUrl: 'top-navbar.component.html',
  styleUrls: ['top-navbar.component.scss'],
  providers: [
    ContactService,
    JobService,
    JobTypeService,
    ApiService,
    GeneralFunctionsService,
    ContractsAddModalService
  ],
  encapsulation: ViewEncapsulation.None
})
export class TopNavbarComponent {
  @Input() sidebarCollapsed: Boolean;
  @Input() sidebarClientAccess: Boolean;
  @Output() toggleSidebar: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  @Output() canDisplay: EventEmitter<Boolean> = new EventEmitter<Boolean>();

  public search_box: string;
  public contactResults: any[] = [];
  public jobResults: any[] = [];
  public jobsListSelect: any;
  public perPage: number = 5;
  public isContactLoading: boolean = false;
  public isJobLoading: boolean = false;
  public currentDate: any;
  isMenuCollapsed: boolean = true;
  cameraIconActions = cameraIconActions;
  accountActions = accountActions;

  constructor(private modalService: ModalService,
              private contactService: ContactService,
              private jobService: JobService,
              private generalFunctions: GeneralFunctionsService,
              private jobTypeService: JobTypeService,
              private apiService: ApiService,
              private flash: FlashMessageService,
              private contractsAddModalService: ContractsAddModalService,
              public modal: Modal,
              private router: Router) {
  }

  ngOnInit() {
    this.jobsListSelect = [
      {'id': 1, 'name': 'Virginia & Bill\'s Wedding'},
      {'id': 2, 'name': 'Marian & Johnny\'s Wedding'},
      {'id': 3, 'name': 'Jack & Greta\'s Wedding'}
    ];
    this.currentDate = new Date();
  }

  emitToggleSidebar(): void {
    this.toggleSidebar.emit(null);
  }

  /**
   * Execute action function to execute modal function called from Dropdown component.
   * @param {Object} objAction With the object action.
   */
  executeAction(objAction) {
    if (objAction && objAction.action) {
      this[objAction.action]();
    }
  }

  logOut() {
    sessionStorage.removeItem('OAuthInfo');
    sessionStorage.removeItem('accountInfo');
    sessionStorage.removeItem('refererUrl');
    setTimeout(() => {
      this.generalFunctions.navigateTo('/login');
    }, 100);
  }

  /**
   * Open modal with the create quick contact content
   */
  private openCreateQuickContactModal() {
    let title = 'Quick Contact';
    let submitText = 'SAVE';
    let style = 'quickContactModal';
    this.modalService.setModalContent(QuickContactModule, title, style);
    this.modalService.setModalFooterBar(submitText.toUpperCase(), true, true);
    this.modalService.showModal();
  }

  /**
   * Open modal with the create quick job
   */
  private createQuickJob() {

    this.modal
      .open(QuickJobComponent, overlayConfigFactory({job: {}}, QuickJobWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            // Catching close event with result data from modal
            // console.log(result)
          })
          .catch(() => {
            // Catching dismiss event with no results
            // console.log('rejected')
          });
      });
  }


  private createQuickContract() {

    this.modal
      .open(QuickContractComponent,
        overlayConfigFactory({}, QuickContractWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            // Catching close event with result data from modal
            // console.log(result)
          })
          .catch(() => {
            // Catching dismiss event with no results
            // console.log('rejected')
          });
      });
  }

  /**
   * [search description]
   * @param {any} e [description]
   */
  private processSearchTerm(searchTerm: any) {
    // 1- Search by entity
    // 2- Get the results
    this.isContactLoading = true;
    this.isJobLoading = true;
    if (searchTerm !== '' && typeof searchTerm !== undefined) {
      this.contactService.searchContact(searchTerm, {page_size: this.perPage})
        .subscribe(response => {
            this.contactResults = response.contacts;
          },
          err => {
            console.error(`ERROR: ${err}`);
            this.isContactLoading = false;
          },
          () => {
            this.isContactLoading = false;
          }
        );
      this.jobService.getList({search: searchTerm, page_size: this.perPage})
        .subscribe(response => {
            this.jobResults = response.jobs;
          },
          err => {
            console.error(`ERROR: ${err}`);
            this.isJobLoading = false;
          },
          () => {
            this.isJobLoading = false;
          }
        );
    }
  }
}
