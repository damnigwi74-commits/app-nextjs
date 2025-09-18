
class Store {
    constructor(connection){
        this.connection = connection
    }
    async connect() {
		try {
			const redis = require('redis');
			
			var client = redis.createClient({
                host          : this.connection.host, 
                port          : this.connection.port,
                no_ready_check: true,
                auth_pass     : this.connection.password                                                                                                                                                          
            })
			
			let status = await new Promise ( ( resolve, reject ) => {
				client.on('connect', () => {
					// console.log("[Connected] Redis Client on port %d,",this.connection.port," host:",  this.connection.host );
					resolve ( true )					
				})				
				client.on('error',() => { 
					reject ( false )
				})
				client.on('end', () => {
					// console.log("[Terminated] Redis Client");
					reject ( false )
				})
			})
			
			if ( status ) {
				return client;
			}
			else {
				return false
			}			
		}
		catch ( e ) {
			console.log ( { REDIS_CONNECTION_ERROR: e } )
			return false;
		}
    }
    close(client) {
        client.quit();
    }
    createHash(client, id, data) {
        return new Promise((resolve, reject) => {
            client.select(this.connection.database, (err, res) => {
                if (err)
                    reject(err);
                client.set(id, data, (err, res) => {
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
                client.get(id, (err, data) => {
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
	checkIfExistsInSet ( client, setName, item ) {
        return new Promise((resolve, reject) => {
            client.select(0, (err, res) => {
                if (err)
                    reject(err);
                client.sismember(setName, item, function(err, exists) {
                    if (err) reject (err);
                    resolve ( exists )
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

module.exports = Store
