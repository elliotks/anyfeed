import { isCurrentIdA, setCurrentIdA } from './idA'

export function match(_value: string) {
	if (!isCurrentIdA()) {
		setCurrentIdA(true)
		return true
	}

	return false
}
