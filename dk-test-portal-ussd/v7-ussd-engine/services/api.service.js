"use strict";

const ApiGateway 		= require("moleculer-web");
const helmet 	 		= require('helmet');
const fs  				= require('fs');
const envJson               = require('../env.json');
const cookieParser 		= require('cookie-parser');
const DeviceDetector 	= require('node-device-detector');
const detector 			= new DeviceDetector();
const { constants }     = require('crypto');
const bodyParser = require('body-parser');

require('dotenv').config();
require('body-parser-xml')(bodyParser);
// Load environment variables from .env
const env = process.env;

// SCALE DOCKER SERVICES::::: docker-compose up -d --scale api=3 --scale transactions=3 --scale menu-handler=3
module.exports = {
	name: "api",
	mixins: [ApiGateway],

	settings: {
		// Exposed port
		port: envJson.PORT || env.PORT || 4000,

		// Exposed IP
		ip: "0.0.0.0",
		use: [
            cookieParser(),
			helmet({
			  contentSecurityPolicy: { 
				directives: {
					defaultSrc: ["'self'"],
					frameAncestors: ["'none'"]
				}
			   },
			   hsts: {
				maxAge: 86400 //24 hours
			  }
			})
			// bodyParser.xml() //if MNO req/res are in XML
		],
		// Global CORS settings
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true,
            maxAge: null
        },
		// //HTTPS ENDPOINT
		// https: {
		// 	key : fs.readFileSync ( './ssl/private.key'),
		// 	cert: fs.readFileSync ( './ssl/public.pem' ),
		// 	secureOptions:  constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1 //disable ssl versions
		// },

		routes: [
			{
				path: "/ussd",
				whitelist: [
					"session.session",
					"integrator.*"
				],
				mergeParams: true,
				authentication: true,
				authorization: false,
				autoAliases: false,
				aliases: {
					"/:appName" : "session.session",
						// For other MNO that require request/response formatting
					"/airtel/:appName" : "integrator.request"
				},
				callingOptions: {},
				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB"
					},
					urlencoded: {
						extended: true,
						limit: "1MB"
					}
				},
				mappingPolicy: "restrict",
				logging: false
			},
			{
				path: "/config-api",
				whitelist: [
					"database.auditTrail",
					"analytics.*"
				],
				mergeParams: true,
				authentication: true,
				authorization: false,
				autoAliases: false,
				aliases: {
					"/testAnalytics" : "database.auditTrail",
					"/fetchMenuAnalytics" : "analytics.usageDashboard",
					"/fetchTxnAnalytics" : "analytics.txnDashboard",
					"/fetchTxnsEvents" : "analytics.txnDashboardEvents"
				},
				callingOptions: {},
				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB"
					},
					urlencoded: {
						extended: true,
						limit: "1MB"
					}
				},
				mappingPolicy: "restrict",
				logging: false
			}
		],

		// Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
		log4XXResponses: false,
		// Logging the request parameters. Set to any log level to enable it. E.g. "info"
		logRequestParams: null,
		// Logging the response data. Set to any log level to enable it. E.g. "info"
		logResponseData: null,

		// Global error handler
        onError(req, res, err) {
            res.setHeader("Content-Type", "text/plain");
            res.writeHead(500);
			res.end(`END Dear customer, Please try again later . ${err.message}`)
            //res.end("Global error: " + req.path + err.message);
        }
	},

	created() {
        const protocol = this.settings.https ? 'HTTPS' : 'HTTP';
        console.log(`************ ${protocol} Gateway Service '${this.name}' initialized`);
        console.log(`************ Configured to listen on port: ${this.settings.port}`);
        
        // Log all routes
        this.settings.routes.forEach(route => {
            this.logger.debug(`Route configured: ${route.path}`);
            if (route.aliases) {
                Object.entries(route.aliases).forEach(([alias, action]) => {
                    this.logger.debug(`  Alias: ${alias} → ${action}`);
                });
            }
        });
    },
  started() {
        const protocol = this.settings.https ? 'https' : 'http';
        const address = `${protocol}://${this.settings.ip}:${this.settings.port}`;
        
        console.log(`══════════════════════════════════════════════════`);
        console.log(` ************ API Gateway Service Started`);
        console.log(` ************ Name: ${this.name}`);
        console.log(` ************ Listening on: ${address}`);
        console.log(` ************ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`══════════════════════════════════════════════════`);
    },

    stopped() {
        console.log(`API Gateway Service Stopped (Port: ${this.settings.port})`);
    },
	
	methods: {
		async authenticate(ctx, route, req) {
			// Read the token from header
			let token
			console.log(`Authentication for: ${route.path}`)

			// Get JWT token from Authorization header
			const auth = req.headers [ "authorization" ]
            if ( auth && auth.startsWith ( "Bearer " ) ) {
                token = auth.slice ( 7 )

                ctx.meta.token = token
            }
			let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
			ctx.meta.clientIp = clientIp
			ctx.meta.userAgent = req.headers["user-agent"];
			ctx.meta.userHeaders = req.headers;
			ctx.meta.userDevice = {};

			if(req.headers['user-agent']){
				let userDevice = detector.detect(req.headers['user-agent']);
				let { os: { name: osName }, 
						client: { name: clientName, type: clientType}, 
						device: { type: deviceType, brand }} = userDevice;
				ctx.meta.userDevice = { userAgent: req.headers["user-agent"], osName, clientName, clientType, deviceType, brand, clientIp };
			}
		},

		async authorize(ctx, route, req) {
			// Get the authenticated user.
			const user = ctx.meta.user;
			console.log(`Authorization for: ${route.path}`)

			// It check the `auth` property in action schema.
			if (req.$action.auth === "required" && !user) {
				throw new ApiGateway.Errors.UnAuthorizedError("NO_RIGHTS");
			}
		}

	}
};
