import { Component, Input } from '@angular/core';
import { CopyResult } from '../../types/copyResult.type';
import { CompareResult } from '../../types/compareResult.type';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent {
  private _copyResult: CopyResult | null = null;
  private _compareResult: CompareResult | null = null;

  @Input()
  set copyResult(value: CopyResult | null) {
    this._copyResult = value;
  }

  get copyResult(): CopyResult | null {
    return this._copyResult;
  }

  @Input()
  set compareResult(value: CompareResult | null) {
    this._compareResult = value;
  }

  get compareResult(): CompareResult | null {
    return this._compareResult;
  }

  resultsExpanded: boolean = false;
}
