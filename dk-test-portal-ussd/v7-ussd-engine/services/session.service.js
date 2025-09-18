"use strict";

const RedisLibMixin = require('../mixins/cache.mixin')
let moment          = require('moment')

/** SESSION SERVICE
* checks redis for session id's key
* compares the incoming session_id to be in redis
* if not included reset user-details to start new session
* TODO: allow menu skipping for first dial
*/

module.exports = {
	name: "session",

	settings: {},

	dependencies: [],

    mixins: [ RedisLibMixin ],

	actions: {

		/**
		 * session handling
		 *
		 * @param {String} SESSION_ID - session id
		 * @param {String} appName - config name
		 */
		session: {
			params: {
				SESSION_ID: "string",
				MOBILE_NUMBER: "string"
			},
			async handler(ctx) {
				let { appName, SESSION_ID:sessionId, MOBILE_NUMBER:userId } = ctx.params
                ctx.meta.sessionId = sessionId

                try {
                    let key          = [ appName, 'session', userId].join(':');
                    let keys         = [ key ];
                    let redis_data   = await this.RedisGetMany(keys);
                    let session      = redis_data[userId];

                    /** user session does not exist
                     * sessions set to 10 minutes (600 seconds)
                     */
                    if ( !session ) {
                        await this.RedisInsert ( key, { [sessionId]: moment().format('') }, 600 )
                        ctx.meta.NEW_SESSION = true
                    }
                    //if it exists and session id not found, update it and set user input to blank
                    else if ( session && !session[sessionId] ) {
                        await this.RedisInsert ( key, { [sessionId]: moment().format('') }, 600 )
                        ctx.meta.NEW_SESSION = true
                    }
                    //if it exists and session id found, set user input to blank
                    else if ( session && session[sessionId] ) {
                        ctx.meta.NEW_SESSION = false
                    }
                    else {
                        ctx.meta.NEW_SESSION = true
                    }

                    //add active users key to track active users; expiry 2 minutes
                    let tempuser       = [ appName, 'activeusers', userId ].join(':');
                    this.RedisInsert ( tempuser, { lastdial: moment().format('') }, 120 )
                } catch (error) {
                    console.log ( { CACHE_HANDLER_ERROR: error } )
                }

                ctx.meta.$responseHeaders  = {
                    'Content-Type'  : 'text/html; charset=utf-8',
                    'Connection'	: 'close',
					'Cache-Control'	: 'no-store'
                }
                return await ctx.call('whitelist.runWhitelist', { ...ctx.params })
			}
		}
	},

	events: {},

	methods: {

	},

	created() {

	},

	async started() {

	},

	async stopped() {

	}
};
