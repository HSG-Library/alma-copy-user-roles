import { DestroyRef, Injectable } from '@angular/core';
import {
  CloudAppRestService,
  Entity,
  HttpMethod,
  Request,
} from '@exlibris/exl-cloudapp-angular-lib';
import { Observable } from 'rxjs';
import { UserListResponse } from '../types/userListResponse.type';
import { UserDetails } from '../types/userDetails.type';
import { AppConfig } from '../app.config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public constructor(
    private restService: CloudAppRestService,
    private destroyRef: DestroyRef
  ) {}

  public findUser(searchTerm: string): Observable<UserListResponse> {
    let request: Request = {
      url: '/users',
      method: HttpMethod.GET,
      headers: AppConfig.httpHeader,
      queryParams: {
        q: this.createPattern(searchTerm),
        order_by: 'last_name,first_name,primary_id',
        limit: AppConfig.pageSize,
      },
    };
    return this.restService
      .call(request)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  public getUserDetails(primaryId: string): Observable<UserDetails> {
    let request: Request = {
      url: '/users/' + primaryId,
      method: HttpMethod.GET,
      headers: AppConfig.httpHeader,
      queryParams: {
        user_id_type: 'all_unique',
        view: 'full',
        expand: 'none',
      },
    };
    return this.restService
      .call(request)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  public getUserDetailsFromEntity(userEntity: Entity): Observable<UserDetails> {
    let request: Request = {
      url: userEntity.link,
      method: HttpMethod.GET,
      headers: AppConfig.httpHeader,
      queryParams: {
        user_id_type: 'all_unique',
        view: 'full',
        expand: 'none',
      },
    };
    return this.restService
      .call(request)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  public updateUser(userData: UserDetails): Observable<UserDetails> {
    let request: Request = {
      url: '/users/' + userData.primary_id,
      method: HttpMethod.PUT,
      headers: AppConfig.httpHeader,
      requestBody: userData,
    };
    return this.restService
      .call(request)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  private createPattern(searchTerm: string): string {
    let cleanSearchTerm = searchTerm.trim().replace(' ', '_');
    return `ALL~*${cleanSearchTerm}*`;
  }
}
