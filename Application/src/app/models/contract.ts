import { Job } from './job';
export class Contract {
  id?: number;
  account?: number;
  title?: string;
  contents?: string;
  billing_order?: any;
  job?: number | any;
  template?: number;
  created?: Date;
  modified?: Date;
  contacts?: number[];
  job_data?: Job;
  status?: string;
}

export const contractStatusArchived = 'archived';
export const contractStatusSigned = 'signed';
