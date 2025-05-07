import { Injectable } from '@angular/core';
import { InitService } from '@exlibris/exl-cloudapp-angular-lib';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  public constructor(private initService: InitService) {}
}
