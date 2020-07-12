import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'customFormat'
})
export class CustomFormatPipe extends DatePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return super.transform(value, "EEEE d MMMM y h:mm a");
  }

}
