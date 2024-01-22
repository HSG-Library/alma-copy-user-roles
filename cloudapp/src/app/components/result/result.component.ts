import { Component, Input } from '@angular/core'
import { CopyResult } from '../../types/copyResult.type'
import { CompareResult } from '../../types/compareResult.type'

@Component({
	selector: 'app-result',
	templateUrl: './result.component.html',
	styleUrls: ['./result.component.scss'],
})
export class ResultComponent {
	private _copyResult: CopyResult
	private _compareResult: CompareResult

	@Input()
	set copyResult(value: CopyResult) {
		this._copyResult = value
	}

	get copyResult(): CopyResult {
		return this._copyResult
	}

	@Input()
	set compareResult(value: CompareResult) {
		this._compareResult = value
	}

	get compareResult(): CompareResult {
		return this._compareResult
	}

	resultsExpanded: boolean = false

}
