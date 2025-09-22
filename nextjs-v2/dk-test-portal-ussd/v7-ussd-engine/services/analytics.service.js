"use strict"

const moment      		 = require('moment');

const HandlerMixin       = require('../mixins/handler.mixin')
const RedisLibMixin      = require('../mixins/cache.mixin')

/**
 * Analytics service to capture user journey, transactions and USSD trends
 * Serves as: 
 *  audit trail for customers accessing the USSD
 *  trends for admin
 */

module.exports = {
    name: "analytics",

    mixins: [ HandlerMixin, RedisLibMixin ],

    actions: {
        transactions: {
            params: {
                payload: 'object'
            },
            async handler (ctx) {
                /**
                 * - Log all transactions
                 * - Keep count of failed transactions
                 * - Percentages - failure rate, success rate, average time
                 * - Send failed transactions to failure count
                 * - Set alert thresholds for:
                 *      1. Failed transactions
                 *      2. Successful txn type
                 *      3. Unsuccessful txns
                 */
                let { apiRoute, payload, runAnalytics } = ctx.params;

                /**
                 * Call MongoDB service
                 */
                if(runAnalytics){
                    try {
                        //Clean API Data for PINs, mask Account & card numbers
                        let data = this.cleanApiRequests({ apiRoute, payload })
                        let params = {
                            ...data,
                            timestamp       : moment().format()
                        }

                        //Exclude audit trail
                        if( data.transactionType && data.transactionType !== 'audit-trail'){
                            await ctx.call('database.txnTrail', { payload: params, requestName: 'txn-trail' });
                        }

                    } catch (error) {
                        console.log(error)
                    }
                }

                return { success: true };
            }
        },
        usage: {
            async handler (ctx) {
                let { api, code, appConfig, menuString, cacheId, userInput, currentStep, customerName, runAnalytics } = ctx.params

                if(runAnalytics){
                    // Hide user input for sensitive data menus
                    let hideUserInput = [ 'login', 'pin-change', 'first-login', 'wrong-login', 'invalid-login', 'pin-change-old-pin', 'pin-change-new-pin', 'pin-change-new-pin-reenter', 'pin-change-confirm', 'first-login-system-pin', 'first-login-new-pin', 'first-login-new-pin-reenter', 'transaction-login', 'client-page', 'first-login-confirm', 'api-success', 'api-error', 'balance-success', 'cardless-withdrawal-confirm' ]

                    let menuCategory = 'registered'
                    if(hideUserInput.includes(currentStep) && userInput){
                        userInput = '****'
                        menuCategory = 'authentication'
                    }
    
                    //send data to ESB
                    let payload = {
                        menuString      : menuString.replace(/\+/g, ' ').replace(/\n/g, ' '), 
                        cacheId         , 
                        userId          : cacheId.split(':')[2],
                        walletAccount   : cacheId.split(':')[2], 
                        userInput       , 
                        category        : menuCategory, 
                        currentStep     ,
                        customerName    : customerName || '',
                        timestamp       : moment().format()
                    }
    
                    /**
                     * Send to ESB or MongoDB service
                     */
    
                    //MongoDB
                    await ctx.call('database.auditTrail', { payload, requestName: 'audit-trail' })

                    //ESB
                    let response = {}
                    if(api['request-settings']['endpoints']['audit-trail']){
                        response = await ctx.call('transactions.request', {
                            api,
                            code,
                            appConfig,
                            apiRoute: 'audit-trail',
                            payload
                        });
                        //console.log('<<<<<<<ANALYTICS RESPONSE>>>>>>>>', { payload, response })
                    }
    
                    return { response, payload }
                }

                return {}
            }
        },
        trends: {
            async handler () {
                /**
                 * Get average usage
                 * Get average transactions (per specific time, per Sec, Hr, D, M)
                 * Use phone number to show most active users
                 * Usage of most visited pages & prompts
                 * Highest peak (time) of transactions
                 * Usage in numbers
                 * Failed transactions
                 * Canceled transactions
                 * Average response time (per txn type)
                 */
            }
        },
        usageDashboard: {
            async handler (ctx) {
                let { payload: { timeframe: { startDate, endDate }, activeProjectName } } = ctx.params;
                console.log({ startDate, endDate })

                let menusCount = await ctx.call('database.fetchCollectionCount', { 
                    collectionName: 'audit-trail', 
                    params: { 
                        timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() } 
                    } 
                });

                let loginCount = await ctx.call('database.fetchCollectionCount', { 
                    collectionName: 'audit-trail', 
                    params: { 
                        currentStep: 'login',
                        timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() } 
                    } 
                });

                let auditTrail = await ctx.call('database.fetchItems', { 
                    collectionName: 'audit-trail', 
                    params: { 
                        timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() } 
                    }  
                });

                let activeUsers = await this.RedisGetKeys([`${activeProjectName}:clients:*`]) || [];

                let reqTimeouts = await ctx.call('database.fetchItems', { 
                    collectionName: 'transactions', 
                    params: { 
                        level: 'error',
                        timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() } 
                    } 
                });

                let recentUsers = await ctx.call('database.fetchItems', { 
                    collectionName: 'audit-trail', 
                    params: { 
                        timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() } 
                    } 
                });
                
                let recentTxns = await ctx.call('database.fetchItems', { 
                    collectionName: 'audit-trail', 
                    params: { 
                        timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() } 
                    } 
                });

                // let newrecentUsers = [ ...new Set(recentUsers.data.map(e => e.userId))]
                
                // console.log(JSON.stringify({recentUsers, time: moment().subtract(24, 'h').format()}, null, 4))
                return {
                    message: {
                        success: true,
                        menusCount: menusCount.data,
                        loginCount: loginCount.data,
                        auditTrail: auditTrail.data,
                        reqTimeouts: reqTimeouts.data,
                        recentUsers: recentUsers.data,
                        recentTxns: recentTxns.data,
                        activeUsers
                    }
                }
            }
        },
        tableTxnData: {
            async handler (ctx){
                let { payload: { timeframe: { startDate, endDate }, paging: { limit, skip }, additionalFilters = {} } } = ctx.params;
                console.log({ startDate: moment(startDate).format(), endDate: moment(endDate).format(), limit, skip })

                let txnsCount = await ctx.call('database.fetchCollectionCount', { 
                    collectionName: 'transactions', 
                    params: { 
                        timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() }
                    } 
                });

                let txnTrail = await ctx.call('database.fetchItems', { 
                    collectionName: 'transactions', 
                    params: { 
                        timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() },
                        ...additionalFilters
                    },
                    options: { limit: parseInt(limit, 10), skip: parseInt(skip, 10)  }
                });

                return {
                    message: {
                        success: true,
                        txnsCount: txnsCount.data,
                        txnTrail: txnTrail.data
                    }
                }
            }
        },
        txnDashboard: {
            async handler (ctx) {
                let { payload: { timeframe: { startDate, endDate }, paging: { limit, skip }, additionalFilters = {}, chartTime, activeProjectName } } = ctx.params;
                startDate = startDate.replace(/ /, '+')
                endDate = endDate.replace(/ /, '+')
                
                console.log({ startDate: moment(startDate).format(), endDate: moment(endDate).format(), limit, skip, additionalFilters, chartTime })

                //if additional filter has userId search as string or number
                if(additionalFilters.userId){
                    additionalFilters.$or = [ { userId: Number(additionalFilters.userId)}, { userId: additionalFilters.userId }]
                    delete additionalFilters.userId
                }

                let txnsCount = await ctx.call('database.fetchCollectionCount', { 
                    collectionName: 'transactions', 
                    params: { 
                        timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() },
                        ...additionalFilters
                    } 
                });

                let successTxn = await ctx.call('database.fetchCollectionCount', { 
                    collectionName: 'transactions', 
                    params: { 
                        success: true,
                        timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() },
                        ...additionalFilters
                    } 
                });

                let failedTxn = await ctx.call('database.fetchCollectionCount', { 
                    collectionName: 'transactions', 
                    params: { 
                        success: false,
                        timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() },
                        ...additionalFilters
                    } 
                });

                // let timeoutTxn = await ctx.call('database.fetchCollectionCount', { 
                //     collectionName: 'transactions', 
                //     params: { 
                //         timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() },
                //         latency: { $gte: 14000 }
                //     } 
                // });

                let txnTrail = await ctx.call('database.fetchItems', { 
                    collectionName: 'transactions', 
                    params: { 
                        timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() },
                        ...additionalFilters
                    },
                    options: { limit: parseInt(limit, 10), skip: parseInt(skip, 10)  }
                });
                let noLimitData = await ctx.call('database.fetchItems', { 
                    collectionName: 'transactions', 
                    params: { 
                        timestamp: { $gte: moment(startDate).format(), $lt: moment(endDate).format() },
                        ...additionalFilters
                    }
                });
                let pieData = this.createPieData(noLimitData.data)
                let chartData = this.createChartData(noLimitData.data, chartTime, endDate)

                let timeoutTxns = noLimitData.data.filter(e => e && e.latency && Number(e.latency.replace(/[^0-9]/g, '') >= 14000 )).length

                // console.log(JSON.stringify({txnsCount, successTxn, failedTxn, txnTrail, recentTxns}, null, 4))
                return {
                    message: {
                        success: true,
                        txnsCount: txnsCount.data,
                        successTxn: successTxn.data,
                        failedTxn: failedTxn.data,
                        timeoutTxns,
                        txnTrail: txnTrail.data,
                        pieData,
                        chartData
                    }
                }
            }
        },
        txnDashboardEvents: {
            async handler (ctx) {
                let { payload: { timeframe, activeProjectName } } = ctx.params;

                let txnsCount = await ctx.call('database.fetchCollectionCount', { 
                    collectionName: 'transactions' 
                });

                let successTxn = await ctx.call('database.fetchCollectionCount', { 
                    collectionName: 'transactions', 
                    params: { 
                        success: true 
                    } 
                });

                let failedTxn = await ctx.call('database.fetchCollectionCount', { 
                    collectionName: 'transactions', 
                    params: { 
                        success: false 
                    } 
                });

                let txnTrail = await ctx.call('database.fetchItems', { 
                    collectionName: 'transactions' 
                });

                let recentTxns = await ctx.call('database.fetchItems', { 
                    collectionName: 'transactions', 
                    params: { 
                        timestamp: { $gte: moment().subtract(24, 'h').format(), $lt: moment().format() } 
                    } 
                });

                // console.log(JSON.stringify({txnsCount, successTxn, failedTxn, txnTrail, recentTxns}, null, 4))

                ctx.meta.$responseHeaders  = {
                    'Content-Type'  : 'text/event-stream',
                    'Connection'	: 'keep-alive',
					'Cache-Control'	: 'no-cache'
                }

                return JSON.stringify({
                    success: true,
                    txnsCount: txnsCount.data,
                    successTxn: successTxn.data,
                    failedTxn: failedTxn.data,
                    txnTrail: txnTrail.data,
                    recentTxns: recentTxns.data
                })
            }
        }
    },

    methods: {
        cleanApiRequests ({ apiRoute, payload }) {
            let { 
                userDevice = { osName: '', deviceType: '', brand: '', clientType: '' }, 
                ['esb-request']:esbRequest = {} 
            } = payload

            let statusCode = 'success'
            let responseMessage = esbRequest.message

            if(!esbRequest.success){
                statusCode = 'failed'
                responseMessage = esbRequest.error
            }

            let cleanData = {
                level               : payload.type,
                userId              : payload.userId,
                transactionType     : apiRoute,  
                action              : payload.txnType, 
                success             : esbRequest.success,
                statusCode          ,
                responseMessage     ,
                amount              : esbRequest?.data?.field4 || 0,
                latency             : esbRequest?.requestTime?.latency,
                request             : esbRequest['request'],
                txnRef              : esbRequest?.request?.data?.field37,
                response            : esbRequest['data'],
                charges             : esbRequest?.data?.chargeAmount || 0,
                exciseDuty          : esbRequest?.data?.exciseDutyAmount || 0,
                ftTax               : esbRequest?.data?.ftTaxAmount || 0,
                tax                 : esbRequest?.data?.taxAmount || 0,
                cbtTax              : esbRequest?.data?.cbtTaxAmount || 0,
                requestTime         : esbRequest['requestTime'],
                clientIp            : payload['clientIp'],
                sessionId           : payload['sessionId'],
                device              : `${userDevice.osName} ${userDevice.deviceType} ${userDevice.brand} ${userDevice.clientType} ${userDevice.clientName}`.trim()
            }

            //Clean sensitive data from logs based on api route called
            switch (apiRoute) {
            
                default:
                    break;
            }
            return cleanData;
        },
        createPieData(data){
            let chargesReqs = []
            let lookupReqs = []
            data.forEach(entry => {
                if(!chargesReqs.includes(entry.transactionType) && entry.transactionType.includes('-charges')){
                    chargesReqs.push(entry.transactionType)
                }
                if(!lookupReqs.includes(entry.transactionType) && (entry.transactionType.includes('-lookup') || entry.transactionType.includes('-presentment'))){
                    lookupReqs.push(entry.transactionType)
                }
            })
    
            let allRequestTypes = []
            data.forEach(entry => {
                if( !allRequestTypes.includes(entry.transactionType) && !chargesReqs.includes(entry.transactionType) && !lookupReqs.includes(entry.transactionType) ){
                    allRequestTypes.push(entry.transactionType)
                }
            })
    
            let pData = allRequestTypes.map(entry => {
                return {
                    value: data.filter(e => e.transactionType === entry).length,
                    name: entry.replace(/\//, '').replace(/-/g, ' '),
                    fill: `#${Math.floor(Math.random()*16777215).toString(16)}`
                }
            })
            //push lookups and charges
            pData.push({
                value: data.filter(e => e && chargesReqs.includes(e.transactionType)).length,
                name: 'Charges',
                fill: `#${Math.floor(Math.random()*16777215).toString(16)}`
            })
            pData.push({
                value: data.filter(e => e && lookupReqs.includes(e.transactionType)).length,
                name: 'Presentments',
                fill: `#${Math.floor(Math.random()*16777215).toString(16)}`
            })
    
            return pData
        },
        createChartData(params, chartTime, endDate){
            let chartData = [
                {
                  name: "24 Hrs",
                  successful: 0,
                  failed: 0
                },
                {
                  name: "20 Hrs",
                  successful: 0,
                  failed: 0
                },
                {
                  name: "17 Hrs",
                  successful: 0,
                  failed: 0
                },
                {
                  name: "13 Hrs",
                  successful: 0,
                  failed: 0
                },
                {
                  name: "10 Hrs",
                  successful: 0,
                  failed: 0
                },
                {
                  name: "06 Hrs",
                  successful: 0,
                  failed: 0
                },
                {
                  name: "03 Hrs",
                  successful: 0,
                  failed: 0
                }
            ]

            if(chartTime === '24h'){
                let ccData = (from, to, status) => {
                    return params.filter(entry => entry.success === status && moment(entry.timestamp).isAfter(moment().subtract(Number(from), 'h').format()) && moment(entry.timestamp).isBefore(moment().subtract(Number(to), 'h').format())).length
                }
        
                let data = chartData.map(entry => {
                    if(entry.name === "24 Hrs"){
                        entry = {
                            ...entry,
                            successful: ccData('24', '20', true),
                            failed: ccData('24', '20', false)
                        }
                    }
                    if(entry.name === "20 Hrs"){
                        entry = {
                            ...entry,
                            successful: ccData('20', '17', true),
                            failed: ccData('20', '17', false)
                        }
                    }
                    if(entry.name === "17 Hrs"){
                        entry = {
                            ...entry,
                            successful: ccData('17', '13', true),
                            failed: ccData('17', '13', false)
                        }
                    }
                    if(entry.name === "13 Hrs"){
                        entry = {
                            ...entry,
                            successful: ccData('13', '6', true),
                            failed: ccData('13', '6', false)
                        }
                    }
                    if(entry.name === "10 Hrs"){
                        entry = {
                            ...entry,
                            successful: ccData('10', '6', true),
                            failed: ccData('10', '6', false)
                        }
                    }
                    if(entry.name === "06 Hrs"){
                        entry = {
                            ...entry,
                            successful: ccData('6', '3', true),
                            failed: ccData('6', '3', false)
                        }
                    }
                    if(entry.name === "03 Hrs"){
                        entry = {
                            ...entry,
                            successful: ccData('3', '0', true),
                            failed: ccData('3', '0', false)
                        }
                    }
                    return entry
                })
        
                return data
            }

            if(chartTime === '7d'){
                let ccData = (from, to, status) => {
                    return params.filter(entry => entry.success === status && moment(entry.timestamp).isAfter(moment(endDate).subtract(Number(from), 'd').format('YYYYMMDD')) && moment(entry.timestamp).isBefore(moment(endDate).subtract(Number(to), 'd').format('YYYYMMDD'))).length
                }
        
                let data = chartData.map(entry => {
                    if(entry.name === "24 Hrs"){
                        entry = {
                            ...entry,
                            name: moment(endDate).subtract('7', 'd').format('YYYY-MM-DD'),
                            successful: ccData('7', '6', true),
                            failed: ccData('7', '6', false)
                        }
                    }
                    if(entry.name === "20 Hrs"){
                        entry = {
                            ...entry,
                            name: moment(endDate).subtract('6', 'd').format('YYYY-MM-DD'),
                            successful: ccData('6', '5', true),
                            failed: ccData('6', '5', false)
                        }
                    }
                    if(entry.name === "17 Hrs"){
                        entry = {
                            ...entry,
                            name: moment(endDate).subtract('5', 'd').format('YYYY-MM-DD'),
                            successful: ccData('5', '4', true),
                            failed: ccData('5', '4', false)
                        }
                    }
                    if(entry.name === "13 Hrs"){
                        entry = {
                            ...entry,
                            name: moment(endDate).subtract('4', 'd').format('YYYY-MM-DD'),
                            successful: ccData('4', '3', true),
                            failed: ccData('4', '3', false)
                        }
                    }
                    if(entry.name === "10 Hrs"){
                        entry = {
                            ...entry,
                            name: moment(endDate).subtract('3', 'd').format('YYYY-MM-DD'),
                            successful: ccData('3', '2', true),
                            failed: ccData('3', '2', false)
                        }
                    }
                    if(entry.name === "06 Hrs"){
                        entry = {
                            ...entry,
                            name: moment(endDate).subtract('2', 'd').format('YYYY-MM-DD'),
                            successful: ccData('2', '1', true),
                            failed: ccData('2', '1', false)
                        }
                    }
                    if(entry.name === "03 Hrs"){
                        entry = {
                            ...entry,
                            name: moment(endDate).subtract('1', 'd').format('YYYY-MM-DD'),
                            successful: ccData('1', '0', true),
                            failed: ccData('1', '0', false)
                        }
                    }
                    return entry
                })
        
                return data
            }
        }
    }
}