import { Injectable } from '@angular/core';
@Injectable()
export class AlertifyService {
  alertify = require('../../assets/theme/assets/vendor/alertify-js/alertify.js');

  confirm = this.alertify.confirm;
  prompt = this.alertify.prompt;

  constructor() {
    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');
  }
}
