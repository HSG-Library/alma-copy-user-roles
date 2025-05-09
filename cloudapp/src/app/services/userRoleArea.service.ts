import { DestroyRef, Injectable } from '@angular/core';
import {
  CloudAppRestService,
  HttpMethod,
  Request,
} from '@exlibris/exl-cloudapp-angular-lib';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AppConfig } from '../app.config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class UserRoleAreaService {
  private roleTypeDefinitionMappingObservable: Observable<
    Map<string, string>
  > | null = null;

  public constructor(
    private restService: CloudAppRestService,
    private destroyRef: DestroyRef
  ) {}

  public getRoleTypeDefinitionMapping(): Observable<Map<string, string>> {
    // return cached observable
    if (this.roleTypeDefinitionMappingObservable) {
      return this.roleTypeDefinitionMappingObservable;
    } else {
      // create new observable
      const request: Request = {
        url: '/conf/mapping-tables/RoleTypeDefinition',
        method: HttpMethod.GET,
        headers: AppConfig.httpHeader,
      };
      this.roleTypeDefinitionMappingObservable = this.restService
        .call(request)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          map((response) => {
            const mapping = new Map<string, string>();
            response.row.forEach(
              (row: { column0: string; column3: string }) => {
                mapping.set(row.column0, row.column3);
              }
            );
            return mapping;
          }),
          shareReplay(1) // cache the observable
        );
      return this.roleTypeDefinitionMappingObservable;
    }
  }
}
