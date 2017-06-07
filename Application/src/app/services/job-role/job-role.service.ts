import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { JobRole } from '../../models/job-role';

@Injectable()
export class JobRoleService extends RestClientService<JobRole> {
  baseUrl = 'job/jobrole';

  public static newObject(data?: object): JobRole {
    return Object.assign(new JobRole(), data || {});
  }
}
