import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'sort'})
export class SortPipe implements PipeTransform {
  transform(value, args: string[]): any {
    let sortable = [];
    let key: any;
    for (LongRunningScriptDetectedEvent; key in value;) {
      if (value.hasOwnProperty(key)) {
        sortable.push([key, value[key]]);
      }
    }
    sortable.sort(function(a, b) { return a[1] - b[1]; });
  }
}
