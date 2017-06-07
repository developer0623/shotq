import * as _ from 'lodash';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CORRESPONDENCE_TYPE_CONTRACT, CORRESPONDENCE_TYPE_PROPOSAL,
  CORRESPONDENCE_TYPE_QUESTIONNAIRE, SentCorrespondence
} from '../../../models/sentcorrespondence';

@Component({
  selector: 'correspondence-list',
  templateUrl: './correspondence-list.component.html',
  styleUrls: ['./correspondence-list.component.scss']
})
export class CorrespondenceListComponent {
  private _correspondence: SentCorrespondence[] = [];
  @Output() displayMessage = new EventEmitter<SentCorrespondence>();

  //noinspection JSUnusedGlobalSymbols
  @Input() get correspondence(): SentCorrespondence[] {
    return this._correspondence;
  }

  //noinspection JSUnusedGlobalSymbols
  set correspondence(value: SentCorrespondence[]) {
    this.resetCorrespondence(value);
  }

  private resetCorrespondence(value: SentCorrespondence[]) {
    this._correspondence = _.map(value, message => {
      let nameParts = _.take(_.words(message.sender_name || ''), 2);
      let messageType = _.head(message.correspondence_types || []) || '';
      let result = Object.assign(new SentCorrespondence(), message, {
        sender_name: message.sender_name || '',
        $senderFirstName: _.head(nameParts) || '',
        $senderInitials: _.map(nameParts, (s: string) => s[0]).join('').toLocaleUpperCase(),
        $senderPictureUrl: null,
        $isContract: messageType === CORRESPONDENCE_TYPE_CONTRACT,
        $isProposal: messageType === CORRESPONDENCE_TYPE_PROPOSAL,
        $isQuestionnaire: messageType === CORRESPONDENCE_TYPE_QUESTIONNAIRE,
      });
      _.each(result.recipients, recipient => {
        let recipientNameParts = _.take(_.words(recipient.recipient_name), 2);
        recipient['$firstName'] = _.head(recipientNameParts) || '';
        recipient['$initials'] = _.map(recipientNameParts, s => s[0]).join('');
      });
      return result;
    });
  }

  private onMessageClicked(message: SentCorrespondence) {
    this.displayMessage.emit(message);
  }
}
