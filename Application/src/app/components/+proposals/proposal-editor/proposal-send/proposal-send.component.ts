import { ContractSendComponent } from '../../../+contracts/contract-send/contract-send.component';
import { TemplateEmailService } from '../../../../services/template-email/template-email.service';
import { ContractService } from '../../../../services/contract/contract.service';
import { ContractsAddModalService } from '../../../+contracts/contracts-add/contracts-add-modal.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../../../../services/contact/contact.service';
import { SignatureService } from '../../../../services/signature/signature.service';
import { Component, ViewEncapsulation } from '@angular/core';
import { ProposalService } from '../../../../services/proposal/proposal.service';
import { JobService } from '../../../../services/job/job.service';
import { Proposal } from '../../../../models/proposal';
import { BookingLink } from '../../../../models/booking-link';
import { BookingLinkService } from '../../../../services/booking-link';


@Component({
  selector: 'app-proposal-send',
  templateUrl: './proposal-send.component.html',
  styleUrls: [
    './proposal-send.component.scss',
    '../../../+contracts/contract-send/contract-send.component.scss'
  ],
  encapsulation: ViewEncapsulation.Emulated,

})
export class ProposalSendComponent extends ContractSendComponent {
  proposal: Proposal;
  bookingLinks: BookingLink[] = [];

  signatureChoices: [
    {value: 'required', label: '​Signature Required'},
    {value: 'review', label: 'Review only'}
    ];

  constructor(mailTemplateService: TemplateEmailService,
              contractAddModalService: ContractsAddModalService,
              contractService: ContractService,
              contactService: ContactService,
              signatureService: SignatureService,
              modalService: ModalService,
              flash: FlashMessageService,
              router: Router,
              route: ActivatedRoute,
              private jobService: JobService,
              private proposalService: ProposalService,
              private bookingLinkService: BookingLinkService) {

    super(
      mailTemplateService,
      contractAddModalService,
      contractService,
      contactService,
      signatureService,
      modalService,
      flash,
      router,
      route,
    );

  }

  ngOnInit() {

    this.route.data
      .subscribe((data: {proposal: Proposal}) => {
        this.proposal = data.proposal;
        this.contract = this.proposal.contract_data;
        this.loadSignatures();
        this.loadBookingLinks();
      });

  }

  ngOnDestroy() {
    if (this.signaturesSub$)
      this.signaturesSub$.unsubscribe();
  }

  save() {
    this.saveRecipients()
      .switchMap(() => this.proposalService.save(this.proposal))
      .switchMap(() => this.proposalService.send(this.proposal.id))
      .subscribe((proposal: Proposal) => {
        this.proposal = proposal;
        this.flash.success('Proposal sent');
        this.router.navigate(['/jobs', this.proposal.job.id]);
      }, error => {
        this.flash.error('Proposal send error');
      });

  }

  get isDisabled() {
    return this.proposal && this.proposal.status !== 'Draft';
  }

  loadBookingLinks() {
    this.bookingLinkService.getList({proposal: this.proposal.id}).subscribe((links) => {
      this.bookingLinks = links;
    });
  }


}
