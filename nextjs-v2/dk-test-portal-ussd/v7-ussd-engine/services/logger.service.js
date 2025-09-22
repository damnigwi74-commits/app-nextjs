"use strict"

const moment = require('moment');
const path 	 = require('path');
const env    = require( path.resolve('./env') )
const winston = require('winston');
require('winston-daily-rotate-file');

module.exports = {
	name        : "core-logging",

	settings    : {},

	events      : {
		"create.log"(payload){
			//log...
			payload.timestamp = moment().format('DD-MM-YYYY HH:mm:ss')
			let filenameExt = `${payload.service}-${payload.type}`
			let pathLog = env['LOGS_PATH']
			if(!pathLog.endsWith('/')){
				pathLog = `${pathLog}/`
			}
			
			const transport = new (winston.transports.DailyRotateFile)({
				filename: filenameExt,
				datePattern: 'YYYY-MM-DD',
				extension: '.log',
				zippedArchive: false,
				maxSize: '5m',
				dirname: `${pathLog}${moment().format('YYYY-MM-DD')}`,
				maxFiles: env['MAX_LOG_DAYS'],
				auditFile: `${pathLog}${moment().format('YYYY-MM-DD')}/${payload.type}-audit.json`
			  });
			 
			  const logger = winston.createLogger({
				transports: [
				  transport
				]
			  });
			 
			  logger.info(payload);
		}
	}
}