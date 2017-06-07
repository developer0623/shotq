import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Contact } from '../../../models/contact';
import { ContactService } from '../../../services/contact/contact.service';
import { Observable } from 'rxjs';
import { JobService } from '../../../services/job/job.service';
import { Job } from '../../../models/job';
import { JobTypeService } from '../../../services/job-type/job-type.service';
import { JobType } from '../../../models/job-type';
import { ContractTemplateService } from '../../../services/contract-template/contract-template.service';
import { ContractTemplate } from '../../../models/contract-template.model';
import { ContractsAddModalService } from '../../+contracts/contracts-add/contracts-add-modal.service';

import { BSModalContext } from 'single-angular-modal/plugins/bootstrap/index';

import { DialogRef, ModalComponent } from 'single-angular-modal';
import { modalConfig } from '../../+contracts/contracts-add/contracts-add.component';

export class QuickContractWindowData extends BSModalContext {
  public job?: any;
}


@Component({
  selector: 'app-quick-contract',
  templateUrl: './quick-contract.component.html',
  styleUrls: [
    './quick-contract.component.scss'
  ],
  providers: [
    JobTypeService,

  ]
})
export class QuickContractComponent implements ModalComponent<QuickContractWindowData> {

  clientName: string = '';
  contact: Contact;
  form: FormGroup;
  clientSuggestions: Observable<string[]>;

  private jobName: string;
  private jobSuggestions: Observable<string[]>;
  private job: Job;
  private jobType: number;
  private jobInitialized: boolean = false;
  private jobTypes: JobType[] = [];
  private contractTemplates: any[] = [];
  private contractTemplate: ContractTemplate;
  private contractTemplateId: number;

  constructor(private fb: FormBuilder,
              private contactService: ContactService,
              private jobService: JobService,
              private jobTypeService: JobTypeService,
              private contractsAddModalService: ContractsAddModalService,
              private contractTemplateService: ContractTemplateService,
              public dialog: DialogRef<QuickContractWindowData>
  ) {
    this.clientSuggestions = Observable
      .create((observer: any) => {
        observer.next(this.clientName);
      })
      .switchMap(value => this.contactService.searchContact(value))
      .map(data => (data.contacts || []).map(contact => {
        contact.full_name = `${contact.first_name} ${contact.last_name}`;
        return contact;
      }));

    this.jobSuggestions = Observable
      .create((observer: any) => {
        observer.next(this.jobName);
      })
      .switchMap(value => this.jobService.getList({search: value}))
      .map(data => (data.jobs || []));

  }

  ngOnInit() {
    this.clearForm();
    this.getJobTypes();
    this.getContractTemplates();
    this.job = this.dialog.context['job'];
    if (this.job) {
      this.jobInitialized = true;
      this.jobName = this.job.name;
      this.jobType = this.job.job_type;
    }
  }

  onContactSelect(selectedData) {
    this.contact = selectedData.item;
  }

  onJobSelect(selectedData) {
    this.job = selectedData.item;
    this.jobType = this.job.job_type;
  }



  clearForm() {
    this.jobName = '';
    this.jobType = null;
    this.job = null;
    this.clientName = '';
    this.contact = null;
    this.contractTemplate = null;
    this.contractTemplateId = null;
  }

  getJobTypes() {
    this.jobTypeService.getList()
      .map(res => res.results.map(item => ({value: item.id, label: item.name})))
      .subscribe(res => {
        this.jobTypes = [
          ...res
        ];
      });
  }

  getContractTemplates() {
    this.contractTemplateService.getList()
      .subscribe(res => {
        this.contractTemplates = res.results;
      });
  }


  saveContact() {
    return Observable.create(observer => {
      if (this.contact) {
        observer.next(this.contact);
        observer.complete();
      } else {
        let fullName = this.clientName.split(' ');
        let contact = {
          first_name: fullName[0],
          last_name: fullName[1]
        };
        this.contactService.create(contact)
          .subscribe(res => {
            observer.next(res);
            observer.complete();
          });
      }
    });
  }

  saveJob() {
    return Observable.create(observer => {
      if (this.job) {
        observer.next(this.job);
        observer.complete();
      } else if (this.jobName) {
        this.jobService.create({
          name: this.jobName,
          job_type: this.jobType
        }).subscribe(res => {
          observer.next(res);
          observer.complete();
        });
      } else {
        observer.next();
        observer.complete();
      }
    });
  }

  save() {
    Observable.zip(this.saveContact(), this.saveJob())
      .subscribe(([contact, job]: [Contact, Job]) => {
        this.close();
        this.contractsAddModalService.openModal(this, <modalConfig>{
          contract: {
            contacts: [contact.id],
            template: this.contractTemplate.id,
            contents: this.contractTemplate.contents,
            title: this.contractTemplate.name,
            job: job ? job.id : null
          },
          enabledSteps: [],
          showOnErrors: true
        });
      });
  }


  valid() {
    return !!this.contractTemplate && !!this.contact;
  }

  close() {
    this.dialog.dismiss();
  }

}
