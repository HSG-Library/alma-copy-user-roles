import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { AlertService, CloudAppEventsService, Entity, EntityType } from '@exlibris/exl-cloudapp-angular-lib'
import { TranslateService } from '@ngx-translate/core'
import { Observable } from 'rxjs'
import { AppConfig } from '../../app.config'
import { ValidationInfo } from '../../models/validationInfo'
import { UserService } from '../../services/user.service'
import { UserRolesService } from '../../services/userRoles.service'
import { UserSummaryEnriched } from '../../types/userSummaryEnriched.type'
import { ValidationDialog } from '../validationDialog/validationDialog.component'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  loading: boolean = false
  loadUsers: boolean = false
  currentUserEntity: Entity
  replaceExistingRoles: boolean = false
  resultEntites: UserSummaryEnriched[]
  resultCount: number = -1
  pageSize: number = AppConfig.pageSize
  sourceUserOptions: UserSummaryEnriched[]
  sourceUser: UserSummaryEnriched
  searchTerm: string

  entities$: Observable<Entity[]> = this.eventsService.entities$

  constructor(
    private dialog: MatDialog,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
    private translate: TranslateService,
    private userService: UserService,
    private userRoleService: UserRolesService,
  ) { }

  ngOnInit() {
    this.entities$.subscribe(entities => this.selectUserFromCurrentPage(entities))
  }

  ngOnDestroy(): void { }

  selectUserFromCurrentPage(entities: Entity[]): void {
    if (entities.length == 1) {
      let singleEntity = entities[0]
      if (singleEntity.type === EntityType.USER) {
        this.currentUserEntity = singleEntity
        return
      }
    }
    this.currentUserEntity = null
  }

  findUser() {
    if (this.searchTerm && this.searchTerm.length >= 2) {
      this.loadUsers = true

      this.userService.findUser(this.searchTerm.trim()).subscribe(
        (userResponse) => {
          this.resultCount = userResponse.total_record_count
          this.resultEntites = userResponse.user
          this.loadUsers = false
          if (userResponse.total_record_count <= 0) {
            return
          }
          userResponse.user.forEach(user => {
            this.userService.getUserDetails(user.primary_id).subscribe(
              (userDetails) =>
                this.resultEntites = this.resultEntites
                  .map(u => {
                    if (u.primary_id === userDetails.primary_id) {
                      u.user_group = userDetails.user_group
                      u.user_role = userDetails.user_role
                    }
                    return u
                  }),
              (error) => {
                let alertMsg = this.translate.instant('main.error.userDetailAlert', {
                  primaryId: user.primary_id,
                  status: error.status
                })
                this.alert.error(alertMsg, { autoClose: true })
                console.error('Error in findUser()', error)
                this.loadUsers = false
              })
          })
        },
        (error) => {
          let alertMsg = this.translate.instant('main.error.findUserAlert', {
            status: error.status
          })
          this.alert.error(alertMsg, { autoClose: true })
          console.error('Error in findUser()', error)
          this.loadUsers = false
        })
    }
  }

  selectSourceUser(event: UserSummaryEnriched[]) {
    let user: UserSummaryEnriched = event[0]
    this.loading = true
    this.userRoleService.validate(user)
      .subscribe((validationInfo: ValidationInfo) => {
        user.rolesChecked = true
        if (validationInfo.valid) {
          this.sourceUser = user
          user.rolesValid = true
        } else {
          this.sourceUser = null
          this.dialog.open(ValidationDialog, { autoFocus: false, data: validationInfo });
          user.rolesValid = false
        }
      },
        (error) => {
          let alertMsg = this.translate.instant('main.error.validationAlert', {
            status: error.status
          })
          this.alert.error(alertMsg, { autoClose: true })
          console.error('Error while validating in selectSourceUser()', error)
        },
        () => {
          this.loading = false
        }
      )
  }

  copyUserRoles() {
    this.userService.getUserDetailsFromEntity(this.currentUserEntity)
      .subscribe(userDetails => {
        this.userRoleService.copy(this.sourceUser, userDetails, this.replaceExistingRoles)
          .subscribe(
            () => {
              this.eventsService.refreshPage().subscribe(
                () => this.alert.success(this.translate.instant('main.successAlert'))
              )
            },
            (error) => {
              let alertMsg = this.translate.instant('main.error.copyUserRolesAlert', {
                status: error.status
              })
              this.alert.error(alertMsg, { autoClose: true })
              console.error('Error in copyUserRoles()', error)
            }
          )
      })
  }

  reset() {
    this.sourceUser = null
    this.resultEntites = null
    this.resultCount = -1
    this.searchTerm = ''
  }
}
