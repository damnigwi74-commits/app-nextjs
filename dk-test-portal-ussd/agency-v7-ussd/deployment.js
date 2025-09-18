
( async () => {
    let api                 = require('./configs/api.json')
    let code                = require('./configs/code.json')
    let config              = require('./configs/config.json')
    let language            = require('./configs/language.json')
    let permissions         = require('./configs/permissions.json')
    let prompts             = require('./configs/prompts.json')
    let pages               = require('./configs/pages.json')
    let promptsCache        = require('./configs/prompts_cache.json')
    
    let appName     = require('./env.json').appName
    let configuration  = require('./env.json')
    let connection  = require('./env.json').cache.development
    const Redis     = require('ioredis');
    const chalk     = require('chalk');
    const moment    = require('moment');
    const figlet    = require('figlet');
    const clear     = require('clear');
    clear();
    
    if (configuration.environment == "development") {
        connection = configuration.cache.development
    }else if (configuration.environment == "staging") {
        connection = configuration.cache.staging
    }else if (configuration.environment == "production") {
        connection = configuration.cache.production
    }else {
        console.log(chalk.red("No environment found, please check your env.json file."))
        return false
    }
    
    let ussdText =  (                            
        figlet.textSync(
            `USSD`,
            `isometric3`
        )
    );

    console.log('Set initial configs script is running')
    console.log ( '\n\n',chalk.bold.white (ussdText) );
    console.log ( `\n\nEclectics International ltd. All rights reserved.`)
    console.log ( "+----------------------------------------------------+\n" )
    console.log ( chalk.green ( " USSD Dev Tool v7"     ) )
    console.log ( chalk.bold ( " [ Timestamp ]"     ) )
    console.log ( moment().format(" h:mm A : dddd DD MMM, Y"))
    console.log ( "\n+----------------------------------------------------+" )
    console.log ( chalk.green ( " REDIS CONNECTION"     ) )
    console.log(` REDIS HOST: ${chalk.green(`${connection.host}`)}`)
    console.log(` REDIS PORT: ${chalk.green(`${connection.port}`)}`)
    console.log(` REDIS DB  : ${chalk.green(`${connection.database}`)}`)
    console.log(` REDIS PASS: ${chalk.green(`${connection.password ? '*'.repeat(connection.password.length) : ''}`)}`)
    console.log ( "\n+----------------------------------------------------+" )

    var client = new Redis({
        host          : connection.host, 
        port          : connection.port,
        no_ready_check: true,
        db            : connection.database,
        password      : connection.password                                                                                                                                                          
    })
    
    let valuesToJson = (data)=> {
        let jsonObj = {};
        try {
            let keys = Object.keys(data);
            for (let key of keys) {
                jsonObj[key] = JSON.stringify(data[key]);
            }
        }
        catch (e) {
        }
        return jsonObj;
    }
    let [ setApi, setCode, setConfig, setlanguage, sepermissions, setprompts, setpages, setpromptsCache ] = await Promise.all([
        client.hmset(`${appName}:config:api`, valuesToJson(api)), 
        client.hmset(`${appName}:config:code`, valuesToJson(code)), 
        client.hmset(`${appName}:config:config`, valuesToJson(config)), 
        client.hmset(`${appName}:config:language`, valuesToJson(language)), 
        client.hmset(`${appName}:config:permissions`, valuesToJson(permissions)), 
        client.hmset(`${appName}:config:prompts`, valuesToJson(prompts)), 
        client.hmset(`${appName}:config:pages`, valuesToJson(pages)), 
        client.hmset(`${appName}:config:prompts_cache`, valuesToJson(promptsCache))
    ])

    console.log ( `\n${chalk.yellow(`(+)`)} APP NAME :  ${ configuration.appName }` )
    console.log ( "\n+----------------------------------------------------+" )


    console.log ( `\n\n ${chalk.yellow(`(+)`)} save:api : ${ chalk.green ( setApi ) }` )
    console.log ( ` ${chalk.yellow(`(+)`)} save:code : ${ chalk.green ( setCode ) }` )
    console.log ( ` ${chalk.yellow(`(+)`)} save:config : ${ chalk.green ( setConfig ) }` )
    console.log ( ` ${chalk.yellow(`(+)`)} save:language : ${ chalk.green ( setlanguage ) }` )
    console.log ( ` ${chalk.yellow(`(+)`)} save:permissions : ${ chalk.green ( sepermissions ) }` )
    console.log ( ` ${chalk.yellow(`(+)`)} save:prompts : ${ chalk.green ( setprompts ) }` )
    console.log ( ` ${chalk.yellow(`(+)`)} save:pages : ${ chalk.green ( setpages ) }` )
    console.log ( ` ${chalk.yellow(`(+)`)} save:prompts_cache : ${ chalk.green ( setpromptsCache ) }` )

    client.disconnect();
    return true
})()


/*

"show-if"       : {
			"param"          : "fundsTransferDebitAccount",
			"is-not-equal-to": "fundsTransferCreditAccount",
			"on-error"       : "ft-same-account-error"
		},

*/