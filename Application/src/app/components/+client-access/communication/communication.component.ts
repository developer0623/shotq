import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SentCorrespondence } from '../../../models/sentcorrespondence';
import { Job } from '../../../models/job';
import { JobService } from '../../../services/job';
import { SentCorrespondenceService } from '../../../services/sent-correspondence';
import { ExampleCorrespondence } from './example-correspondence';

@Component({
  selector: 'communication',
  templateUrl: './communication.component.html',
  styleUrls: ['./communication.component.scss'],
})
export class CommunicationComponent implements OnInit {
  job: Job;
  correspondence: SentCorrespondence[] = [];

  constructor(
    private route: ActivatedRoute,
    private sentCorrespondenceService: SentCorrespondenceService
  ) { }

  ngOnInit() {
    this.route.parent.data.subscribe((data: {job: Job}) => {
      this.job = data.job;
      this.sentCorrespondenceService.getList({job: this.job.id}).subscribe(res => {
        this.correspondence = res.results;
      });
    });
  }
}
