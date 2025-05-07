import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValidationInfo } from '../../models/validationInfo';

@Component({
  templateUrl: './validationDialog.component.html',
})
export class ValidationDialog {
  public constructor(
    @Inject(MAT_DIALOG_DATA) public data: ValidationInfo,
    private dialogRef: MatDialogRef<ValidationDialog>
  ) {}

  public proceed() {
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close();
  }
}
