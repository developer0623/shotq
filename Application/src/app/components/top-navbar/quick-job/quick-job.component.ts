import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Job } from '../../../models/job';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from 'single-angular-modal';
import { JobTypeService } from '../../../services/job-type/job-type.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { ApiService } from '../../../services/api/api.service';
import { JobService } from '../../../services/job/job.service';
import * as _ from 'lodash';
import { ContactService } from '../../../services/contact/contact.service';
import { EmailTypeService } from '../../../services/email-type/email-type.service';
import { EmailType } from '../../../models/email-type';
import { datesIntervalValidator } from '../../../validators';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';


export class QuickJobWindowData extends BSModalContext {
  public job: Job;
}

@Component({
  selector: 'app-quick-job',
  templateUrl: './quick-job.component.html',
  styleUrls: [
    './quick-job.component.scss'
  ],
  providers: [JobService, JobTypeService]
})
export class QuickJobComponent implements ModalComponent<QuickJobWindowData> {
  private jobForm: FormGroup;
  private newContactForm: FormGroup;
  private method: string;
  private job: Job;
  private emailTypes: EmailType[] = [];
  private jobTypes: any = [];
  private contacts: any = [];
  private dropdownSelectCustomActions: any = [];
  private showFormErrors: boolean = false;
  private isLoading: boolean = false;

  static patchFormValue(form, data, markTouched: boolean = false) {
    form.patchValue(data);
    if (markTouched) {
      for (let control in data) {
        if (data.hasOwnProperty(control))
          form.controls[control].markAsTouched();
      }
      form.markAsDirty();
    }
  }


  constructor(private fb: FormBuilder,
              private contactService: ContactService,
              private jobService: JobService,
              private jobTypeService: JobTypeService,
              private flash: FlashMessageService,
              private apiService: ApiService,
              private emailTypeService: EmailTypeService,
              private router: Router,
              public dialog: DialogRef<QuickJobWindowData>
  ) {
    this.job = this.dialog.context.job;
    this.method = this.job.id ? 'update' : 'create';
    this.dropdownSelectCustomActions = [
      {label: '+ Add a New Contact', action: this.showNewContactForm.bind(this)}
    ];
  }

  ngOnInit() {
    this.isLoading = true;
    this.initNewContactForm();
    this.initJobForm();
    this.initMainEventForm();
    this.initData();

    this.jobForm['controls'].main_event_group['controls'].to_be_determined.valueChanges.subscribe((to_be_determined) => {
      if (to_be_determined) {
        this.jobForm.controls.main_event_group.patchValue({start: null, end: null});
        this.jobForm['controls'].main_event_group['controls'].start.clearValidators();
        this.jobForm['controls'].main_event_group['controls'].end.clearValidators();
      } else {
        this.jobForm['controls'].main_event_group['controls'].start.setValidators(Validators.required);
        this.jobForm['controls'].main_event_group['controls'].end.setValidators(Validators.required);
      }
      this.jobForm['controls'].main_event_group['controls'].start.updateValueAndValidity();
      this.jobForm['controls'].main_event_group['controls'].end.updateValueAndValidity();
      this.jobForm.updateValueAndValidity();
    });
  }

  initJobForm() {
    this.jobForm = this.fb.group({
      name: [
        this.job.name,
        Validators.compose([
          Validators.required,
          Validators.maxLength(200)
        ])
      ],
      job_type: ['', Validators.required],
      external_owner: ['', Validators.required],
      main_event_group: this.initMainEventForm()
    });
  }

