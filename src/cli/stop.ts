import pm2 from 'pm2'

export default async function stopAnyfeed() {
	pm2.connect((error) => {
		if (error) {
			console.error(`${error}`)
			return
		}

		pm2.list((error, list) => {
			if (error) {
				console.error(`${error}`)
				pm2.disconnect()
				return
			}

			const anyfeedProcess = list.find((process) => process.name === 'anyfeed')

			if (
				!anyfeedProcess ||
				['stopping', 'stopped', 'errored'].includes(anyfeedProcess?.pm2_env?.status || '')
			) {
				console.log('No instance of Anyfeed is running')
				pm2.disconnect()
				return
			}

			pm2.stop('anyfeed', (error) => {
				if (error) {
					console.error(`${error}`)
					pm2.disconnect()
					return
				}

				console.log('Anyfeed instance stopped')
				pm2.disconnect()
			})
		})
	})
}
