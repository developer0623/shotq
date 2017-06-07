import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { MerchantAccount, PAYMENT_PROVIDERS } from '../../models/merchant-account';
import { MerchantGateway } from '../../models/merchant-gateway';


@Injectable()
export class MerchantAccountService extends RestClientService<MerchantAccount> {
  baseUrl = 'payment/merchantaccount';

  getMerchantGateways() {
    return this.listGet('gateways')
      .map((gateways: MerchantGateway[]) => {
        return gateways.map(gateway => {
          gateway.icon = PAYMENT_PROVIDERS[gateway.key].image;
          return gateway;
        });
      });
  }

  test(id: number, data: any) {
    return this.itemPost(id, 'test', data);
  }

  charge(id: number, data: any) {
    return this.itemPost(id, 'charge', data);
  }

  getPaypalSecureToken(id: number) {
    return this.itemPost(id, 'paypal_secure_token', {
      'RETURNURL': `${this.apiService.apiUrl}${this._getItemUrl(id)}confirm_payment/`,
      'ERRORURL': `${this.apiService.apiUrl}${this._getItemUrl(id)}payment_error/`,
      'merchant_type': 'paypal_gateway',
      'amount': 1.00
    });
  }

  squareCallback(id: number, data = {}) {
    return this.itemPost(id, 'square_callback', data);
  }

  getSquareLocations(id: number) {
    return this.itemGet(id, 'square_locations');
  }

}
