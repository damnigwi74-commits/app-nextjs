"use strict";

const RedisMixin = require('./redis.mixin')

module.exports =  {
    name: "redis_cache_mixins",

    mixins: [ RedisMixin ],
    
    methods: {
        async RedisInsert(userId, data, keyExpiryTime) {
            data = this.valuesToJson(data);

            let response = await this.Redis_CreateHash(userId, data, keyExpiryTime);

            if (response === 'OK') {
                response = true;
            }else {
                response = false;
            }

            return response;
        },
        async RedisExistsInHash ( hashName, userId ) {
            let response = await this.Redis_CheckIfExistsInHash (hashName, userId);
            
            return response;
        },
        async RedisExistsInSet ( setName, userId ) {
            let response = await this.Redis_CheckIfExistsInSet (setName, userId);
            
            return response;		
        },
        async RedisGet(userId) {
            let response = await this.Redis_ReadHash(userId);
            
            return response;
        },
        async RedisGetKeys(userId) {
            let response = await this.Redis_ReadKeys(userId);
            
            return response;
        },
        async RedisGetMany(keys) {
            let response = await this.Redis_ReadMultipleHashes(keys);
            
            return response;
        },
        async RedisDelete(userId) {
            let response = await this.Redis_DeleteHash(userId);
            
            return response;
        },
        async RedisExists(userId) {
            let response = await this.Redis_KeyExists(userId);
            
            return response;
        },
        valuesToJson(data) {
            let jsonObj = {};
            try {
                let keys = Object.keys(data);
                keys.forEach(key => {
                    jsonObj[key] = JSON.stringify(data[key]);
                })
            }catch (e) {
                console.log( data, e )
            }
            return jsonObj;
        },
        valuesFromJson(data) {
            try{
                let jsonObj = {};
    
                data = data || ""
                
                let keys = Object.keys(data);
                for (let key of keys) {
                    try {
                        jsonObj[key] = JSON.parse(data[key]);
                    }
                    catch (e) {
                        jsonObj[key] = data[key];
                    }
                    
                }
                
                return jsonObj;
            }
            catch (e ){
                console.log( data, e )
                return data
            }
    
        }
    }
}