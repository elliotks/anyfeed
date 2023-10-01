import { defineConfig } from 'unocss'
import extractorSvelte from '@unocss/extractor-svelte'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import presetAttributify from '@unocss/preset-attributify'
import presetRemToPx from '@unocss/preset-rem-to-px'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
	extractors: [extractorSvelte()],
	presets: [
		presetRemToPx(),
		presetUno(),
		presetIcons({
			extraProperties: {
				display: 'inline-block',
				'vertical-align': 'middle'
			}
		}),
		presetAttributify()
	],
	transformers: [transformerDirectives()],
	theme: {
		breakpoints: {
			sm: '640px',
			md: '768px',
			lg: '1024px'
		}
	}
})