  initNewContactForm() {
    this.newContactForm = this.fb.group({
      first_name: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(200)
        ])
      ],
      last_name: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(200)
        ])
      ],
      default_email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(200)
        ])
      ],
    });
    this.newContactForm.disable();
  }

  initMainEventForm() {
    let is_determined = _.get(this.job, 'main_event_details.to_be_determined', false);
    return this.fb.group({
      address: [
        _.get(this.job, 'main_event_group.address', ''),
        Validators.compose([
          Validators.required,
          Validators.maxLength(200)
        ])
      ],
      start: is_determined ? [null] : [_.get(this.job, 'main_event_group.start', null), Validators.required],
      end: is_determined ? [null] : [_.get(this.job, 'main_event_group.end', null), Validators.required],
      to_be_determined: [is_determined],
      all_day: [_.get(this.job, 'main_event_details.all_day', false)],
    }, {validator: datesIntervalValidator('start', 'end')});
  }

  patchForm(formName: string, values: any) {
    QuickJobComponent.patchFormValue(this[formName], values);
  }

  getJobTypes() {
    return this.jobTypeService.getList()
      .map(res => res.results.map(item => ({value: item.id, label: item.name})));
  }

  getContacts() {
    return this.contactService.getContactList({page_size: 1000})
      .map(res => res.page.map(item => ({value: item.id, label: item.full_name})));
  }

  getEmailTypes() {
    return this.emailTypeService.getList()
      .map(res => res.results);
  }

  initData() {
    Observable.forkJoin([
      this.getJobTypes(),
      this.getContacts(),
      this.getEmailTypes()
    ]).finally(() => { this.isLoading = false; })
      .subscribe(([jobTypes, contacts, emailTypes]) => {
        this.jobTypes = jobTypes;
        setTimeout(() => {
          this.patchForm('jobForm', _.pick(this.job, ['job_type']));
        });

        this.contacts = contacts;
        if (this.job.external_owner)
          setTimeout(() => {
            this.patchForm('jobForm', {external_owner: this.job.external_owner.id});
          });

        this.emailTypes = emailTypes;
      });
  }

  formatMainEventGroup() {
    let data = this.jobForm.value['main_event_group'];
    return {
      address: data.address,
      start: data.start,
      end: data.end
    };
  }

  formatJobDataToSave() {
    let data = _.clone(this.jobForm.value);
    data['main_event'] = _.clone(this.jobForm.controls['main_event_group'].value);
    data['main_event_group'] = this.formatMainEventGroup();
    data['account'] = this.apiService.getAccount();
    return data;
  }

  formatNewContactDataToSave() {
    let data = _.clone(this.newContactForm.value);
    return {
      first_name: data.first_name,
      last_name: data.last_name,
      emails: [{
        'default': true,
        address: data.default_email,
        email_type: (_.head(this.emailTypes) || new EmailType()).id,
      }],
    };
  }

  update(data) {
    return this.jobService.update(this.job.id, data);
  }

  create(data) {
    return this.jobService.create(data);
  }

  createOrUpdate() {
    if (this.jobForm.invalid || this.newContactForm.invalid) {
      this.showFormErrors = true;
      return;
    }

    let observableArray = [Observable.of(null)];
    this.isLoading = true;
    let data = this.formatJobDataToSave();
    if (!data.external_owner)
      observableArray.push(this.createNewContact());

    Observable.forkJoin(observableArray)
      .finally(() => { this.isLoading = false; })
      .subscribe((success) => {
          let newContact = _.last(success);
          if (newContact)
            data.external_owner = newContact.id;

          this[this.method](data).subscribe(
            result => {
              this.flash.success(`The job has been ${this.method}d.`);
              this.router.navigate(['/jobs', result.id]);
              this.dialog.close(result);
            }
          );
        }, (err) => {
          this.flash.error('An error has occurred creating the job, please try again later.');
          console.error(err);
        }
      );
  }

  showNewContactForm() {
    this.patchForm('jobForm', {'external_owner': null});
    this.jobForm.controls.external_owner.clearValidators();
    this.jobForm.controls.external_owner.updateValueAndValidity();
    this.newContactForm.enable();
  }

  hideNewContactForm() {
    this.patchForm('jobForm', {external_owner: this.job.external_owner ? this.job.external_owner.id : null});
    this.jobForm.controls.external_owner.setValidators(Validators.required);
    this.jobForm.controls.external_owner.updateValueAndValidity();
    this.newContactForm.patchValue({'first_name': '', 'last_name': '', 'default_email': ''});
    this.newContactForm.disable();
  }

  createNewContact() {
    let data = this.formatNewContactDataToSave();
    return this.contactService.create(data);
  }

  close() {
    this.dialog.dismiss();
  }

}
