import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { JobType } from '../../models/job-type';

@Injectable()
export class JobTypeService extends RestClientService<JobType> {
  baseUrl = 'job/jobtype';
}
