"use strict"

const DBMixin       = require('../mixins/db.mixin')

/**
 * Database service
 * Enable Database service option: NoSQL(MongoDB)
 */

module.exports = {
    name: 'database',

    mixins: [ DBMixin ],

    actions: {
        auditTrail: {
            async handler (ctx) {
                let { payload, requestName } = ctx.params;

                let response = await this.SaveAuditTrail({ payload, requestName })

                return {
                    success: true,
                    data: response
                }
            }
        },
        txnTrail: {
            async handler (ctx) {
                let { payload, requestName } = ctx.params;

                let response = await this.SaveTxnTrail({ payload, requestName })

                return {
                    success: true,
                    data: response
                }
            }
        },
        fetchCollectionCount: {
            async handler (ctx) {
                let { collectionName, params } = ctx.params;

                let response = await this.GetCollectionCount({ collectionName, params })

                return {
                    success: true,
                    data: response
                }
            }
        },
        fetchItems: {
            async handler (ctx) {
                let { collectionName, params, options } = ctx.params;

                let response = await this.FindMany({ collectionName, params, options })

                return {
                    success: true,
                    data: response
                }
            }
        }
    }
}