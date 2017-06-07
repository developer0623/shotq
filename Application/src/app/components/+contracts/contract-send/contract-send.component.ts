import { Component, ViewEncapsulation } from '@angular/core';
import { ContractService, SignatureService, TemplateEmailService } from '../../../services';
import { Contract, EmailTemplate, Signature } from '../../../models';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '../../../services/modal/modal.service';
import { ContactService } from '../../../services/contact/contact.service';
import { ContractsAddModalService } from '../contracts-add/contracts-add-modal.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';

@Component({
  selector: 'app-contract-send',
  templateUrl: './contract-send.component.html',
  styleUrls: [
    './contract-send.component.scss'
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ContractSendComponent {
  isLoading: boolean;
  isDisabled: boolean;
  contract: Contract;
  signaturesSub$: Subscription;

  private mailTemplateSub$: Subscription;
  private emailTemplates: EmailTemplate[];
  private signatures: Signature[] = [];
  private emailTemplate: EmailTemplate = new EmailTemplate();
  private emailSubject: string;
  private modalInstance = null;
  private emailTemplateContents = '';
  private modalHideSub$: Subscription;

  constructor(private mailTemplateService: TemplateEmailService,
              private contractAddModalService: ContractsAddModalService,
              public contractService: ContractService,
              private contactService: ContactService,
              private signatureService: SignatureService,
              public modalService: ModalService,
              public flash: FlashMessageService,
              public router: Router,
              public route: ActivatedRoute) {
    this.modalHideSub$ = this.modalService.onHide.subscribe(res => {
      this.loadSignatures();
    });

  }

  ngOnInit() {

    this.mailTemplateSub$ = this.mailTemplateService.getList()
      .subscribe((emailTemplates: EmailTemplate[]) => {
        this.emailTemplates = emailTemplates;
        if (emailTemplates.length > 0)
          this.emailTemplate = emailTemplates[0];
      });

    this.route.params
      .switchMap((params: { id: string }) => {
        this.isLoading = true;
        return this.contractService.get(parseInt(params.id, 10));
      })
      .subscribe((contract: Contract) => {
        this.isLoading = false;
        this.contract = contract;
        this.isDisabled = contract.status !== 'draft';

        this.loadSignatures();
      });
  }

  save() {
    this.saveRecipients()
      .switchMap(() => this.contractService.save(this.contract))
      .switchMap(res => this.contractService.send(this.contract.id))
      .subscribe(res => {
        this.flash.success('Contract sent');
        this.router.navigate(['/contracts']);
      }, error => {
        this.flash.error('Contract send error');
      });
  }

  saveRecipients() {
    return Observable.zip(
      ...this.signatures.map(signature => this.signatureService.save(signature))
    );
  }

  loadSignatures() {
    if (this.signaturesSub$)
      this.signaturesSub$.unsubscribe();
    this.signaturesSub$ = this.signatureService.getList({legal_document: this.contract.id})
      .subscribe(res => {
        this.signatures = res.results.filter(sig => !sig.worker);
      });
  }

  ngOnDestroy() {
    if (this.mailTemplateSub$)
      this.mailTemplateSub$.unsubscribe();
    if (this.signaturesSub$)
      this.signaturesSub$.unsubscribe();

    this.modalHideSub$.unsubscribe();
  }

  addContactInline() {
    let signature = new Signature();

    signature.sig_type = 'full';
    signature.legal_document = this.contract.id;

    this.signatures.push(signature);
  }

  addFromContacts() {
    this.contract.contacts = this.signatures.filter(sig => !!sig.contact).map(sig => sig.contact);

    this.contractAddModalService.openModal(this, {
      contract: this.contract,
      enabledSteps: ['contact']
    });

  }
}
