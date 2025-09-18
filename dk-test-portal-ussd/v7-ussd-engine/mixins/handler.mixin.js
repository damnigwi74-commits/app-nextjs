"use strict"

const dot           = require("dot-object")
const RedisLibMixin = require('../mixins/cache.mixin')
const UtilitiesMixin = require('../mixins/utilities.mixin')

module.exports = {
    name: "menu_handler_mixin",

    mixins: [ RedisLibMixin, UtilitiesMixin ],

    methods: {
        load(cacheId) {
            let data = {};
            let { currentStep } = this.settings.cacheData[cacheId]
            if (currentStep.includes('page')) {
                data = this.loadCurrentData(currentStep, 'page', cacheId);
                data['previousData'] = this.loadPreviousData(data, 'page', cacheId);
                data['nextData'] = this.loadNextData(data, 'page', cacheId);
            }else {
                data = this.loadCurrentData(currentStep, '', cacheId);
                data['previousData'] = this.loadPreviousData(data, '', cacheId);
                data['nextData'] = this.loadNextData(data, '', cacheId);
            }
    
            return data;
        },
        loadCurrentData(current_step_name, currentType = '', cacheId) {
            let data = false; //is either an object or false
            
            switch (currentType) {
                //The previous step of a module is either another module or disabled
                case 'page':
                    try {
                        data = this.loadPage(current_step_name, cacheId);
                    }
                    catch (e) {
                        console.log(`failed to load the page Error: ${e.message}`, e );
                    }
                    break;
                //The previous step of a component may either be another component or a module or disabled
                default:
                    try {
                        data = this.loadPrompt(current_step_name, cacheId);
                    }
                    catch (e) {
                        console.log('failed to load the prompt ( s )');
                    }
                    break;
            }
            return data;
        },
        loadPage(page_name, cacheId) {
            let data = false;
            let { pages } = this.settings.cacheData[cacheId]
            try {
                //load the page data
                let page_data = pages[page_name] || false;
                if (page_data) {
                    //add only the children that are enabled                
                    let pageOptions = page_data.options;
                    if(Array.isArray(pageOptions) && pageOptions.length > 0){
                        pageOptions = pageOptions.filter((option) => {
                            return option.enabled !== false;
                        });
                        page_data.options = pageOptions;
                    }
                    data = page_data;
                }
            }
            catch (e) {
                console.log(`failed to load page Error: ${e.message}`, e );
            }
            return data;
        },
        loadPrompt(prompt_name, cacheId ) {
            let data = false;
            let { promptsCache, userData, prompts } = this.settings.cacheData[cacheId]
            try {
                //get cache file and prompt key
                let prompts_lookup = promptsCache;
                let prompt_groups = Object.keys(prompts_lookup);
                let prompt_group_name = '';
                
                //loop through the cache items
                for (let key of prompt_groups) {
                    let prompts = prompts_lookup[key];
                    for (let p of prompts) {
                        if (p === prompt_name) {
                            prompt_group_name = key;
                            break;
                        }
                    }
                }
                //load the prompt data           
                let prompt_data = prompts[prompt_group_name];
    
                if (prompt_data instanceof Array) {
                    for (let index in prompt_data) {
                        if (prompt_data[index].name === prompt_name) {
                            data = prompt_data[index];
                        }
                    }
                }
                else {
                    data = prompt_data;
                }
                //replace with the actual child objects in case the options variable is a string reference
                let hasOptions = data.options || false;
                
                if (hasOptions && typeof hasOptions === 'string') {
                    //account for combined options
                    if ( data.options.includes ( '+') ) {
                        let eachVal = data.options.split ( '+' )
                        let combinedOptions = []
    
                        for ( let val of eachVal ) {
                            let dataOpts = dot.pick(val, userData) || dot.pick(val, userData['account-details']) || dot.pick(val, userData['global-constants']) || dot.pick(val, userData['global-request-details']) || false;
                            if ( dataOpts ) {
                                combinedOptions = [ ...combinedOptions, ...dataOpts ]
                            }
                            
                        }
                        data.options = combinedOptions
                    }
                    else {
                        //load data using a promise ( Got a bug where the name was being replaced with undefined if the data was not obtained on time )
                        data.options = dot.pick(data.options, userData) || dot.pick(data.options, userData['account-details']) || dot.pick(data.options, userData['global-constants']) || dot.pick(data.options, userData['global-request-details']) || data.options;
                    }
                }
            }
            catch (e) {
                console.log(` [ Error ] unable to load the prompt data for \`${prompt_name} - msg: ${e}`);
            }
            return data;
        },
        loadPreviousData(currentData, currentType = '', cacheId) {
            let data = false; //is either an object or false
            let canGoBack = currentData.previous || false;
            switch (currentType) {
                //The previous step of a page is either another page or disabled
                case 'page':{
                    try {
                        //hence get current Module data and use it to determine the previous module data, then load that as the final data                  
                        //let currentData = this.loadPage(current_step_name);
                        if (canGoBack) {
                            let previous = currentData.previous;
                            data = this.loadPage(previous, cacheId);
                        }
                    }
                    catch (e) {
                        console.log('failed to load the previous step of the page',e);
                    }
                }break;
                //The previous step of a prompt may either be another prompt or a page or disabled
                default:{
                    try {
                        //let currentData = this.loadPrompt(current_step_name);
                        if (canGoBack) {
                            let previous = currentData.previous;
                            //previous is a page
                            if (previous.includes('page')) {
                                data = this.loadPage(previous, cacheId);
                            }
                            //previous step is a prompt
                            else {
                                data = this.loadPrompt(previous, cacheId);
                            }
                        }
                    }
                    catch (e) {
                        console.log('failed to load previous step of the prompt',e);
                    }
                }break;
            }
            
            return data;
        },
        loadNextData(currentData, type = '', cacheId) {
            let data = false; //is either an array, an object or false
            //for a page, next step is an array of pages and/or prompt data
            if (type === 'page') {
                try {
                    //let currentData = this.loadPage(current_step_name);
                    
                    let nextOptions = currentData.options; 
                    //filter the children to get only the enabled children
                    nextOptions = nextOptions.filter((option) => {
                        if (option.enabled) {
                            return option;
                        }
                    });
                    //get the next step array
                    let nextArray = nextOptions.map((option) => {
                        let optionName = option.name;
                        let authenticate = option.authenticate || false;
                        if (authenticate) {
                            let auth = Object.assign({}, this.loadPrompt('inapp-login', cacheId));
                            if (optionName.includes('page') && option.enabled) {
                                auth.next = this.loadPage(option.name, cacheId).name;
                                return auth;
                            }
                            //load prompt data
                            if (!optionName.includes('page') && option.enabled) {
                                //load the root element of the component
                                auth.next = this.loadRootPrompt(option.name, cacheId).name;
                                return auth;
                            }
                            return auth;
                        }
                        else {
                            if (optionName.includes('page') && option.enabled) {
                                return this.loadPage(option.name, cacheId);
                            }
                            //load component element data
                            if (!optionName.includes('page') && option.enabled) {
                                //load the root element of the component
                                return this.loadRootPrompt(option.name, cacheId);
                            }
                        }
                    });
                    data = nextArray;
                }
                catch (e) {
                    console.log('failed to load the next page ' + currentData.name, e);
                }
            }
            //for a prompt, the next step is another prompt or a page or false
            else {
                try {
                    //let currentData = this.loadPrompt(current_step_name);
                    let next = currentData.next || false;
                    if (next) {
                        if (next.includes('page')) {
                            data = this.loadPage(next, cacheId);
                        }
                        else {
                            data = this.loadPrompt(next, cacheId);						
                        }
                    }
                }
                catch (e) {
                    console.log('failed to load the next prompt ( s )');
                }
            }
            return data;
        },
        loadRootPrompt(prompt_group_name, cacheId) {
            let { prompts, userData } = this.settings.cacheData[cacheId]
            //get the components Data:
            let prompt_data = prompts[prompt_group_name];
            let data = [];
            if (prompt_data instanceof Array) {
                data = prompt_data[0];
            }
            else {
                data = prompt_data;
            }
            
            //replace with the actual child objects in case the options variable is a string reference
            if (data.type === 'select' && typeof (data.options) === 'string') {
                
                if ( data.options.includes ( '+') ) {
                    let eachVal = data.options.split ( '+' )
                    
                    let combinedOptions = []
    
                    for ( let val of eachVal ) {
                        let dataOpts = dot.pick(val, userData) || dot.pick(val, userData['account-details']) || dot.pick(val, userData['global-constants']) || dot.pick(val, userData['global-request-details']) || false;
    
                        if ( dataOpts ) {
                            for ( let opt of dataOpts ) {
                                combinedOptions.push ( opt )
                            }
                        }
    
                    }
    
                    data.options = combinedOptions
                }else {
                    data.options = dot.pick(data.options, userData) || dot.pick(data.options, userData['account-details']) || dot.pick(data.options, userData['global-constants']) || dot.pick(data.options, userData['global-request-details']) || data.options;
                }
            }
            return data;
        },
        /**
         * Handling previous menu routing
         */
        async previous(data, cacheId) {
            //let { cacheId, userData } = this.settings
            //load the latest data
            // let newData                          = await this.RedisGet(cacheId)
            // userData['global-constants']         = newData['global-constants']
            let previousData                     = data.previousData || data
            
            //fetch charges if they needed to be fetched
            await this.actions.fetchCharges ({ nextMenuData: previousData, cacheId })

            //load the menu string
            if (!previousData && data['previous'].includes('page')) {						
                previousData   = this.loadPage(data['previous'], cacheId)					
            }
            if (!previousData && !data['previous'].includes('page')) {
                previousData = this.loadPrompt(data['previous'], cacheId);
            }
            let str = await this.getString(previousData, false, previousData.name || data.name, cacheId );
            return str;
        },
        /**
         * Menu String Builder Helpers
         */
        async getString(data, promptOverride = false, nextStep = '', cacheId) {
            let { currentStep, userData, language, previousCharacter, userInput }   = this.settings.cacheData[cacheId]
            if ( nextStep.trim() === '' ) {
                nextStep = currentStep
            }

            //get the prompt
            let menuPrompt = `${data.name}`

            //overriding a prompt
            if (promptOverride) {
                menuPrompt = promptOverride
            }

            let current_language = userData["language"];
            let menuString       = language[current_language][menuPrompt]

            //if it includes fetching charges
            if ( data.charges ) {
                menuString += language[current_language]['tx-charge-narration']
            }

            menuString += "\n";

            //replace handlePlaceholders
            menuString = this.replace(menuString, cacheId);
            
            //if its a select menu, add the options
            if (data.type === 'select') {
                //get the select prompt options
                let selecOptions = data.options;
                for (let index in selecOptions) {

                    if ( !isNaN( index ) ) {
                        //the options will now be keys defined in the language file
                        let optionPrompt = `${selecOptions[index].label}`;
                        let optionString = language[current_language][optionPrompt];
                        //check if it has an options template for dynamic options
                        if (data['options-template']) {
                            let optionsTemplate = data['options-template'];
                            let optionTemplateString = language[current_language][optionsTemplate];
                            optionString = optionTemplateString.replace(/@option/g, optionPrompt);
                        }
                        if (typeof (optionString) === 'undefined') {
                            optionString = optionPrompt;
                        }

                        if (typeof (optionPrompt) === 'undefined') {
                            optionString = "";
                        }
                        menuString += `${parseInt(index, 10) + 1}:${optionString}\n`;
                    }
                    else {
                        //console.log (  { options } )
                    }
                }
            }
            //add previous option on string if canGoBack is enabled                        
            let canGoBack = data.previous || false;
            if (canGoBack) {
                let previous_prompt = language[current_language]["previous"];
                menuString += `${previousCharacter}:${previous_prompt}\n`;
            }
            //if its an alert menu, ensure to tell the session to end
            if (data.type === 'alert' && !menuString.startsWith('END')) {
                menuString = `END ${menuString}`;
            }

            //home menu
            // let home_prompt = this.language [ current_language ] [ "home" ];
            // menuString +=`000:${home_prompt}\n`;
            userData['current_step'] = nextStep;
            
            //Encrypt user-data values
            let secureUserData = this.secureUserData(userData)

            await this.RedisInsert(cacheId, secureUserData);
            // console.log({ currentStep: userData['current_step'], true } )

            // let charCount = menuString.length;
            // if ( charCount > 160 ) {
            //     console.log ({ 
            //         'menu-string-length' : menuString.length,
            //         'current-step' : userData['current_step']
            //     })
            // }
            
            //Analytics goes here
            this.actions.saveAnalytics ({ menuString, cacheId, userInput, currentStep: nextStep })
            // let sliced = menuString.slice ( 160, menuString.length )
            // console.log ( `---------------------\n${menuPrompt} - length: ${menuString.length} overflow: ${menuString.length > 160 ? true : false}, overflowing text: ${sliced}\n`)
            // console.log ( `---------------------\n${menuString}\n---------------------`)

            //return the menu string
            return menuString;
        },
        replace(menuString, cacheId) {
            let { userData } = this.settings.cacheData[cacheId]
            let menuStringArray = menuString.split(' ');
            let items           = menuStringArray.filter((item) => {
                if (item.includes('@')) {
                    return item;
                }
            });
            let rgx;
            for (let item of items) {
                let formatItem   = item.replace(/[^a-zA-Z_-]/g, '');
                let searchResult = this.searchData(formatItem, cacheId);
                if (typeof searchResult !== 'undefined') {
                    let trimmedItem = `${item}`
                        .replace(/\s/g, '')
                        .replace(/ /g, '')
                        .replace(/[^@a-zA-Z_-]/g, '');
                    rgx = new RegExp(trimmedItem, 'g');
                    menuString = menuString.replace(rgx, searchResult);
                }
            }
            menuString = menuString.replace ( /__walletAccount/g, userData.msisdn )
            return menuString;
        },
        searchData(needle, cacheId) {
            let { userData:haystack } = this.settings.cacheData[cacheId]
            let searchObj = (object, key) => {
                let searchValue;
                Object.keys(object).some((k) => {
                    if (k === key) {
                        searchValue = object[k];
                        return true;
                    }
                    if (object[k] && typeof object[k] === 'object') {
                        searchValue = searchObj(object[k], key);
                        return searchValue !== undefined;
                    }
                });
                return searchValue;
            };
            let result = searchObj(haystack, needle);
            return result;
        },
        async refreshUserData(key, data) {
            //Encrypt user-data values
            await this.RedisInsert(key, this.secureUserData(data));
            let result = await this.RedisGet(key);
            result = this.retrieveUserData(result)
            return result;
        }
    }
}