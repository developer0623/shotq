import { NgModule } from '@angular/core';
import { FBComponent } from './floating-button.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [
    FBComponent
  ],
  exports: [
    FBComponent
  ]
})
export class FBModule {}
