import { Component, Inject } from "@angular/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { ValidationInfo } from "../../models/validationInfo"

@Component({
	templateUrl: './validationDialog.component.html'
})
export class ValidationDialog {

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: ValidationInfo,
		private dialogRef: MatDialogRef<ValidationDialog>,
	) { }


	proceed() {
		this.dialogRef.close(true)
	}

	close() {
		this.dialogRef.close()
	}
}
