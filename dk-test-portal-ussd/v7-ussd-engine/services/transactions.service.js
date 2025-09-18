"use strict"

const path = require('path');
const fs = require('fs');
const moment = require('moment');
const dot = require("dot-object")
const flatten = require('flat')
const env = require(path.resolve('./env'))
const UtilitiesMixin = require('../mixins/utilities.mixin')
const statusMessages = env.statusMessages

module.exports = {
	name: "transactions",

	settings: {
		log: true,
		apiTimeout: env.api.timeout,
		requestSettings: {},
		appMeta: {},
		appPermissions: {},
		dataSources: {},
		statusMessages: statusMessages
	},

	mixins: [UtilitiesMixin],

	actions: {
		request: {
			async handler(ctx) {
				let { api, apiRoute, payload, code, appConfig = {} } = ctx.params

				//set API configs
				this.settings.requestSettings = api['request-settings']
				this.settings.appMeta = api['meta-data']
				this.settings.appPermissions = api['permissions']
				this.settings.dataSources = api['data-sources']
				this.settings.code = code

				let logData = {
					type: 'info',
					action: apiRoute,
					txnType: apiRoute,
					service: ctx.service.fullName,
					sent: '',
					requestParams: payload['walletAccount'],
					userId: payload['walletAccount'],
					userDevice: ctx.meta.userDevice,
					clientIp: ctx.meta.clientIp,
					sessionId: ctx.meta.sessionId
				}
				//remove PIN from log data
				//delete logData.requestParams.pin

				let response = {
					status: 'failed',
					data: {},
					message: {}
				}

				if (env.environment === 'development') {
					this.logger.info(JSON.stringify({ apiRoute, user: payload?.walletAccount }, null, 4))
				}

				try {
					let reqEnpoint = api['request-settings'].endpoints[apiRoute];

					let reqResponse = await this.sendRequest(reqEnpoint, payload)

					// if(env.environment === 'development'){
					// 	this.logger.info(JSON.stringify({reqEnpoint, reqResponse}, null, 4))
					// }
					//Build Reponse
					response.status = reqResponse.message
					response.success = reqResponse.success
					response.message = statusMessages[reqResponse.message]
					response.data = this.applyPosthooks(reqResponse.data, payload)
					response.error = reqResponse.errorMessage || statusMessages[reqResponse.message]

					logData.txnType = reqEnpoint?.request?.field100 || apiRoute
					logData['esb-request'] = {
						...reqResponse,
						message: statusMessages[reqResponse.message],
						error: reqResponse.errorMessage,
						esbDuration: reqResponse.requestTime
					}

					//log types
					if (!response.success) {
						logData.type = 'debug'
					}
					if (reqResponse.requestNotRec) {
						logData.type = 'error'
					}
					if (logData['esb-request'] && logData['esb-request']['request']) {
						logData['esb-request']['request']['headers']['Authorization'] = 'Auth token'
					}
					//remove sesitive data from logs
					if (['login', 'db-login-authentication', 'login-authentication'].includes(apiRoute) && logData.type === 'info') {
						logData['esb-request']['data'] = {}
						logData['esb-request']['eSBData'] = {}
						logData['esb-request']['request']['data'] = {}
					}
				} catch (error) {
					response.status = 500
					response.error = error.message && this.logger.info(error)
					response.message = statusMessages[500]

					logData.error = error;
					logData.type = 'error'
				}
				//Logs
				//logData.clientResponse = response;

				//log to folder using winston
				ctx.emit('create.log', logData);
				//Analytics goes here
				ctx.call('analytics.transactions', { payload: logData, apiRoute, runAnalytics: appConfig['enable-analytics'] });

				if (env.environment === 'development') {
					this.logger.info(JSON.stringify({ response, txnTime: logData?.['esb-request']?.esbDuration }, null, 4));
				}

				return response
			}
		}
	},

	methods: {
		runReplacements(template, payload) {

			try {
				let flatten = require('flat')
				let unflatten = flatten.unflatten
				let replacements = []
				let failed = []
				let params = flatten(payload)

				let querySettings = JSON.stringify(template)
				let paramKeys = Object.keys(params);
				let payloadKeys = Object.keys(payload);
				let queryValues = Object.values(flatten(template))

				for (let entry of queryValues) {
					entry = entry.toString()
					if (entry.startsWith('__')) {
						let entries = entry.split('__').filter(e => e && e)

						entries.forEach(e => {
							replacements.push(`__${e}`)
						})
					}
				}

				//for failed replace with empty values no errors
				for (let replacement of replacements) {
					let placement = replacement.replace(/__/g, '')

					if (replacement.includes(';')) {
						placement = placement.split(':')[0]
					}

					if (![...paramKeys, ...payloadKeys].includes(placement)) {
						failed.push(replacement)
						replacements = replacements.filter(item => item !== replacement)
					}
				}

				for (let replacement of replacements) {

					let regEx = ''
					if (replacement.includes(';')) {
						replacement = replacement.split(':')[0]
					}
					let placement = replacement.replace(/__/g, '')
					let value = params[placement] || payload[placement]
					regEx = new RegExp(replacement, 'g')

					if (typeof value === 'string' && value?.startsWith('__')) {
						//get param from params
						value = params[`${value.replace(/__/g, '')}`] || payload[`${value.replace(/__/g, '')}`]
					}

					if (typeof value === 'object') {
						value = JSON.stringify(value)
						regEx = new RegExp(`"${replacement}"`, 'g')

						querySettings = querySettings.replace(regEx, value)
					} else {
						querySettings = querySettings.replace(regEx, value)
					}
				}

				//full replacements - with empty string if validation fails
				for (let failure of failed) {
					let regEx = ''
					regEx = new RegExp(failure, 'g')
					querySettings = querySettings.replace(regEx, '')
					//querySettings = querySettings.replace(/undefined/g, '')
				}

				querySettings = querySettings.replace(/\n/g, '\\n')
				querySettings = JSON.parse(querySettings)

				let keys = Object.keys(flatten(querySettings))

				//create defaults - create?;case?=args
				//handle format values - value;case
				for (let key of keys) {
					let queParams = flatten(querySettings)
					let relValue = queParams[key], value = queParams[key], newValue = ''
					value = value.toString()

					if (value.startsWith('construct') && value.includes(';')) {
						let methodName = value.split(';')[1]
						newValue = this[methodName](payload)
					} else if (value.includes('construct') && value.includes(';')) {

						let methodName = value.split(';')[1]
						let args = value.split(':')[0]

						if (args.startsWith('%@')) {
							args = args.replace('%@', '')
							args = querySettings[args]
						}

						newValue = this[methodName](payload, args)
					} else { }

					if (value.startsWith('create') && value.includes(';')) {
						let parts = value.split(';')[1]
						let methodName = parts.split('=')[0]
						let args = parts.split('=')[1]

						if (args) {
							newValue = this[methodName](args)
						} else {
							newValue = this[methodName]()
						}

					} else if (value.includes('create') && value.includes(';')) {

						let methodName = value.split(';')[1]
						let args = value.split(':')[0]

						if (args.startsWith('%@')) {
							args = args.replace('%@', '')
							args = querySettings[args]
						}

						newValue = this[methodName](args)
					} else { }

					if (typeof newValue === 'object') {
						querySettings = { ...querySettings, ...newValue }

						if (value.startsWith('%@')) {
							let methodName = value.split(';')[1]
							querySettings[key] = newValue[methodName]
						}
						let objKeys = Object.keys(newValue)
						for (let key of objKeys) {
							newValue = querySettings[key]
						}
					}
					querySettings[key] = newValue || relValue

				}

				//handle placeholders - %@placeholder -- if not in requests put blank
				for (let key of keys) {
					let value = querySettings[key]
					value = value.toString()
					if (value.startsWith('%@') && keys.includes(value.replace('%@', ''))) {
						let placeholder = querySettings[key].replace('%@', '')
						querySettings[key] = querySettings[placeholder]
					} else if (value.startsWith('%@') && !keys.includes(value.replace('%@', ''))) {
						querySettings[key] = ''
					} else { }
				}

				let dataKeys = Object.keys(flatten(querySettings))
				let requestString = JSON.stringify(querySettings)

				// handle inline %@ & @
				for (let key of dataKeys) {

					let value = querySettings[key]
					value = value.toString()
					if (value.includes('@')) {
						let parts = value.split(' ')
						for (let itemParts of parts) {
							if (itemParts.startsWith('%@')) {
								let placeholder = itemParts.replace('%@', '')

								let regEx = ''
								regEx = new RegExp(itemParts, 'g')
								requestString = requestString.replace(regEx, querySettings[placeholder])
							}
							if (itemParts.startsWith('@')) {
								let placeholder = itemParts.replace('@', '')
								placeholder = placeholder.replace(/,/g, '')
								placeholder = placeholder.split('.')[0]

								let regEx = ''
								regEx = new RegExp(itemParts, 'g')
								requestString = requestString.replace(regEx, params[placeholder])
								requestString = requestString.replace(/undefined/g, '')
							}
						}

					}
				}

				requestString = requestString.replace(/\n/g, '\\n')
				requestString = JSON.parse(requestString)
				querySettings = requestString

				//handle get;metaData - doesn't exist put blank
				for (let key of keys) {
					let value = querySettings[key]
					value = value.toString()
					let metaKeys = Object.keys(this.settings.appMeta)
					if (value.startsWith('get;') && metaKeys.includes(value.replace('get;', ''))) {
						let placeholder = querySettings[key].replace('get;', '')
						querySettings[key] = this.settings.appMeta[placeholder]
					} else if (value.startsWith('get;') && !metaKeys.includes(value.replace('get;', ''))) {
						querySettings[key] = ''
					} else { }
				}

				//handle config;mpesa.clientid - doesn't exist put blank

				for (let key of keys) {
					let value = querySettings[key]
					value = value.toString()
					let configData = flatten(env)
					let configKeys = Object.keys(configData)

					if (value.startsWith('config;') && configKeys.includes(value.replace('config;', ''))) {
						let placeholder = querySettings[key].replace('config;', '')
						querySettings[key] = configData[placeholder]
					} else if (value.startsWith('config;') && !configKeys.includes(value.replace('config;', ''))) {
						querySettings[key] = ''
					} else { }
				}

				querySettings = unflatten(querySettings)

				return querySettings

			} catch (error) {
				this.logger.info(error)
				return {
					success: false,
					reqError: `Partial replacements falied ${error.message}`
				}
			}

		},
		async generateRequest(request, payload, params) {

			try {
				let data = payload;
				let appPerm = this.settings.appPermissions
				let reqPermissions = request.ignorePermissions
				let base_url = this.settings.dataSources.base_url
				let url = this.settings.dataSources.default
				//let method 			= this.settings.dataSources.method || 'post'
				let headers = this.settings.requestSettings.headers.default
				let payloadFormat = this.settings.appMeta['payload-format']

				//run permissions on data(base64/encryption) - if encryption true run encryption first

				if (request['override-payload-format']) {
					payloadFormat = request['override-payload-format']
				}

				//Payload format
				if (payloadFormat !== 'JSON') {
					data = this[payloadFormat](data)
				}

				if (appPerm.encrypt && !reqPermissions) {
					data = this.aesEncrypt(JSON.stringify(data))
				}

				if (appPerm.base64 && !reqPermissions) {
					data = this.base64(data)
				}

				//handle overrides - on permissions - if request says false ignore all perm
				if (request['override-source']) {
					//url = this.settings.dataSources[request['override-source']]
					url = `${base_url}/${this.settings.dataSources[request['override-source']]}`
				}

				if (this.settings.dataSources[request['override-source']] == 'default') {
					url = this.settings.dataSources.default
				}
				//
				this.logger.info(`********nURL**********\nURL: ${url} \n********nURL**********`)
				//
				if (request['override-headers']) {
					headers = this.settings.requestSettings.headers[request['override-headers']]
				}

				//Split URL and Method
				let urlMethod = url.split(' ').filter(item => item && item)

				url = urlMethod[1]
				let callMethod = urlMethod[0].toLowerCase()

				//run - replacments for path-params
				//add replacement function for query params - try %@placeholder - path-params <url/>:<port/>/<param/><param/>
				// if(url.includes('%@') && request['path-params']){
				// 	let pathKeys = Object.keys(request['path-params'])
				// 	for(let key of pathKeys){
				// 		let value = request['path-params'][key]
				// 		let regEx = new RegExp(`%@${key}`, 'g')
				// 		url = url.replace(regEx, value)
				// 	}
				// }
				if (url.includes('%@') && request['path-params']) {
					let pathRep = url.split('%@').filter(e => e && e)
					pathRep.shift() //remove first element for ip && port
					for (let rep of pathRep) {
						rep = rep.split('&')[0]
						if (Object.keys(request['path-params']).includes(rep)) {
							let repvalue = request['path-params'][rep]
							let regEx = ''
							regEx = new RegExp(`%@${rep}`, 'g')
							url = url.replace(regEx, repvalue)
						}
					}
				}

				//Found the use case on both Swivel & IB
				//separate generate request - applyHeaders()
				//applyheaders(headers, data)
				//run token fetch for Auth header
				//returns headers
				headers = await this.applyHeaders(headers, payload, params)

				//create form data for formData request
				if (headers['content-type'] === 'multipart/form-data') {
					/*
					var FormData = require('form-data');
					var form_data = new FormData();

					if(payload.attachments && payload.attachments.length > 0){
						for (var i = 0; i < payload.attachments.length; i++) {
							form_data.append("file", fs.createReadStream(payload.attachments[i].path));
						}
					}
					delete data.attachments
					form_data.append(`message`, JSON.stringify(data))
					
					headers = { ...headers, ...form_data.getHeaders() }
					data = form_data
					*/

					let formdata = new FormData();
					Object.keys(data).forEach(key => formdata.append(key, data[key]));

					//Object.entries(data).forEach(([key, value]) => formdata.append(key, value));

					this.logger.info(`transactions.service formdata.entries ${[...formdata.entries()]}`)

					var username = headers.username;
					var password = headers.password;

					var authBasic = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

					let headersList = {
						"Accept": "*/*",
						'Authorization': `${authBasic}`,
						"content-type": "multipart/form-data"
					}

					//this.logger.info(`transactions.service data ${JSON.stringify(data, null, 4)}`)
					//this.logger.info(`transactions.service header_config ${JSON.stringify(headers, null, 4)}`)
					//this.logger.info(`transactions.service formdata ${JSON.stringify(formdata, null, 4)}`)

					headers = headersList
					data = formdata
				}

				return {
					success: true,
					method: callMethod,
					url,
					data,
					headers
				}
			} catch (error) {
				this.logger.info(error)
				return {
					success: false,
					reqError: `Generate request falied ${error.message}`
				}
			}

		},
		async applyHeaders(headers, payload, params) {
			try {

				//Auth header to always fetch token and add to headers - JWT template - can have option to run query fetch token
				//JWT template - specify url, headers, body, success field - will proceed even when fetch token fails - adds failed res data as token - run replacements on data with payload data - include option to run query 'fetch-token' with payload data,
				//fetch url, method, headers - authorization header(jwtToken - template) - fetch token before proceeding
				let authHeader = headers['Authorization']
				let setHeaders = { ...headers }

				if (authHeader && authHeader === 'fetch') {
					let authRequest = this.settings.requestSettings.endpoints.jwtToken
					let authData = authRequest.data
					let authUrl = this.settings.dataSources.jwtToken
					let autHHeaders = this.settings.requestSettings.headers[authRequest.useHeaders] || authRequest.headers
					let tokenField = authRequest.response.token.field
					let token = ''

					//Split URL get Method
					let urlMethod = authUrl.split(' ').filter(item => item && item)

					authUrl = urlMethod[1]
					let authMethod = urlMethod[0].toLowerCase()

					authData = this.runReplacements(authData, payload)

					let response = await this.httpFetch(
						authMethod,
						authUrl,
						authData,
						autHHeaders
					)

					if (response.success && tokenField === 'responseData') {
						token = response.data
					} else if (response.success && tokenField) {
						token = response.data[tokenField]
					} else {
						token = response.data
					}

					setHeaders['Authorization'] = `Bearer ${token}`

				}
				if (authHeader && authHeader === 'attach') {
					//get token from account details or request payload
					let accDetails = flatten({ ...params, ...payload })
					let accToken = accDetails['access_token'] || accDetails['token'] || ""

					setHeaders['Authorization'] = `Bearer ${accToken}`
				}
				// if(authHeader && authHeader === 'query'){
				// 	let authRequest = this.settings.requestSettings.endpoints.jwtToken
				// 	let authData = authRequest.data
				// 	authData = this.runReplacements(authData, payload)

				// 	let dbResults = await this.db.query('fetch-token', authData)
				// 	let token = ''
				// 	if(dbResults.success){
				// 		token = dbResults.data['Session_ID']
				// 	}

				// 	setHeaders['Authorization'] = `Bearer ${token}`
				// }

				return setHeaders
			} catch (error) {
				this.logger.info(error)
				return {
					success: false,
					reqError: `Apply headers falied ${error.message}`
				}
			}
		},
		applyPrehooks(request, params) {
			try {

				// let field102 = request.field102 || false
				// let field103 = request.field103 || false
				// let field100 = request.field100 || false
				// let field74  = request.field74 || false
				// let field3   = request.field3 || false

				// if(!field103 && field102 && field102.startsWith ( 'CA')){
				// 	request.field24 = 'MM'
				// }
				// if(!field103 && field102 && !field102.startsWith ( 'CA') && !field102.startsWith ( '237')&& !field102.startsWith ( '254')){
				// 	request.field24 = 'BB'
				// }
				// if ( field102 && field103 ) {

				// 	if ( field102.startsWith ( 'CA' )  && field103.startsWith ( 'CA')) {
				// 		request.field24 = 'MM'
				// 	}
				// 	if ( field102.startsWith ( 'CA' ) && !field103.startsWith ( 'CA')) {
				// 		request.field24 = 'MB'
				// 	}

				// 	if ( !field102.startsWith ( 'CA' )  && field103.startsWith ( 'CA')) {
				// 		request.field24 = 'BM'
				// 	}
				// 	if ( !field102.startsWith ( 'CA' )  && !field103.startsWith ( 'CA')) {
				// 		request.field24 = 'BB'
				// 	}
				// }

				// //token withdrawal
				// if ( field100 === 'WALLET_TOKEN_FT' && !field102.startsWith ( 'CA')) {
				// 	request.field103  = `CA${request.field2.slice(3)}`
				// 	request.field100  = 'CBS_TOKEN_FT';
				// 	request.field24   = "BM";
				// }
				// if(field74 === 'WALLET_TOKEN_FT' && !field102.startsWith ( 'CA')){
				// 	request.field24 = "BM";
				// 	request.field74  = 'CBS_TOKEN_FT';
				// }
				// if ( field100 === 'CASH_WITHDRAWAL' && !field102.startsWith ( 'CA')) {
				// 	request.field24 = 'BM'
				// 	request.field100 = 'CASH_WITHDRAWAL_CBS'
				// }
				// if(field74 === 'CASH_WITHDRAWAL' && !field102.startsWith ( 'CA')){
				// 	request.field24 = "BM";
				// 	request.field74  = 'CASH_WITHDRAWAL_CBS';
				// }

				// //Bill payments from wallet account
				// if( (field3 === '500000' || field3 === '250000') && field102.startsWith ( 'CA') ){
				// 	request.field24 = "MB";
				// }

				// //buy float
				// if( field100 === 'WALLET2FLOAT' && field102.startsWith ( 'CA') ){
				// 	request.field24 = "MM";
				// }
				// if( field100 === 'WALLET2FLOAT' && !field102.startsWith ( 'CA') ){
				// 	request.field24 = "BM";
				// 	request.field100 = 'CORE2FLOAT'
				// }
				// if(field74 === 'WALLET2FLOAT' && !field102.startsWith ( 'CA')){
				// 	request.field24 = "BM";
				// 	request.field74  = 'CORE2FLOAT';
				// }

				// //FT
				// if ( field102 && field103 && field100 === 'FT' ) {

				// 	if ( field102.startsWith ( 'CA' )  && field103.startsWith ( 'CA')) {
				// 		request.field100 = 'FT'
				// 	}
				// 	if ( field102.startsWith ( 'CA' ) && !field103.startsWith ( 'CA')) {
				// 		request.field100 = 'FTWALLET2CORE'
				// 	}

				// 	if ( !field102.startsWith ( 'CA' )  && field103.startsWith ( 'CA')) {
				// 		request.field100 = 'FTCORE2WALLET'
				// 	}
				// 	if ( !field102.startsWith ( 'CA' )  && !field103.startsWith ( 'CA')) {
				// 		request.field100 = 'FTCORE2CORE' 
				// 	}
				// }

				// //FT charges
				// if ( field102 && field103 && field74 === 'FT' ) {

				// 	if ( field102.startsWith ( 'CA' )  && field103.startsWith ( 'CA')) {
				// 		request.field74 = 'FT'
				// 	}
				// 	if ( field102.startsWith ( 'CA' ) && !field103.startsWith ( 'CA')) {
				// 		request.field74 = 'FTWALLET2CORE'
				// 	}

				// 	if ( !field102.startsWith ( 'CA' )  && field103.startsWith ( 'CA')) {
				// 		request.field74 = 'FTCORE2WALLET'
				// 	}
				// 	if ( !field102.startsWith ( 'CA' )  && !field103.startsWith ( 'CA')) {
				// 		request.field74 = 'FTCORE2CORE' 
				// 	}
				// }

				if (env.environment === 'development') {
					this.logger.info(JSON.stringify({ params, request }, null, 4))
				}

				return request
			} catch (error) {
				this.logger.info(error)
				return {
					success: false,
					reqError: `Apply Prehooks falied ${error.message}`
				}
			}
		},
		async sendRequest(request, params) {
			//return httpFetch data & reqData
			try {
				let requestData = { ...request.request }
				let appTemplate = this.settings.requestSettings.template
				let pathParams = request['path-params']
				let sendReqData = { ...request }
				//Add template
				if (!request['remove-template']) {
					requestData = { ...appTemplate, ...request.request }
				}

				//run full replacements and request
				requestData = this.runReplacements(requestData, params)

				//apply prehooks
				requestData = this.applyPrehooks(requestData, { ...params, ...requestData })


				//if request contains path-params run replacements on path-params
				if (pathParams) {
					pathParams = this.runReplacements(pathParams, params)
					sendReqData['path-params'] = pathParams
				}

				let sendRequest = await this.generateRequest(sendReqData, requestData, params)

				let requestTime = {
					sent: moment().format('YYYY-MM-DD HH:mm:ss:SSSS')
				}

				let response = await this.httpFetch(
					sendRequest.method,
					sendRequest.url,
					sendRequest.data,
					sendRequest.headers
				)

				requestTime['received'] = moment().format('YYYY-MM-DD HH:mm:ss:SSSS')
				let sent = moment(requestTime.sent, 'YYYY-MM-DD HH:mm:ss:SSSS'),
					received = moment(requestTime.received, 'YYYY-MM-DD HH:mm:ss:SSSS')
				requestTime.latency = `${received.diff(sent, 'milliseconds')} ms`

				this.logger.info(`********nRequest**********\nRequest: ${JSON.stringify(response, null, 4)} \n********nRequest**********`)
				if (response.success) {
					response = await this.parseResponse(request, response)
				} else {
					response = {
						success: false,
						data: response.data,
						message: 99,
						errorMessage: 'Request was unsuccessful',
						requestNotRec: true
					}
				}

				//return request data for logging & reference data
				response.request = sendRequest
				response.requestTime = requestTime

				return response

			} catch (error) {
				this.logger.info(error)
				return {
					success: false,
					reqError: `Send Request failed ${error.message}`
				}
			}
		},
		async parseResponse(request, response) {
			let { code } = this.settings
			try {
				let data = response.data;
				let appPerm = this.settings.appPermissions
				let reqPermissions = request.ignorePermissions
				let success = false
				let payloadFormat = this.settings.appMeta['payload-format']

				//decode
				//check app permissions decodes - req over-rides
				this.logger.info(`******* Start-Response ***********\nresponse: ${JSON.stringify(data, null, 4)} \n********End-Response**********`)
				if (appPerm.encrypt && !reqPermissions) {
					data = this.aesDecrypt(data)
				}

				if (appPerm.base64 && !reqPermissions) {
					data = this.base64Decode(data)
				}

				if (request['override-payload-format']) {
					payloadFormat = request['override-payload-format']
				}

				//Payload format
				if (payloadFormat === 'XML') {
					data = await this.xml2Json(data)
				}

				//after decoding run fromJSON
				data = this.fromJSON(data)

				//Get response codes/fields
				let responseCfg = request['response']
				let fieldToCheck = responseCfg.status.field
				let matchingValues = responseCfg.status.matches
				let message = responseCfg.status.statusMessage || 0
				let errMessage = responseCfg.status.error.message
				let errorMessage = ''

				//check on codes
				//check for all success codes/fields
				//check if code/data field
				//check if code 200 !200 - always pass success if request failed
				//response field to include | to check different field same response match - status|Status|STATUS - PG
				if (fieldToCheck === 'code' && matchingValues.includes("!200")) {
					success = true
				} else if (fieldToCheck === 'code') {
					success = matchingValues.includes(response.code.toString())
				} else if (fieldToCheck.includes('|')) {
					let fields = fieldToCheck.split('|')
					for (let field of fields) {
						if (matchingValues.includes(data[field])) {
							success = true
							break;
						}
					}
				} else {
					//use dot-object to obtain nested response fields
					success = matchingValues.includes(dot.pick(fieldToCheck, data));
				}

				//check error data/field
				if (!success && errMessage === 'responseData') {
					errorMessage = data
				} else if (!success) {
					//use dot-object to obtain nested response fields
					errorMessage = dot.pick(errMessage, data)
				} else { }

				//add formatter - return json
				if (success && code && responseCfg['adapter']) {
					let methodName = responseCfg['adapter']
					let codeString = code[methodName]

					var fn = new Function('return ' + codeString)();
					data = fn(data)
				}

				//data = this.applyPosthooks(data)

				if (!success) {
					message = responseCfg.status.error.statusMessage || 99
				}


				//return success - boolean
				return {
					success,
					data,
					eSBData: response.data,
					message,
					errorMessage
				}

			} catch (error) {
				this.logger.info(error)
				return {
					success: false,
					message: 99,
					data: response.data,
					errorMessage: 'request unsuccessful',
					reqError: `Parse Response falied ${error.message}`
				}
			}
		},
		applyPosthooks(data) {
			try {

				return data

			} catch (error) {
				this.logger.info(error)
				return {
					success: false,
					reqError: `Apply post hooks falied ${error.message}`
				}
			}
		}
	}
}