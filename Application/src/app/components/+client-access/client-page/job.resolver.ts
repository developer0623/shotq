import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Job } from '../../../models/job';
import { JobService } from '../../../services/job';

@Injectable()
export class JobResolve implements Resolve<Job> {

  constructor(private jobService: JobService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.jobService.get(route.paramMap.get('jobId'));
  }
}
