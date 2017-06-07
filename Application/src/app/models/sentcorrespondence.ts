import { Recipient } from './recipient';

export const CORRESPONDENCE_TYPE_CONTRACT = 'contract';
export const CORRESPONDENCE_TYPE_PROPOSAL = 'proposal';
export const CORRESPONDENCE_TYPE_QUESTIONNAIRE = 'questionnaire';

// correspondence_api_v1.SentCorrespondenceSerializer
export class SentCorrespondence {
  id?: number;
  account: number;
  brand?: number;
  subject: string;
  correspondence_types: string[];
  sender_email?: number;
  body: string;
  template?: number;
  job?: number;
  success: boolean;
  sent: string;
  recipients: Recipient[];
  sender_name: string;
  created: string;
  modified: string;
}
