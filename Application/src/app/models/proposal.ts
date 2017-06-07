import { Job } from './job';
import { Package } from './package';
import { Contract } from './contract';
import { Item } from './item';
import { BaseProposal } from './base-proposal';

export const EXPIRATION_TYPE_X_DAYS = 'in x days';
export const EXPIRATION_TYPE_ON_DATE = 'on date';
export const EXPIRATION_TYPE_NEVER_EXPIRE = 'never';

export const EXPIRATION_TYPE_CHOICES = [
  {value: EXPIRATION_TYPE_X_DAYS, label: 'days'},
  {value: EXPIRATION_TYPE_ON_DATE, label: 'On Date'},
  {value: EXPIRATION_TYPE_NEVER_EXPIRE, label: 'Never Expire'}
];


export interface Proposal extends BaseProposal {
  status?: string;
  packages?: Package[];
  job: Job;
  merchant_account?: number;
  collect_manually?: boolean;
  pay_with_check?: boolean;

  expire_type?: any;
  expire_at?: Date;
  expire_days?: number;

  contract?: number;
  contract_data?: Contract;

  sent_at?: Date;
  expiration_date?: Date;
  expired?: boolean;

  email_subject?: string;
  email_contents?: string;

  approved_package?: number;
  approved_package_data?: Package;

  settings_edited?: boolean;
  addons?: Item[];
}

export const proposalStatusArchived = 'Canceled';
export const proposalStatusAccepted = 'Accepted';
export const proposalStatusDraft = 'Draft';
export const proposalStatusSent = 'Sent';
