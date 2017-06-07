import { MerchantAccount } from './merchant-account';
export class MerchantGateway {
  key: string;
  name: string;
  metadata: any[];
  icon?: string;
  account?: MerchantAccount;
}
