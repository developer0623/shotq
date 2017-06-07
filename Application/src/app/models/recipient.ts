export interface Recipient {
  id?: number;
  recipient_type: string;
  recipient_name: string;
  email?: number;
  static_email?: string;
  correspondence?: number;
  sent_correspondence?: number;
}
