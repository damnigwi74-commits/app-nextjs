"use strict";
//require environment
// require('dotenv').config();
require('dotenv').config({ 
	path: require ('path').resolve( __dirname , '..','deploymenttool.env')
})
/**
 * Redis CRUD class
 * @author: JMbuguah
 * Date: 14-06-2017:1226hrs
 * @description: Class that performs Redis Crud operations
 */
class Store {
    constructor() {
        this.env = {};
        this.connection = {};
        this.env = {
            "development": {
                "host": process.env.CACHE_DEVELOPMENT_HOST,
                "port": process.env.CACHE_DEVELOPMENT_PORT,
                "database": process.env.CACHE_DEVELOPMENT_DATABASE,
                "password": process.env.CACHE_DEVELOPMENT_PASSWORD
            },
            "staging": {
                "host": process.env.CACHE_STAGING_HOST,
                "port": process.env.CACHE_STAGING_PORT,
                "database": process.env.CACHE_STAGING_DATABASE,
                "password": process.env.CACHE_STAGING_PASSWORD
            },
            "production": {
                "host": process.env.CACHE_PRODUCTION_HOST,
                "port": process.env.CACHE_PRODUCTION_PORT,
                "database": process.env.CACHE_PRODUCTION_DATABASE,
                "password": process.env.CACHE_PRODUCTION_PASSWORD
            }
        };
         
        switch (process.env.CACHE_ENVIRONMENT) {
            case 'development':
                this.connection = this.env.development;
                console.log(`DEVELOPMENT CACHE_ENVIRONMENT is ${this.connection.host}`);
                break;
            case 'staging':
                this.connection = this.env.staging;
                console.log(`STAGING CACHE_ENVIRONMENT is ${this.connection.host}`);
                break;
            case 'production':
                this.connection = this.env.production;
                console.log(`PRODUCTION CACHE_ENVIRONMENT is ${this.connection.host}`);
                break;
		}
    }
    connect() {
        const redis = require('redis');
			var client = redis.createClient({
                host          : this.connection.host, 
                port          : this.connection.port,
                no_ready_check: true,
                auth_pass     : this.connection.password                                                                                                                                                          
            });
        client.on('connect', () => {
            // console.log("[Connected] Redis Client on port %d,",this.connection.port," host:",  this.connection.host );
        });
        client.on('end', () => {
            // console.log("[Terminated] Redis Client");
        });
        return client;
    }
    close(client) {
        client.quit();
    }
    createHash(client, id, data) {
        return new Promise((resolve, reject) => {
            client.select(this.connection.database, (err, res) => {
                if (err)
                    reject(err);
                client.hmset(id, data, (err, res) => {
                    if (err)
                        reject(err);
                    return resolve(res);
                });
            });
        });
    }
    readHash(client, id) {
        return new Promise((resolve, reject) => {
            client.select(this.connection.database, (err, res) => {
                if (err)
                    reject(err);
                client.hgetall(id, (err, data) => {
                    if (err)
                        reject(err);
                    return resolve(data);
                });
            });
        });
    }
    deleteHash(client, id) {
        return new Promise((resolve, reject) => {
            client.select(this.connection.database, (err, res) => {
                if (err)
                    reject(err);
                client.del(id, (err, res) => {
                    if (err)
                        reject(err);
                    resolve(res);
                });
            });
        });
    }
    readMultipleHashes(client, keys) {
        return new Promise((resolve, reject) => {
            client.select(this.connection.database, (err, res) => {
                if (err)
                    reject(err);
                client = client.multi({ pipeline: false });
                keys.forEach((key, index) => {
                    client = client.hgetall(key);
                });
                client.exec((err, res) => {
                    if (err)
                        reject(err);
                    return resolve(res);
                });
            });
        });
    }
    keyExists(client, id) {
        return new Promise((resolve, reject) => {
            client.select(this.connection.database, (err, res) => {
                if (err)
                    reject(err);
                client.exists(id, function (err, reply) {
                    if (reply === 1) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                });
            });
        });
    }
}
//export the Redis Class
module.exports = Store;
