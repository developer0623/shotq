import {
 Component,
 OnInit,
 ViewChild,
 AfterViewInit
}                                  from '@angular/core';
/* Services */
import { AccessService }           from '../../../services/access';
import { GeneralFunctionsService } from '../../../services/general-functions';
import { FlashMessageService }     from '../../../services/flash-message';
declare let process: (any);

@Component({
  selector: 'log-in',
  templateUrl: 'log-in.component.html',
  styleUrls: ['log-in.component.scss'],
  providers: [AccessService, GeneralFunctionsService, FlashMessageService]
})
export class LogInComponent implements OnInit {
  @ViewChild('inputUsername')      inputUsername: any;
  public username:                 string;
  public password:                 string;
  public isLoading:                boolean = false;
  public hideLoginScreen:          boolean = false;

  constructor(
    private accessService:         AccessService,
    private generalFunctions:      GeneralFunctionsService,
    private flash:                 FlashMessageService
  ) {}
  /**
   * ngOnInit hook
   */
  ngOnInit() {
  }
  /**
   * ngAfterViewInit hook
   */
  ngAfterViewInit() {
    if (this.inputUsername !== undefined) {
      this.inputUsername.nativeElement.focus();
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
   * Function to perform log-in.
   */
  public doLogin() {
    this.isLoading = true;
    if (this.username !== undefined
     && this.username !== ''
     && this.password !== undefined
     && this.password !== '') {
      let loginData = {
        'username': this.username,
        'password': this.password,
        'grant_type': process.env.APICONFIG.grant_type,
        'client_id': process.env.APICONFIG.client_id,
        'client_secret': process.env.APICONFIG.client_secret,
      };
      let postData = this.generalFunctions.getSearchParams(loginData);
      // MAKE API OAUTH POST REQUEST
      this.accessService.doOAuthLogin(postData.toString())
        .subscribe(
          response => {
            this.hideLoginScreen = true;
            sessionStorage.setItem('OAuthInfo', JSON.stringify(response));
            this.accessService.setCredentials();
            /* Check for refererUrl and redirect after login */
            let refererUrl = sessionStorage.getItem('refererUrl');
            if (refererUrl !== undefined && refererUrl !== null) {
              setTimeout(() => {
                this.navigateTo(refererUrl);
                sessionStorage.removeItem('refererUrl');
                refererUrl = undefined;
              });
            } else {
              setTimeout(() => {
                this.navigateTo('/contacts');
              });
            }
            /* Get and set account id */
            this.accessService.getLoggedAccountId()
              .subscribe(data => {
                sessionStorage.setItem('accountInfo', JSON.stringify(data));
                this.accessService.setCredentials();
                },
                err => {
                  console.error(err);
                  this.isLoading = false;
                },
                () => {
                  this.isLoading = false;
                }
              );
          },
          err => {
            console.error(err);
            this.flash.error('Login failed. Please try again.');
            this.isLoading = false;
            this.password = '';
          },
          () => {
            this.isLoading = false;
          }
        );
    } else {
      this.flash.error('We didn\'t recognize the username or password you entered. Please try again.');
      this.isLoading = false;
      this.password = '';
    }
  }
}
