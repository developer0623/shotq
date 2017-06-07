import * as addressParser from 'parse-address';

export class BaseAddress {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;

  static parse(address: string): BaseAddress {
    let result = new BaseAddress();
    let parsedData = addressParser.parseLocation(address);
    if (parsedData) {
      result.country = 'US';  // the parser support US addresses only
      result.zip = parsedData.zip || '';
      result.state = parsedData.state || '';
      result.city = parsedData.city || '';
      result.address1 = [
        parsedData.number || '',
        parsedData.street || '',
        parsedData.type || ''
      ].join(' ').trim();
      result.address2 = [
        parsedData.sec_unit_type || '',
        parsedData.sec_unit_num || ''
      ].join(' ').trim();
      return result;
    }
    return;
  }

  toString(): string {
    return [
      this.address1,
      this.address2,
      this.city, this.state, this.zip,
      // the country part makes the address unrecognizable by the parser
      // this.country
    ].join(' ').trim();
  }
}

export class Address extends BaseAddress {
  id: number;
  created: Date;
  visible: boolean;
  address_type: number;
  address_type_name: string;
  person: number;
  opened: boolean;
  name: string;
  account: number;
  isLoading: boolean; // virtual field for contact edit

  constructor() {
    super();
    this.isLoading = false;
  }
}
