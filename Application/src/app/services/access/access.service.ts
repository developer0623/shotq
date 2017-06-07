import * as _ from 'lodash';
import { Injectable }              from '@angular/core';
import { ApiService }              from '../api';
import { GeneralFunctionsService } from '../general-functions';
import { Observable, Observer }    from 'rxjs';
import {
  Headers,
  Http
}                                  from '@angular/http';
import {
  Router,
  ActivatedRoute,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
}                                  from '@angular/router';

import 'rxjs/Rx';
import 'rxjs/add/observable/throw';
declare let require: (any);

import 'rxjs/Rx';

export const CURRENT_PROFILE_ID = 1;

@Injectable()
export class AccessService implements CanActivate {

  private canAccess: boolean = false;
  private functions;

  /* User Profile endpoint */
  private userProfileEndpoint = '/auth/me/';
  private oAuthLoginEndpoint = '/o/token/';

  /* Client Share endpoint */
  private clientShareEndpoint = '/account/clientshare/';

  /* Account endpoint */
  private accountEndpoint = '/account/account/';
  private accountWorkerListEndpoint = '/account/account/:account/worker_list/';

  /* User Sign Up endpoint */
  private signUpEndpoint = '/account/signup/';
  private testUniqueUsernameEndpoint = '/account/signup/test_unique_username/';
  private testUniqueEmailEndpoint = '/account/signup/test_unique_email/';

  /* User Password Reset endpoint */
  private PasswordResetRequestResetEndpoint = '/account/passwordreset/request_reset/';
  private PasswordResetPerformResetEndpoint = '/account/passwordreset/:key/perform_reset/';

  // Initialize services
  constructor(
    private http: Http,
    private apiService: ApiService,
    private router: Router
  ) {
    this.functions = new GeneralFunctionsService();
  }

  /**
   * Function to check if the current component can be accesed or require additional permissions.
   */
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Get token and set for all requests.
    this.canAccess = this.getCanAccess();
    if (!this.canAccess) {
      // Save, state.url as referer
      if (state.url !== undefined
        && state.url !== null
        && state.url !== '/login'
        && state.url !== '/sign-up'
        && state.url !== '/forgot-password'
      ) {
        sessionStorage.setItem('refererUrl', state.url);
      }
      this.router.navigate(['/login']);
    }
    return this.canAccess;
  }

  /**
   * Get the user profile information.
   */
  public getUserProfileInfo() {
    return this.apiService.get(`${this.userProfileEndpoint}`);
  }

  /**
   * Change the user profile information.
   */
  public updateUserProfileInfo(data) {
    return this.apiService.put(`${this.userProfileEndpoint}`, data);
  }

  /**
   * doOAuthLogin function to authenticate through API server.
   */
  public doOAuthLogin(loginData: any) {
    let headers = new Headers ({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.apiService.oAuthPost(`${this.oAuthLoginEndpoint}`, loginData, headers);
  }

  /**
   * Function to get logged in account id.
   */
  public getLoggedAccountId() {
    return this.apiService.get(`${this.accountEndpoint}`).do(
      (data) => {
        sessionStorage.setItem('accountInfo', JSON.stringify(data));
        this.apiService.setHeaders();
      });
  }

  public updateLoggedAccountInfo(id, data) {
    return this.apiService.put(`${this.accountEndpoint}${id}/`, data);
  }

  /**
   * Function to get workers related to the actual account.
   */
  public getAccountWorkerList() {
    let account = _.first(JSON.parse(sessionStorage.getItem('accountInfo')));
    return this.apiService.get(`${this.accountWorkerListEndpoint.replace(':account', account['id'])}`).do(
      (data) => {
        this.apiService.setHeaders();
      });
  }

  /**
   * Call to set the API call header
   */
  public setCredentials(id?: number) {
    if (id !== undefined) {
      this.apiService.setHeaders(id);
    } else {
      this.apiService.setHeaders();
    }
  }

  /**
   * [doResetPassword description]
   * @param {string} email [description]
   */
  public doResetPassword(email: string) {
    return this.apiService.post(this.PasswordResetRequestResetEndpoint, {'email': email}, {'Content-Type': 'application/json'});
  }

  /**
   * [doChangePassword description]
   * @param {string} key [description]
   * @param {string} password [description]
   */
  public doChangePassword(key: string, password: string) {
    return this.apiService.post(this.PasswordResetPerformResetEndpoint.replace(':key', key), {'password': password}, {'Content-Type': 'application/json'});
  }

  public updatePassword(data) {
    return this.apiService.put('/account/change-password/', data);
  }

  /**
   * [doOAuthSignUp description]
   * @param {any} signUpData [description]
   */
  public doOAuthSignUp(signUpData: any) {
    return this.apiService.post(this.signUpEndpoint, signUpData, {'Content-Type': 'application/json'});
  }

  /**
   * [testUniqueUsername description]
   * @param {string} username [description]
   */
  public testUniqueUsername(username: string) {
    return this.apiService.post(this.testUniqueUsernameEndpoint, {'username': username}, {'Content-Type': 'application/json'});
  }

  /**
   * [testUniqueEmailEndpoint description]
   * @param {string} email [description]
   */
  public testUniqueEmail(email: string) {
    return this.apiService.post(this.testUniqueEmailEndpoint, {'email': email}, {'Content-Type': 'application/json'});
  }

  getCanAccess(): boolean {
    let oAuthRawInfo = sessionStorage.getItem('OAuthInfo');
    let oAuthInfo = JSON.parse(oAuthRawInfo);
    return oAuthInfo !== undefined &&
      oAuthInfo !== null &&
      oAuthInfo.access_token !== undefined &&
      oAuthInfo.access_token !== null;
  }

  /**
   * Gets data for current contact on client site.
   */
  public getClientShareContact() {
    let path = `${this.clientShareEndpoint}`;
    return this.apiService.get(path);
  }
}
