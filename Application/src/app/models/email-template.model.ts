export class EmailTemplate {
  id: number;
  name: string;
  contents: string;
  color?: string;
  account?: number;
  created: Date;
  modified: Date;
  to?: string;
  cc?: string;
  bcc?: string;
  send_me_copy?: boolean;
}
