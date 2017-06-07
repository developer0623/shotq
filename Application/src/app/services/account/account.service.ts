import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { Account } from '../../models/account';

@Injectable()
export class AccountService {
  // Account endpoint
  accountEndpoint: string = '/person/account/';

  constructor(private apiService: ApiService) {
  }
}
