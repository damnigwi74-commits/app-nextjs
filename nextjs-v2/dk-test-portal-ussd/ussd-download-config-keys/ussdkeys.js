(async () => {
    let fs = require('fs');
    let path = require('path');
    let cache = require('./cache/cache');
	let store = new cache({
        "host"    : "10.20.2.25",
        "port"    : 6379,
        "password": "",
        "database": 0,
    });
    //const env       = require ( './env');

    console.log('Accessing cache')

    let app_name    = 'flexi-demo-ussd@0.0.1';
    let keys = [
        [app_name, 'config', 'api'].join(':'),
        [app_name, 'config', 'adapter'].join(':'),
        [app_name, 'config', 'code'].join(':'),
        [app_name, 'config', 'config'].join(':'),
        // [app_name, 'config', 'whitelist'].join(':'),
        [app_name, 'config', 'permissions'].join(':'),
        [app_name, 'config', 'language'].join(':'),
        [app_name, 'config', 'pages'].join(':'),
        [app_name, 'config', 'prompts'].join(':'),
        [app_name, 'config', 'prompts_cache'].join(':')
    ];

    let redis_data    = await store.getMany(keys);

    let api           = redis_data.api;
    let adapter       = redis_data.adapter;
    let code          = redis_data.code;
    let config        = redis_data.config;
    let language      = redis_data.language;
    let pages         = redis_data.pages;
    let prompts       = redis_data.prompts;
    let prompts_cache = redis_data.prompts_cache;
    let whitelist     = redis_data.whitelist;
    let permissions   = redis_data.permissions;


    let propmtKeys = Object.keys(prompts)
    let pageKeys = Object.keys(pages)

    console.log('Creating Folders')
    /*
    try {
        fs.mkdirSync(path.join(__dirname, app_name));
        fs.mkdirSync(path.join(__dirname, `${app_name}/config`));
        fs.mkdirSync(path.join(__dirname, `${app_name}/language`));
        fs.mkdirSync(path.join(__dirname, `${app_name}/api`));
        fs.mkdirSync(path.join(__dirname, `${app_name}/ui`));
        fs.mkdirSync(path.join(__dirname, `${app_name}/ui/prompts`));
        fs.mkdirSync(path.join(__dirname, `${app_name}/ui/pages`));
    } catch (error) {
        
    }
    */
    console.log('Creating Files')
    try {
        fs.writeFileSync(path.join(__dirname, `${app_name}`, 'api.json'), JSON.stringify(api, null, 4));
        fs.writeFileSync(path.join(__dirname, `${app_name}`, 'adapter.json'), JSON.stringify(adapter, null, 4));
        fs.writeFileSync(path.join(__dirname, `${app_name}`, 'code.json'), JSON.stringify(code, null, 4));
        fs.writeFileSync(path.join(__dirname, `${app_name}`, 'config.json'), JSON.stringify(config, null, 4));
        // fs.writeFileSync(path.join(__dirname, `${app_name}/config`, 'whitelist.json'), JSON.stringify(whitelist, null, 4));
        fs.writeFileSync(path.join(__dirname, `${app_name}`, 'permissions.json'), JSON.stringify(permissions, null, 4));
        fs.writeFileSync(path.join(__dirname, `${app_name}`, 'language.json'), JSON.stringify(language, null, 4));
        fs.writeFileSync(path.join(__dirname, `${app_name}`, 'prompts_cache.json'), JSON.stringify(prompts_cache, null, 4));
        fs.writeFileSync(path.join(__dirname, `${app_name}`, 'prompts.json'), JSON.stringify(prompts, null, 4));
        fs.writeFileSync(path.join(__dirname, `${app_name}`, 'pages.json'), JSON.stringify(pages, null, 4));
        /*
        propmtKeys.map(itemKey => {
            
            fs.writeFileSync(path.join(__dirname, `${app_name}/ui/prompts`, `${itemKey}.json`), JSON.stringify(prompts[itemKey], null, 4));
        })
        pageKeys.map(itemKey => {
            
            fs.writeFileSync(path.join(__dirname, `${app_name}/ui/pages`, `${itemKey}.json`), JSON.stringify(pages[itemKey], null, 4));
        })
         */
    } catch (error) {
        
    }
    console.log('Done')

})()