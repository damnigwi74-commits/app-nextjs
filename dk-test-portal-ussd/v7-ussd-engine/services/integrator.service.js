"use strict"

const xml2js        = require('xml2js');
const moment        = require("moment");

module.exports = {
    name: "integrator",

    actions: {
        request: {
            async handler (ctx) {
                /**
                 * Handle MNO traffic to v7 Engine
                 * Receive trafick, format to Engine query parameters.
                 * Format v7 Engine response to MNO's expected response
                 * 
                 * Change endpoint in api service if request and response do not match expected results
                 * Request Parameters >>>> http://127.0.0.1:4000/ussd/ushuru-sacco-ussd/?SESSION_ID=254794672288&SERVICE_CODE=675&IMSI=254722712271&TIMSI=1584858862545050&MOBILE_NUMBER=254715748115&USSD_BODY=1*1
                 * Proceeding session Response >>>> CON Dear Customer..
                 * End session Response >>> END Dear Customer... 
                 */

                /**
                 * Example Airtel
                 */
                //AIRTEL
                let payload = {
                    SESSION_ID      : ctx.params.SESSION_ID,
                    SERVICE_CODE    : ctx.params.SERVICE_CODE.replace(/\*/g, '').replace(/#/g, ''),
                    MOBILE_NUMBER   : ctx.params.MSISDN,
                    IMSI            : ctx.params.TIMSI,
                    USSD_BODY       : ctx.params.USSD_STRING
                }

                if ( ctx.params.newrequest === '1' ) {  // 1- new dial
                    payload[ 'USSD_BODY'] = ''	
                }
                
                let response = await ctx.call('session.session', { ...payload })

                let endSession = "FC"

                if ( response.startsWith ('END ') ) {
                    endSession = "FB"
                }

                response = response.trim().replace(/CON/g,'').replace(/END/g,'')

                //set airtel headers
                ctx.meta.$responseHeaders  = {
                    'Server'        : 'Eclectics Ussd Server',
                    'Freeflow'      : endSession,
                    'charge'        : 'N',
                    'amount'        : '0',
                    'Expires'       : '-1',
                    'Pragma'        : 'no-cache',
                    'Cache-Control' : 'max-age=0',
                    'Content-Length': response.length
                }

                return response
            }
        },

        mtnEthiopia: {
            async handler (ctx) {
                /**
                 * Handle MNO traffic to v7 Engine
                 * Receive trafick, format to Engine query parameters.
                 * Format v7 Engine response to MNO's expected response
                 * 
                 * Change endpoint in api service if request and response do not match expected results
                 * Request Parameters >>>> http://127.0.0.1:4000/ussd/ushuru-sacco-ussd/?SESSION_ID=254794672288&SERVICE_CODE=675&IMSI=254722712271&TIMSI=1584858862545050&MOBILE_NUMBER=254715748115&USSD_BODY=1*1
                 * Proceeding session Response >>>> CON Dear Customer..
                 * End session Response >>> END Dear Customer... 
                 */

                let { methodCall } = ctx.params

                let data = methodCall.params[0].param[0].value[0].struct[0].member

                let queryParams = { 
                    TransactionId       : data.find(e => e.name.includes("TransactionId")).value[0].string[0], 
                    TransactionTime     : data.find(e => e.name.includes("TransactionTime")).value[0]['dateTime.iso8601'][0],
                    MSISDN              : data.find(e => e.name.includes("MSISDN")).value[0]['string'][0], 
                    USSDServiceCode     : data.find(e => e.name.includes("USSDServiceCode")).value[0]['string'][0],
                    USSDRequestString   : data.find(e => e.name.includes("USSDRequestString")).value[0]['string'][0], 
                    response            : data.find(e => e.name.includes("response")).value[0]['string'][0]
                }

                let payload = {
                    SESSION_ID      : queryParams.TransactionId,
                    SERVICE_CODE    : queryParams.USSDServiceCode,
                    MOBILE_NUMBER   : queryParams.MSISDN,
                    IMSI            : '',
                    USSD_BODY       : queryParams.USSDRequestString,
                    MTN_RESPONSE    : queryParams.response
                }
                        
                let response = await ctx.call('session.session', { ...payload })

                let resAction = 'request'
                if(response.startsWith('END ')){
                    resAction = 'end'
                }
                response = response.trim().replace(/CON /,'').replace(/END /,'')

                let responseObject = {
                    params: {
                        param: {
                            value: {
                                struct: {
                                    member: [{
                                            "name": "USSDResponseString",
                                            "value": {
                                                "string": response
                                            }
                                        },
                                        {
                                            "name": "action",
                                            "value": {
                                                "string": resAction
                                            }
                                        },
                                        {
                                            "name": "TransactionTime",
                                            "value": {
                                                "dateTime.iso8601": moment().format('YYYYMMDDThh:mm:ss')
                                            }
                                        },
                                        {
                                            "name": "TransactionId",
                                            "value": {
                                                "string": queryParams.TransactionId
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
                let builder = new xml2js.Builder();
                let telcomResponse = builder.buildObject({methodResponse: responseObject});
                            
                ctx.meta.$responseHeaders  = {
                    'Content-Type'      : 'text/xml',
                    'Content-Length'    : telcomResponse.length,
                    'Connection'        : 'close',
                    'X-Powered-By'      : 'PHP/5.2.9',
					'Server'            : 'Apache/2.2.8 (Linux/SUSE)'
                }                           

                return telcomResponse
            }
        },

        safEthiopia: {
            async handler (ctx) {
                let { ussd: { msisdn, sessionid, type, msg, serviceCode = '*9514#' } } = ctx.params
                msisdn      =  msisdn[0]
                sessionid   =  sessionid[0]
                type        =  type[0]
                msg         =  msg[0]

                if(type === '1'){
                    serviceCode = msg
                    msg = ''
                }

                ctx.params[ 'SESSION_ID']    = sessionid
                ctx.params[ 'SERVICE_CODE']  = serviceCode
                ctx.params[ 'MOBILE_NUMBER'] = msisdn
                ctx.params[ 'IMSI']          = '' 
                ctx.params[ 'USSD_BODY']     = msg
                ctx.params[ 'appName']       = 'addis-bank-ussd'
            
                let response = await ctx.call('session.session', { ...ctx.params });

                //Build Safaricom response
                response = response.trim().replace(/CON/g,'').replace(/END/g,'')

                let responseObject = {
                    msisdn,
                    sessionid,
                    type,
                    msg: response
                }
                let builder = new xml2js.Builder();
                let telcomResponse = builder.buildObject({ussd: responseObject});

                return telcomResponse
            }
        }
    },

    methods: {

    }
}