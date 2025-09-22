"use strict";

const RedisLibMixin = require('../mixins/cache.mixin')

/** WHITELIST SERVICE
*/

module.exports = {
    name:  "whitelist",

    mixins: [ RedisLibMixin ],

    actions: {
        runWhitelist: {
			params: {
				MOBILE_NUMBER: "string"
			},
            async handler (ctx) {
				let { appName, MOBILE_NUMBER:userId } = ctx.params

                try {
                    let keys                                 = [ 
                        [appName, 'config', 'whitelist'].join(':'),
                        [appName, 'config', 'config'].join(':')
                    ];
                    let redis_data        = await this.RedisGetMany(keys);
                    let enableWhitelist   = redis_data.config['enable-whitelist'] || false
                    let appWhitelist      = redis_data?.whitelist?.whitelist || []

                    if(enableWhitelist){
                        try {
                            /**check whitelist on REDIS */

                            let whitelist = await this.RedisExistsInSet('USSD_Whitelist', userId);
                            if(appWhitelist.length > 0 ){
                                whitelist = appWhitelist.includes(userId.toString())
                            }
                            if ( !whitelist){
                                //throw error
                                throw new Error ( 'blacklisted' )
                            }

                            /** check whitelist from ESB */

                            // const axios = require('axios');
                            // let instance = axios.create()
                            // let userResponse = {}
                            // let whitelist = false

                            // let whitelistData = JSON.stringify(redis_data.config['whitelist-data'])
                            // whitelistData = whitelistData.replace(/__phonenumber/g, userId).replace(/__imsi/g, ctx.params.IMSI)
                
                            // try {
                            	// userResponse = await instance.post(redis_data.config['whitelist-endpoint'], JSON.parse(whitelistData), {headers: { "Content-type": "application/json" }})
                            // } catch (error) {
                            // 	userResponse = error.response
                            // }
                
                            // if(userResponse && userResponse.data && userResponse.data.data){
                            // 	whitelist = !!userResponse.data.data[0].HESABU
                            // }
                
                            // if ( !whitelist){
                            // 	//throw error
                            // 	throw new Error( 'blacklisted' )
                            // }
                        } catch (error) {
                            console.log ( { WHITELIST_ERROR: error } )
                            if ( error.message === 'blacklisted' ) {
                                console.log( `Blacklist user ${userId} has tried to access the system`)
                                ctx.meta.blacklist_mesage = 'You are currently not authorized to access this service.'
                                ctx.meta.blacklist        = true
                                ctx.params.hasData    = false
                            }
                        }
                    }
                } catch (error) {
                    console.log ( { WHITELIST_HANDLER_ERROR: error } )
                    
                }

                return await ctx.call('parser.parser', { ...ctx.params })
            }
        }
    }
}