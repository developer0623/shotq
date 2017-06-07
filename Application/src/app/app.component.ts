import {
 Component,
 DoCheck,
 AfterViewInit,
 ViewEncapsulation,
 ViewContainerRef,
}                              from '@angular/core';
import {
 Router,
 RoutesRecognized
}                              from '@angular/router';
/* Services */
import { AppState }            from './app.service';

declare let require:           (any);
declare let $:                 (any);
declare let velocity:          (any);
declare let matFloatingButton: (any);
declare let waves:             (any);

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    '../assets/css/app.style.scss',
    '../assets/css/bootstrap-datetimepicker.css',
    'components/+settings/contract-templates/template-variables/template-variable-item.scss'
  ],
  templateUrl: './app.component.html'
})
export class App {
  viewContainerRef:         ViewContainerRef;
  isSidebarCollapsed:       boolean = true;

  $ = require('../../node_modules/jquery/dist/jquery.min.js');
  velocity = require ('./assets/theme/assets/js/components/velocity.min.js');
  matFloatingButton = require('./assets/theme/assets/js/components/material-floating-button.min.js');
  waves = require('./assets/theme/assets/vendor/waves/waves.js');

  constructor(
    public appState:            AppState,
    viewContainerRef:           ViewContainerRef,
    private router?:            Router
    ) {
    this.viewContainerRef = viewContainerRef;
  }

  ngAfterViewInit() {
    this.waves.init();
  }
}
