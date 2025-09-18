"use strict";
require('dotenv').config();
const redisConn = require('../env.json');
const env = process.env;
const Redis     = require('ioredis');

module.exports = {
    name: "redis_lib_mixin",

    settings: {
        environment: env.ENVIRONMENT,
        //connection: redisConn.cache[redisConn.environment]
        connection: {
            host: env.REDIS_HOST || "localhost",
            port: env.REDIS_PORT || 6379,
            database: env.REDIS_DB || 0,
            password: env.REDIS_PASSWORD 
        }
    },
    
    methods: {
        async Redis_Connect() {
            let { connection, redisParams } = this.settings
            try {
                /** Redis cluster on sentinel */

                // const client = new Redis({
                //     sentinels: [
                //       { host: "192.168.19.60", port: 26379 },
                //       { host: "192.168.19.61", port: 26379 },
                //       { host: "192.168.19.62", port: 26379 }
                //     ],
                //     name: "mymaster",
                //   });
                
                /** Single Redis Node */
                let client = new Redis({
                    host          : connection.host, 
                    port          : connection.port,
                    no_ready_check: true,
                    db            : connection.database,
                    password      : connection.password
                })
                
                if ( redisParams ) {
                    client = new Redis({
                        host          : redisParams.host, 
                        port          : redisParams.port,
                        no_ready_check: true,
                        db            : redisParams.database,
                        password      : redisParams.password
                    })
                }

                this.client = client;
                
                console.log(`REDIS CONNECTION SUCCESSFUL:::: ${connection.host}:${connection.port}`);
                
                //return client;			
            }
            catch ( e ) {
                console.log ( { REDIS_CONNECTION_ERROR: e } )
                return false;
            }
        },
        Redis_Close(client) {
            client.disconnect();
        },
        async Redis_CreateHash(id, data, keyExpiryTime) {
            let response = await this.client.hmset(id, data);

            if (keyExpiryTime) {
                await this.client.expire(id, keyExpiryTime)
            }

            return response
        },
        async Redis_ReadHash(id) {
            let allKeys = {}
            let response = await this.client.hgetall(id)
            allKeys = response
            
            return allKeys
        },
        async Redis_DeleteHash(id) {
            let deleted = await this.client.del(id);

            return deleted
        },
        async Redis_DeleteHashKey(id, key) {
            let deleted = await this.client.hdel(id, key);

            return deleted
        },
        printObjectDetails(keys, obj) {
            let data = {}
            let parsedObj = obj.map(e => {
                let keys = Object.keys(e[1])
                keys.forEach(jKey => {
                    e[1][jKey] = JSON.parse(e[1][jKey])
                })

                return e
            })
            keys.forEach((entry, id) => {
                let arr = entry.split(':');
                let index =  arr[arr.length - 1];

                data[index] = parsedObj[id][1];
            })
            
            return data
        },
        async Redis_ReadMultipleHashes(keys) {
            let allKeys = []
            var pipeline = this.client.pipeline();

            keys.forEach(function(key){
                pipeline.hgetall(key);
            });

            allKeys = await pipeline.exec((err, result) => result);
            
            allKeys = this.printObjectDetails(keys, allKeys)
            
            return allKeys
        },
        async Redis_ReadKeys(id) {
            let allKeys = {}
            let response = await this.client.keys(id)
            allKeys = response
            
            return allKeys
        },
        async Redis_CheckIfExistsInHash (hashName, fieldName) {
            let exists = await this.client.hexists(hashName, fieldName);
        
            return exists         
        },
        async Redis_CheckIfExistsInSet (setName, fieldName) {
            let exists = await this.client.hexists(setName, fieldName);
        
            return exists         
        },
        async Redis_KeyExists(id) {
            let exists = await this.client.hexists(id);
        
            return exists
        }
    },
    async started () {
        let { Redis_Connect } = this

        console.log('Starting Redis server')
        Redis_Connect()
    },
    async stopped () {
        let { Redis_Close, client } = this

        console.log('Redis connection closed')
        Redis_Close(client)
    }
}