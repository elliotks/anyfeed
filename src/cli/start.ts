import ip from 'ip'
import { exec } from 'child_process'
import type { OptionValues } from 'commander'
import { chromium } from 'playwright-core'
import pm2 from 'pm2'
import * as fs from 'fs/promises'
import { db } from '../lib/db/db'

export const workingDir = process.cwd()

export default async function startAnyfeed(options: OptionValues) {
	const host = options.host || '0.0.0.0'
	const port = options.port || 1337
	const socketPath = options.socketPath
	const dbPath = options.dbPath

	const startLog = () => {
		// get local ip address from ip package
		const localhost = ip.address()
		const url = `http://${options.host || localhost}:${port}`
		console.log(
			`Anyfeed started` +
				(options.detach ? ' in detached mode' : '') +
				(socketPath ? ` on ${socketPath}` : ` at ${url}`)
		)
		if (options.detach) console.log('To stop the instance, run "nfd stop"')
		else console.log('You can use -d flag to run in detached mode or -h to see all options')
		return url
	}

	try {
		await fs.access(await chromium.executablePath())
	} catch (error) {
		console.log('Please run "npx playwright install chromium"')
		return
	}

	if (options.detach) {
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
					anyfeedProcess &&
					!['stopping', 'stopped', 'errored'].includes(anyfeedProcess?.pm2_env?.status || '')
				) {
					console.log('Anyfeed is already running')
					pm2.disconnect()
					return
				}

				const pm2Command =
					`npx pm2 start ${__dirname}/../../dist/cli/index.js --name anyfeed -- -H ${host} -p ${port}` +
					(socketPath ? ` -so ${socketPath}` : '') +
					(dbPath ? ` -dbp ${dbPath}` : '')

				exec(pm2Command, (error) => {
					if (error) {
						console.error(`${error}`)
						pm2.disconnect()
						return
					}

					startLog()
					pm2.disconnect()
				})
			})
		})

		return
	}

	exec(
		(socketPath ? `SOCKET_PATH=${socketPath}` : `HOST=${host} PORT=${port}`) +
			` ${dbPath ? 'DB_PATH=' + dbPath : ''} node ${__dirname}/../../build`,
		(err) => {
			if (err) {
				console.error(err)
				return
			}
		}
	).stdout?.on('data', (data) => {
		if (data.includes('Listening on')) {
			const url = startLog()

			if (!socketPath && db) {
				setTimeout(() => {
					fetch(url + '/api/cron', {
						method: 'POST'
					}).catch((e) => {
						console.log(e)
					})
				}, 1000)
			}

			if (options.autoOpen) {
				const open =
					process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open'
				exec(`${open} ${url}`)
			}
		}
	})
}
