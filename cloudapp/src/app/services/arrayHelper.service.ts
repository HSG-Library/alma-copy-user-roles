import { Injectable } from '@angular/core'

@Injectable({
	providedIn: 'root'
})
export class ArrayHelperService {

	constructor() { }

	bisect<Type>(array: Type[]): [Type[], Type[]] {
		if (array.length == 1) {
			return [array, []]
		}
		let leftHalfCount = Math.floor(array.length / 2)
		let leftHalf = array.slice(0, leftHalfCount)
		let rightHalf = array.slice(leftHalfCount, array.length)
		return [leftHalf, rightHalf]
	}

	intersection<Type>(array1: Type[], array2: Type[]): Type[] {
		let merged = new Map<string, IntersectHelper>()
		let result: Type[] = []
		array1.forEach((el) => {
			let key = this.generateStrKey(el)
			if (!merged.has(key)) {
				merged.set(key, { element: el, intersect: false })
			}
		})
		array2.forEach((el) => {
			let key = this.generateStrKey(el)
			if (merged.has(key)) {
				merged.set(key, { element: el, intersect: true })
			}
		})
		merged.forEach((item) => {
			if (item.intersect) {
				result.push(item.element)
			}
		})
		return result
	}

	removeItems<Type>(array: Type[], remove: Type[]): Type[] {
		let items = new Map<string, Type>()
		let result: Type[] = []
		array.forEach(item => {
			let key = this.generateStrKey(item)
			items.set(key, item)
		})
		remove.forEach(item => {
			let key = this.generateStrKey(item)
			if (items.has(key)) {
				items.delete(key)
			}
		})
		items.forEach(item => {
			result.push(item)
		})
		return result
	}

	findDuplicates<Type>(array: Type[]): Type[] {
		let items = new Map<string, Type>()
		let result: Type[] = []
		array.forEach(item => {
			let key = this.generateStrKey(item)
			if (items.has(key)) {
				result.push(item)
			}
			items.set(key, item)
		})
		return result
	}

	// Returns a unique reference string for the type and value of the element
	private generateStrKey<Type>(elem: Type): string {
		let typeOfElem = typeof elem
		if (typeOfElem === 'object') {
			typeOfElem += Object.prototype.toString.call(elem)
		}
		let key = [typeOfElem, elem.toString(), JSON.stringify(elem)].join('__')
		return key
	}

}

type IntersectHelper = {
	element: any,
	intersect: boolean
}
