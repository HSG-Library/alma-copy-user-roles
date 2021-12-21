import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ValidationInfo } from "../../models/validationInfo";

@Component({
	templateUrl: './validationDialog.component.html',
	styleUrls: ['./validationDialog.component.scss'],
})
export class ValidationDialog {
	constructor(@Inject(MAT_DIALOG_DATA) public data: ValidationInfo) { }
}