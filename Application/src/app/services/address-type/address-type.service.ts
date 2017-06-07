import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { AddressType } from '../../models/address-type';

@Injectable()
export class AddressTypeService extends RestClientService<AddressType> {
  baseUrl = 'person/address_type';

  public static newObject(data?: object): AddressType {
    return Object.assign(new AddressType(), data || {});
  }
}
