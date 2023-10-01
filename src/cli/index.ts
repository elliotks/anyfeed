#! /usr/bin/env node

import { Command } from 'commander'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getUser } from '../lib/db'
import startAnyfeed from './start'
import stopAnyfeed from './stop'
import restartAnyfeed from './restart'

const pg = require('../../package.json')

const program = new Command()

program
	.version(pg.version)
	.description('A self-hosted web app that enables you to follow articles from any website')

program
	.command('start', { isDefault: true })
	.description('start an instance')
	.option('-H, --host <host>', 'default on 0.0.0.0')
	.option('-p, --port <port>', 'port number')
	.option(
		'-so, --socket-path <path>',
		'accept connections on a specified socket path, host & port will be ignored'
	)
	.option('-dbp, --db-path <path>', 'SQLite database path')
	.option('-ao, --auto-open', 'auto open in the browser')
	.option('-d, --detach', 'run in the background')
	.action((options) => {
		startAnyfeed(options)
	})

program
	.command('stop')
	.description('stop an instance running in the background')
	.action(() => {
		stopAnyfeed()
	})

program
	.command('restart')
	.description('restart an instance running in the background')
	.action(() => {
		restartAnyfeed()
	})

program.parse(process.argv)

module.exports = {}
