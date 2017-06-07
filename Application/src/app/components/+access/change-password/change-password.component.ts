import { Component, OnInit, ViewChild, AfterViewInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AccessService } from '../../../services/access';
import { GeneralFunctionsService } from '../../../services/general-functions';
import { FlashMessageService } from '../../../services/flash-message';
import { ActivatedRoute } from '@angular/router';
declare let process: (any);

@Component({
  selector: 'change-password',
  templateUrl: 'change-password.component.html',
  styleUrls: ['change-password.component.scss'],
  providers: [AccessService, GeneralFunctionsService, FlashMessageService]
})
export class ChangePasswordComponent implements OnInit {
  @ViewChild('inputEmail') inputEmail: any;
  public isLoading: boolean = false;
  public recoverSent: boolean = false;
  public key: string | null = null;
  public showFormErrors: boolean = false;
  private changePasswordForm: FormGroup;

  constructor(
    private accessService: AccessService,
    private generalFunctions: GeneralFunctionsService,
    private flash: FlashMessageService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.buildForm();
    this.route.params.subscribe((params) => {
      if (params['key']) {
        this.key = params['key'];
      }
    });
  }

  /**
   * ngAfterViewInit hook
   */
  ngAfterViewInit() {
    if (this.inputEmail !== undefined) {
      this.inputEmail.nativeElement.focus();
    }
  }

  /**
   * [navigateTo description]
   * @param {stirng} location [description]
   */
  public navigateTo(location: string) {
    this.generalFunctions.navigateTo(location);
  }

  /**
   * Function to perform Recover Password.
   */
  public doChangePassword(): void {
    this.showFormErrors = true;
    if (this.changePasswordForm.valid) {
      this.isLoading = true;
      // MAKE API OAUTH POST REQUEST
      this.accessService.doChangePassword(this.key, this.changePasswordForm.value.password1)
        .subscribe(
          data => {
            this.flash.success('Password was successfully changed.');
            this.navigateTo('/login');
          },
          err => {
            this.flash.error('Change password failed, please try again.');
            this.navigateTo('/forgot-password');
            console.error(err);
          },
          () => this.isLoading = false
        );
    }
  }
  buildForm(): void {
    this.changePasswordForm = this.formBuilder.group({
      'password1': [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(128),
        ])
      ],
      'password2': [
        '',
        Validators.compose([
          Validators.required,
          this.validatePasswordConfirm.bind(this)
        ])
      ]
    });
  }
  public validatePasswordConfirm(control) {
    if (!control.value || this.changePasswordForm.value.password1 === control.value)
      return null;
    return {[`passwordConfirmInvalid`]: true};
  }
}
