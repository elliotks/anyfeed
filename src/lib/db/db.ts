import os from 'os'
import { Sequelize, DataTypes } from 'sequelize'

let sequelize: Sequelize | undefined

export const db = (() => {
	// can't use $app/environment here because the CLI import this and won't be able to resolve it
	if (!sequelize && !process.env.BUILDING) {
		const homeDir = os.homedir()

		sequelize = new Sequelize({
			dialect: 'sqlite',
			storage: process.env.TEST
				? ':memory:'
				: process.env.DB_PATH ?? `${homeDir}/.nfd_data/data.sqlite`,
			logging: process.env.NODE_ENV === 'dev' ? console.log : false
		})

		const user = sequelize.define('user', {
			userName: {
				type: DataTypes.STRING,
				allowNull: true
			},
			swipeUI: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
				defaultValue: false
			},
			maxLastFeedPerSource: {
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 50
			},
			maxTotalFeedPerSource: {
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 500
			},
			maxJobHistory: {
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 1000
			},
			navOrder: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			showSourcesStarter: {
				type: DataTypes.BOOLEAN,
				defaultValue: true
			}
		})

		const source = sequelize.define('source', {
			name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			url: {
				type: DataTypes.STRING,
				allowNull: false
			},
			xpath: {
				type: DataTypes.STRING,
				allowNull: true
			},
			rss: {
				type: DataTypes.STRING,
				allowNull: true
			},
			avatar: {
				type: DataTypes.STRING,
				allowNull: false
			},
			cron: {
				type: DataTypes.STRING,
				allowNull: true
			},
			maxLastFeed: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			maxTotalFeed: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			displayOnHome: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true
			}
		})

		user.hasMany(source)
		source.belongsTo(user)

		const feed = sequelize.define('feed', {
			url: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true
			},
			title: {
				type: DataTypes.STRING,
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			image: {
				type: DataTypes.STRING,
				allowNull: true
			},
			bookmark: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false
			}
		})

		source.hasMany(feed)
		feed.belongsTo(source)

		const jobHistory = sequelize.define('jobHistory', {
			status: {
				type: DataTypes.STRING,
				allowNull: false
			}
		})

		source.hasMany(jobHistory)
		jobHistory.belongsTo(source)

		sequelize.sync()
	}

	return sequelize
})()
