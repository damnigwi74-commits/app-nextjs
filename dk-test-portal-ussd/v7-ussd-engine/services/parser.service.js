"use strict";

const RedisLibMixin  = require('../mixins/cache.mixin')
const UtilitiesMixin = require('../mixins/utilities.mixin')

module.exports = {
    name: "parser",

    mixins: [ RedisLibMixin, UtilitiesMixin ],

    actions: {
        parser: {
            params: {
				MOBILE_NUMBER: "string",
				USSD_BODY: "string",
				IMSI: "string|optional",
				TIMSI: "string|optional"
            },
            async handler (ctx) {
                let { blacklist, NEW_SESSION } = ctx.meta
				let { appName, MOBILE_NUMBER:userId, TIMSI, IMSI, USSD_BODY } = ctx.params

                if(!blacklist){
                    try {
                        let imsi           =  IMSI || TIMSI || "" //use empty if NO IMSI

                        //filter the user input string from the MNO
                        let BODY_DELIMITER = '*';
                        let ussd_body      = USSD_BODY.split(BODY_DELIMITER);				
                        ussd_body          = ussd_body.filter((item)      => {
                            return item && typeof (item) !== 'undefined' && item.trim() !== '' && item !== null;
                        })
                        let userInput     =  ''
                        if ( ussd_body.length > 0 ){
                            userInput =  ussd_body[ussd_body.length - 1]
                        }
                        if ( NEW_SESSION ) {
                            userInput = ''
                        }

                        //initiate our data holder variables
                        let cacheId       = [ appName, 'clients', userId ].join(':');
                        let requestObject  = {
                            appName         ,
                            userInput       ,
                            imsi            ,
                            user_data       : false,
                            applicationData : false
                        }


                        /**
                         * --------------------------------------
                         *
                         * FETCH THE USER & APP DATA FROM CACHE
                         *
                         * --------------------------------------
                         */
                        //[ Analytics ] Log Redis Response time
                        console.time('Redis fetch duration');
                        //fetch the users data if it exists
                        let app_data = false;
                        let keys = [
                            [appName, 'config', 'adapter'].join(':'),
                            [appName, 'config', 'api'].join(':'),
                            [appName, 'config', 'code'].join(':'),
                            [appName, 'config', 'config'].join(':'),
                            [appName, 'config', 'language'].join(':'),
                            [appName, 'config', 'pages'].join(':'),
                            [appName, 'config', 'prompts'].join(':'),
                            [appName, 'config', 'prompts_cache'].join(':'),
                            [appName, 'config', 'whitelist'].join(':'),
                            [appName, 'config', 'permissions'].join(':'),
                            cacheId
                        ];
                        let redis_data    = await this.RedisGetMany(keys);
                        let api           = redis_data.api;
                        let adapter       = redis_data.adapter;
                        let code          = redis_data.code;
                        let config        = redis_data.config;
                        let language      = redis_data.language;
                        let pages         = redis_data.pages;
                        let prompts       = redis_data.prompts;
                        let promptsCache  = redis_data.prompts_cache;
                        let user_data     = redis_data[`${userId}`];
                        let permissions   = redis_data.permissions;
                        //let roles         = redis_data.whitelist.access;
                        let appEnv        = redis_data.config['environment'] || 'production'
                        let enablePerm    = redis_data.config['enable-permissions'] || false
                        console.timeEnd('Redis fetch duration');

                        //Decrypt UserData
                        user_data = this.retrieveUserData(user_data)

                        //set user data to false in case we get a blank object from redis
                        if (typeof user_data === 'object' && Object.keys(user_data).length === 0) {
                            user_data = false;
                        }
                        
                        /**
                         * --------------------------------------
                         *
                         * DATA ROUTING
                         *
                         * --------------------------------------
                         */
                        //all app data exists
                        if (adapter && api && code && config && language && pages && prompts && promptsCache) {
                            requestObject.applicationData = {
                                adapter,
                                api,
                                code,
                                config,
                                language,
                                pages,
                                prompts,
                                promptsCache
                            };
                            app_data = true;
                        }
                        //user data exists and app data exists and it isnt the first request
                        if (user_data && app_data && userInput !== '') {
                            requestObject.user_data   = user_data;
                            requestObject['cacheId'] = cacheId;
                            ctx.params             = requestObject;
                            ctx.params.hasData     = true;
                        }
                        //app data doesnt exist
                        else if (!app_data) {
                            console.log('App doesnt exist...');
                            ctx.params.hasData = false;
                        }
                        //user data isnt in redis or its the first request        
                        else if (
                            !user_data && app_data        || //user data isnt in redis or
                            userInput === '' && app_data    //its the first request
                        ) {
                            if (config ['do-not-load-profile']) {
                                // console.log ( { donotloadprofile_user_Data :Object.keys ( user_data ) })
                                if ( user_data ) {
                                    requestObject.user_data = user_data 
                                }
                                else {
                                    requestObject.user_data   = { 
                                        'account-details':{ 
                                            'account-type': 'client',
                                            'all-accounts':`a/c - ${userId}\n`,
                                            'loan-accounts': [],
                                            'search-options': [],
                                            'firstname': 'Customer',
                                            imsi,
                                            'mwallet-account':[
                                                {
                                                    label: `${userId}`,
                                                    value: `${userId}`
                                                }
                                            ],
                                            'is-registered': true,
                                            'is-secure': true,
                                            'is-dormant': false,
                                            'is-blocked': false,
                                            'first-login': false,
                                            'is-imsi': true
                                        },
                                        'global-request-details': {},
                                        language: 'english',
                                        msisdn: userId,
                                        imsi,
                                        'pin-trials-remaining': 3 
                                    };
                                }
                                
                                requestObject['cacheId']  = cacheId;
                                requestObject.app_env     = appEnv;
                                ctx.params                = requestObject;
                                ctx.params.hasData        = true;
            
                                //persist to redis
                                // await this.RedisInsert(cache_id, requestObject.user_data );
                            }else {
                                console.time('ESB duration');
                                //make an api request
                                let apiResult = await ctx.call('transactions.request', {
                                    api, //api configuration settings: JSON
                                    code, // custom code: JSON
                                    adapter,
                                    userId,
                                    appConfig: config,
                                    apiRoute: config['api-user-profile-route'],
                                    payload: {
                                        'walletAccount': userId,
                                        imsi
                                    }
                                });
                                //console.log(JSON.stringify({apiResult}, null, 4))
                                //on-success, persist user data
                                if (apiResult.success) {
            
                                    let data = apiResult.data;
                                    //persist the users pin trials and language choice
                                    
                                    if (userInput === '' && !user_data) {
                                        //set some defaults
                                        data['pin-trials-remaining'] = 3;
                                        data['transaction-pin-trials-remaining'] = 3;
                                        data['language'] = config['language'] || "english";
                                    }
                                    if(userInput === '' && user_data){
                                        data['pin-trials-remaining'] = user_data['pin-trials-remaining'];
                                        data['transaction-pin-trials-remaining'] = user_data['transaction-pin-trials-remaining'];
                                        data['language'] = user_data['language'];
                                    }
                                    data.msisdn = userId
                                    data.imsi   = imsi
                                    data['global-request-details']          = data['global-request-details'] || {}
                                    data['global-request-details']['imsi']  = imsi
                                    data['account-details']['account-type'] = data['account-details']['account-type'] || 'client'

                                    //Encrypt user-data values
                                    let secureUserData = this.secureUserData(data)
                                    
                                    //persist to redis
                                    await this.RedisInsert(cacheId, secureUserData);
            
                                    //add to our user object
                                    requestObject.user_data   = data;
                                    requestObject['cacheId'] = cacheId;
                                    requestObject.app_env     = appEnv;
                                    ctx.params                = requestObject;
                                    ctx.params.hasData        = true;
                                }else {
                                    //if the data is valid, persist it to redis and pass it on to the ussd for processing
                                    ctx.params.hasData = false;
                                }
                                console.timeEnd('ESB duration');
                            }
                        }

                        /** APP Permissions
                         * check if permissions enable
                         * get user-type from account-details
                         * check if user-type permisions exist
                         */
                        try {
                            if(enablePerm && permissions && permissions['user-type']){
                                let userAccess = requestObject.user_data['account-details']['user-type'] || false
                                if(userAccess && permissions['user-type'][userAccess]){
                                    let perms = permissions['user-type'][userAccess]

                                    //apply access permissions to the data
                                    let pageKeys = Object.keys(pages)
                    
                                    for (let pageKey of pageKeys) {
                    
                                        let options     = pages [pageKey].options
                                        for (let index in options) {
                    
                                            for (let perm of perms) {
                                                if (perm.name === options[index].name) { 
                                                    ctx.params.applicationData.pages[pageKey].options[index].enabled = perm.enabled
                                                }     
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.log({ APP_PERMMISIONS_ERROR: error })
                        }

                    } catch (error) {
                        console.log ( { CONFIG_HANDLER_ERROR: error } )
                    }
                }

                return await this.actions.getMenu(ctx.params, { parentCtx: ctx })
            }
        },
        getMenu: {
            async handler (ctx) {
				let { appName,  hasData } = ctx.params;
                let { blacklist_mesage } = ctx.meta

                let app_name             = appName.replace(/-/g, ' ');

                if (hasData) {
                    let response = await ctx.call('menu-handler.loadMenu', ctx.params);
                    if (response) {
                        ctx.params["menuResponse"] = response;
                    }else {
                        ctx.params["menuResponse"] = `An Menu Handling error - \`menuHandlerMiddleware\``;
                    }
                }
                else {
                    if ( blacklist_mesage ) {
                        ctx.params["menuResponse"] = `END ${blacklist_mesage }`;	
                    }else{
                        //use menu handler functionalities in order to load an error prompt
                        ctx.params["menuResponse"] = `END Dear customer, the ${app_name} service is currently experiencing technical difficulties. Please try again later.`;
                    }
                }

                return await ctx.call('responder.sendUssdResponse', { ...ctx.params })
            }
        }
    }
}