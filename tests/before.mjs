import fs from 'fs-extra'
import path from 'path'

const fileName = new URL(import.meta.url).pathname
const dirName = path.dirname(fileName)

const seedPath = path.resolve(dirName, 'seed')
const tempPath = path.resolve(dirName, '../static/test')

fs.copySync(seedPath, tempPath)
