import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import * as choices from '../team.constants';

@Component({
  selector: 'worker-inline',
  host: {
    'class': 'row item'
  },
  templateUrl: './worker-inline.component.html',
  styleUrls: ['./worker-inline.component.scss']
})
export class WorkerInlineComponent {
  @Input() worker: Worker;
  public choices: any = choices;

  constructor(
    private router: Router,
  ) {
  }

}
