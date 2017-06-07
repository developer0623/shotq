import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Proposal, EXPIRATION_TYPE_X_DAYS, EXPIRATION_TYPE_NEVER_EXPIRE,
  proposalStatusArchived
} from '../../../models/proposal';
import { Signature } from '../../../models/signature.model';


@Component({
  selector: 'booking-welcome-screen',
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.scss']
})
export class BookingWelcomeScreenComponent implements OnInit {
  proposal: Proposal;
  message: string;
  proposalStatusArchived: string = proposalStatusArchived;
  canEnter: boolean = true;

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.message = (<any>this.route.snapshot.data).message;
    this.route.data
      .subscribe((data: {proposal: Proposal, signature: Signature}) => {
        this.proposal = data.proposal;
        this.canEnter = !this.proposal.expired && this.proposal.status !== proposalStatusArchived;
        if (this.canEnter && data.signature && data.signature.completed) {
          this.router.navigate(['../accepted'], {relativeTo: this.route});
        }
      });
  }

}
