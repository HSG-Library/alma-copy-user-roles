import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { AlertService, CloudAppEventsService, Entity, EntityType } from '@exlibris/exl-cloudapp-angular-lib'
import { TranslateService } from '@ngx-translate/core'
import { Observable, Subject } from 'rxjs'
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
  currentUserEntity: Entity
  replaceExistingRoles: boolean = false
  sourceUserOptions: UserSummaryEnriched[]
  sourceUser: UserSummaryEnriched

  resetEventSubject = new Subject<void>()

  entities$: Observable<Entity[]> = this.eventsService.entities$

  constructor(
    private dialog: MatDialog,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
    private translate: TranslateService,
    private userService: UserService,
    private userRoleService: UserRolesService,
  ) { }

  ngOnInit(): void {
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

  selectSourceUser(user: UserSummaryEnriched): void {
    this.loading = true
    this.userRoleService.validate(user)
      .subscribe((validationInfo: ValidationInfo) => {
        user.rolesChecked = true
        if (validationInfo.valid) {
          this.sourceUser = user
          user.rolesValid = true
        } else {
          this.sourceUser = null
          this.dialog.open(ValidationDialog, { autoFocus: false, data: validationInfo })
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

  copyUserRoles(): void {
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

  reset(): void {
    this.sourceUser = null
    this.resetEventSubject.next()
  }
}
