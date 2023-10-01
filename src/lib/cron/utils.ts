import parser from 'cron-parser'

export type Frequency = 'once' | 'twice' | 'six' | 'custom' | 'manual'

interface CronState {
	frequency: Frequency | null
	frequencyAt?: number
	frequencyAnd?: number
	customFrequency?: string
}

export function decodeCronExpression(cron: string): CronState {
	const state: CronState = {
		frequency: null
	}

	const onceOrTwicePattern = /^0 (\d+)(?:,(\d+))? \* \* \*$/
	const sixPattern = /^0 (\d+)\/6 \* \* \*$/

	if (onceOrTwicePattern.test(cron)) {
		const matches = cron.match(onceOrTwicePattern)
		if (matches) {
			state.frequencyAt = Number(matches[1])
			if (matches[2]) {
				state.frequency = 'twice'
				state.frequencyAnd = Number(matches[2])
			} else {
				state.frequency = 'once'
			}
		}
	} else if (sixPattern.test(cron)) {
		const matches = cron.match(sixPattern)
		if (matches) {
			state.frequency = 'six'
			state.frequencyAt = Number(matches[1])
		}
	} else {
		state.frequency = 'custom'
		state.customFrequency = cron
	}

	return state
}

export function cronExpression(state: CronState) {
	if (state.frequency === 'once') return `0 ${state.frequencyAt} * * *`
	if (state.frequency === 'twice') return `0 ${state.frequencyAt},${state.frequencyAnd} * * *`
	if (state.frequency === 'six') return `0 ${state.frequencyAt}/6 * * *`
	if (state.frequency === 'custom') return state.customFrequency
	return null
}

export function frequencyValidation(state: CronState) {
	try {
		let expression = ''

		if (state.frequency === 'custom') {
			if (!state.customFrequency || !state.customFrequency.trim())
				throw new Error('Custom frequency is empty')
			if (state.customFrequency.trim().split(' ').length !== 5)
				throw new Error('Invalid cron expression')
			expression = state.customFrequency
		}

		parser.parseExpression(expression)

		return ''
	} catch (e) {
		return `Invalid cron expression, you can use <a href="https://crontab.guru" target="_blank" class="underline">https://crontab.guru</a> to help you`
	}
}
