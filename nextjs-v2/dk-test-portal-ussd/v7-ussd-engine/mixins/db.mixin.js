"use strict"

const { MongoClient } = require("mongodb");
require('dotenv').config();

const configFile    = require('../env');
const env    = process.env
const uri           = env.DB_CONNECTION_URI
const dbName        = env.DB_NAME

module.exports = {
	name      : "db_mixin",

	methods   : {
		async MONGO_Connect () {
            try {
                const client = new MongoClient(uri);

                this.client = await client.connect();

                this.db = client.db(dbName);

                //console.log(`MONGODB CONNECTION SUCCESSFUL:::::`);
            } catch (error) {
                console.log(error)
            }
        },

		async MONGO_Disconnect () {
            await this.client.close();
        },

        async SaveAuditTrail ({ payload }) {
            const collection = this.db.collection('audit-trail');

            let res = await collection.insertOne(payload)

            return res;
        },

        async SaveTxnTrail ({ payload }) {
            const collection = this.db.collection('transactions');

            let res = await collection.insertOne(payload)

            return res;
        },

        async GetCollectionCount ({ collectionName, params = {} }) {
            const collection = this.db.collection(collectionName);

            let res = await collection.count({ ...params })

            return res;
        },

        async FindMany ({ collectionName, params = {}, options = {} }) {
            let { limit, skip } = options
            const collection = this.db.collection(collectionName);

            let cursor = []
            let res = []

            if(limit && !skip){
                cursor = await collection.find(params).limit(limit)
            }else if(!limit && skip){
                cursor = await collection.find(params).skip(skip)
            }else if(limit && skip){
                cursor = await collection.find(params).limit(limit).skip(skip)
            }else{
                cursor = await collection.find(params)
            }
            
            for await (const doc of cursor) {
                res.push(doc);
            }

            return res;
        },

        async FindOne ({ collectionName, params = {} }) {
            const collection = this.db.collection(collectionName);

            let res = await collection.findOne({ ...params })

            return res;
        }
	},

	async started() {
        this.MONGO_Connect()
	},

	async stopped() {
        this.MONGO_Disconnect()
	}
}