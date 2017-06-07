import { Event } from './event';

export class EventGroup {
  account: number;
  brand: number;
  contact: number;
  created: string;
  events: Array<Event>;
  id: number;
  job: number;
  modified: string;
  name: string;
  address?: string;
  start: string;
  end: string;
  all_day?: boolean;
}
