export class Event {
  account: number;
  all_day?: boolean;
  brand?: number;
  confirmed?: boolean;
  contacts?: Array<any>;
  created?: string;
  email_template?: number;
  end?: string;
  event_data?: Array<any>;
  event_group: number;
  event_type?: number;
  event_type_details?: Object;
  has_conflict?: boolean;
  id?: number;
  location?: Object;
  main_contact?: number;
  modified?: string;
  name: string;
  notify_on_change?: boolean;
  slug?: string;
  start?: string;
  workers?: Array<any>;
}
