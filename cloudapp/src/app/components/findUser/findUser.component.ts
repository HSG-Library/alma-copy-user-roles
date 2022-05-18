import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core'
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib'
import { TranslateService } from '@ngx-translate/core'
import { Observable, Subscription } from 'rxjs'
import { AppConfig } from '../../app.config'
import { UserService } from '../../services/user.service'
import { UserListResponse } from '../../types/userResponse.type'
import { UserSummaryEnriched } from '../../types/userSummaryEnriched.type'


@Component({
	selector: 'app-find-user',
	templateUrl: './findUser.component.html',
})
export class FindUserComponent implements OnInit, OnDestroy {

	loading: boolean
	searchTerm: string
	resultEntites: UserSummaryEnriched[]
	resultCount: number = -1
	userOptions: UserSummaryEnriched[]
	pageSize: number = AppConfig.pageSize


	@Input()
	resetEventObservable$: Observable<void>
	resetEventSubscription: Subscription

	@Output()
	selectedUserOutput = new EventEmitter<UserSummaryEnriched>()

	constructor(
		private userService: UserService,
		private translate: TranslateService,
		private alert: AlertService,
	) { }

	ngOnInit(): void {
		this.resetEventSubscription = this.resetEventObservable$.subscribe(() => this.reset())
	}

	ngOnDestroy(): void {
		this.resetEventSubscription.unsubscribe()
	}

	findUser(): void {
		if (this.searchTerm && this.searchTerm.length >= 2) {
			this.loading = true

			this.userService.findUser(this.searchTerm.trim()).subscribe(
				(userResponse) => {
					this.resultCount = userResponse.total_record_count
					this.resultEntites = userResponse.user
					this.loading = false
					if (userResponse.total_record_count <= 0) {
						return
					}
					this.enrichResult(userResponse)
				},
				(error) => {
					let alertMsg = this.translate.instant('findUser.error.findUserAlert', {
						status: error.status
					})
					this.alert.error(alertMsg, { autoClose: true })
					console.error('Error in findUser()', error)
					this.loading = false
				})
		}
	}

	selectSourceUser(event: UserSummaryEnriched[]) {
		let user: UserSummaryEnriched = event[0]
		this.selectedUserOutput.emit(user)
	}

	private enrichResult(userResponse: UserListResponse) {
		userResponse.user.forEach(user => {
			this.userService.getUserDetails(user.primary_id).subscribe(
				(userDetails) => this.resultEntites = this.resultEntites
					.map(u => {
						if (u.primary_id === userDetails.primary_id) {
							u.user_group = userDetails.user_group
							u.user_role = userDetails.user_role
						}
						return u
					}),
				(error) => {
					let alertMsg = this.translate.instant('findUser.error.userDetailAlert', {
						primaryId: user.primary_id,
						status: error.status
					})
					this.alert.error(alertMsg, { autoClose: true })
					console.error('Error in findUser()', error)
					this.loading = false
				})
		})
	}

	private reset() {
		this.searchTerm = ""
		this.resultCount = -1
		this.resultEntites = null
	}
}
