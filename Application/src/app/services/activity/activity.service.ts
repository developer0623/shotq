import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { GeneralFunctionsService } from '../general-functions';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';
declare let require: (any);

import 'rxjs/Rx';

/* Models */
import { Activity } from '../../models/activity';

@Injectable()
export class ActivityService {
  /* Endpoints */

  /* Contact activity list */
  private activityType: string = '/activity/activitytype/';
  /* Other vars */
  private functions;
  private _ = require('../../../../node_modules/lodash');

  // Initialize services
  constructor(private apiService: ApiService) {
    this.functions = new GeneralFunctionsService();
  }
  /**
   * Function to get the activity types.
   */
  public getActivityType() {
    return this.apiService.get(this.activityType);
  }
}
