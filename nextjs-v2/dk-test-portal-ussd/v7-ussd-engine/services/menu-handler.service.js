"use strict"

const dot = require('dot-object')
const deepmerge = require('deepmerge')
const HandlerMixin = require('../mixins/handler.mixin')
const ValidateMixin = require('../mixins/validators.mixins')
const TransformMixin = require('../mixins/formatters.mixins')

module.exports = {
    name: "menu-handler",

    settings: {
        previousCharacter: '00',
        skipCharacter: 's',
        allActions: ["update-parameters", "transact", "update-local"],
        inputIsValid: false,
        failedValidationIndex: false,
        overrideNextData: false,
        overridemenu: false,
        appName: '',
        cacheId: '',
        cacheData: {},
        userData: {},
        imsi: '',
        userInput: '',
        currentStep: '',
        api: {},
        code: {},
        appConfig: {},
        language: [],
        pages: [],
        propmts: [],
        promptsCache: [],
        chargeObj: {},
        data: {},
        next: '',
        nextMenuData: {}
    },

    mixins: [HandlerMixin, ValidateMixin, TransformMixin],

    actions: {
        loadMenu: {
            async handler(ctx) {
                let { applicationData, imsi, user_data, appEnv, userInput, cacheId } = ctx.params

                //Set cache data as user data
                this.settings.cacheData[cacheId] = {
                    previousCharacter: '00',
                    homeCharacter: '000',
                    skipCharacter: 's',
                    allActions: ["update-parameters", "transact", "update-local"],
                    inputIsValid: false,
                    failedValidationIndex: false,
                    overrideNextData: false,
                    overridemenu: false,
                    appName: '',
                    cacheId: '',
                    cacheData: {},
                    userData: {},
                    imsi: '',
                    userInput: '',
                    currentStep: '',
                    api: {},
                    code: {},
                    appConfig: {},
                    language: [],
                    pages: [],
                    propmts: [],
                    promptsCache: [],
                    chargeObj: {},
                    data: {},
                    next: '',
                    nextMenuData: {}
                }

                //load user data
                this.settings.cacheData[cacheId].imsi = imsi;
                this.settings.cacheData[cacheId].userData = user_data;
                this.settings.cacheData[cacheId].appEnv = appEnv;
                this.settings.cacheData[cacheId].userInput = userInput;

                this.settings.cacheData[cacheId].currentStep = user_data["current_step"];

                //load app data
                this.settings.cacheData[cacheId].api = applicationData.api;
                this.settings.cacheData[cacheId].code = applicationData.code;
                this.settings.cacheData[cacheId].appConfig = applicationData.config;
                this.settings.cacheData[cacheId].language = applicationData.language;
                this.settings.cacheData[cacheId].pages = applicationData.pages;
                this.settings.cacheData[cacheId].prompts = applicationData.prompts;
                this.settings.cacheData[cacheId].promptsCache = applicationData.promptsCache;
                this.settings.cacheData[cacheId].cacheId = cacheId;
                this.settings.cacheData[cacheId].chargesField = this.settings.cacheData[cacheId].appConfig['chargesField'] || 'chargeAmount'
                this.settings.cacheData[cacheId].exciseDutyField = this.settings.cacheData[cacheId].appConfig['exciseDutyField'] || 'exciseDutyAmount'

                //inject the global meta data into the users data
                this.settings.cacheData[cacheId].userData = deepmerge.all([
                    this.settings.cacheData[cacheId].userData,
                    this.settings.cacheData[cacheId].appConfig['meta-data']
                ])
                if (!this.settings.cacheData[cacheId].userData['global-constants']) {
                    this.settings.cacheData[cacheId].userData['global-constants'] = this.settings.cacheData[cacheId].appConfig['global-constants']
                }
                if (!this.settings.cacheData[cacheId].userData['global-request-details']) {
                    this.settings.cacheData[cacheId].userData['global-request-details'] = {}
                }

                this.settings.cacheData[cacheId].appName = this.settings.cacheData[cacheId].userData["app-name"];


                //load all keys in the language file
                let langKeys = Object.keys(this.settings.cacheData[cacheId].language);
                let newLanguageFile = {
                    'english': {},
                    'swahili': {},
                    'french': {}
                };
                let languages = Object.keys(newLanguageFile);
                for (let language of languages) {
                    for (let langKey of langKeys) {
                        newLanguageFile[language] = Object.assign({}, newLanguageFile[language], this.settings.cacheData[cacheId].language[langKey][language]);
                    }
                }
                this.settings.cacheData[cacheId].language = newLanguageFile;

                //On First Request Set Start Menu
                if (this.settings.cacheData[cacheId].userInput.trim() === '') {
                    this.getInitialMenu(cacheId);
                }

                this.settings.cacheData[cacheId].data = this.load(cacheId)
                //Handle Menu 		
                const str = await this.route(this.settings.cacheData[cacheId].data, userInput, cacheId);

                this.settings.cacheData.cacheId = ''
                delete this.settings.cacheData.cacheId

                return str
            }
        },
        fetchCharges: {
            async handler(ctx) {
                let { cacheId, nextMenuData } = ctx.params
                let { imsi, api, chargesField, exciseDutyField, userData, code, appConfig } = this.settings.cacheData[cacheId]

                //check if the fetch charges flag is enabled
                let fetchCharges = nextMenuData.charges || false
                let confirmExists = nextMenuData.name || false
                let nextIsConfirm = false
                if (confirmExists && nextMenuData.name.includes('confirm')) {
                    nextIsConfirm = true
                }
                let obj = {
                    txcharge: 0,
                    txduty: 0
                }

                //check if the next menu contains the word confirm
                if (fetchCharges && nextIsConfirm) {
                    console.log('[INFO] Fetching charges...')
                    //route
                    let route = `${nextMenuData["external-fetch"].route}-charges`

                    //formulate our request
                    let payload = {
                        "walletAccount": userData["msisdn"],
                        "mwallet": userData["mwallet"],
                        imsi,
                        ...userData['account-details'],
                        ...userData['global-request-details']
                    }

                    //fetch data from the API
                    let apiResult = await ctx.call('transactions.request', {
                        api, //api configuration settings: JSON
                        apiRoute: route,
                        payload,
                        code,
                        appConfig
                    });

                    //on-success, persist charges data
                    if (apiResult.success) {
                        if (chargesField.includes('+')) {
                            let charges = chargesField.split('+')
                            let multipleCharges = 0
                            charges.forEach(e => {
                                multipleCharges += Number(dot.pick(e.trim(), apiResult.data) || 0)
                            })
                            this.settings.cacheData[cacheId].userData['global-request-details']['txcharge'] = multipleCharges
                        } else {
                            this.settings.cacheData[cacheId].userData['global-request-details']['txcharge'] = dot.pick(chargesField, apiResult.data) || 0
                        }
                        if (exciseDutyField.includes('+')) {
                            let excDuty = exciseDutyField.split('+')
                            let multipleCharges = 0
                            excDuty.forEach(e => {
                                multipleCharges += Number(dot.pick(e.trim(), apiResult.data) || 0)
                            })
                            this.settings.cacheData[cacheId].userData['global-request-details']['txduty'] = multipleCharges
                        } else {
                            this.settings.cacheData[cacheId].userData['global-request-details']['txduty'] = dot.pick(exciseDutyField, apiResult.data) || 0
                        }
                        obj = {
                            txcharge: this.settings.cacheData[cacheId].userData['global-request-details']['txcharge'],
                            txduty: this.settings.cacheData[cacheId].userData['global-request-details']['txduty']
                        }
                    } else {
                        this.settings.cacheData[cacheId].userData['global-request-details']['txcharge'] = 0
                        this.settings.cacheData[cacheId].userData['global-request-details']['txduty'] = 0
                    }
                    // this.RedisInsert(cacheId, userData);
                }

                return obj
            }
        },
        inputMenu: {
            async handler(ctx) {
                let { cacheId } = ctx.params
                let { data, userInput, appConfig, userData, code, allActions, skipCharacter, overridemenu } = this.settings.cacheData[cacheId];

                let str = ''

                //initialize our variables
                let authenticate_transactions = appConfig["authenticate-transactions"] || false
                let tx_auth_menu = data.name === "transaction-login" ? true : false

                //Run validations array
                let { inputIsValid, failedValidationIndex } = await ctx.call('validator.validate', { data, userInput, userData, appConfig, code });
                this.settings.cacheData[cacheId].inputIsValid = inputIsValid
                this.settings.cacheData[cacheId].failedValidationIndex = failedValidationIndex

                //authenticate the input and process if valid
                if (tx_auth_menu && authenticate_transactions) {
                    //save the entry as the PIN - this is in the case for external authentication
                    if (data['format-as']) {
                        userInput = await this.formatt(data['format-as'], userInput, false, cacheId);
                    }
                    if (data['save-as']) {
                        this.settings.cacheData[cacheId].userData['global-request-details'][data['save-as']] = userInput;
                    }
                    //Run validations array
                    let { inputIsValid } = await ctx.call('validator.validate', { data, userInput, userData, appConfig, code });
                    this.settings.cacheData[cacheId].inputIsValid = inputIsValid

                    await this.transactionAuthentication(cacheId)
                    console.log('handled transaction auth')
                    console.log({ next: this.settings.cacheData[cacheId].next })
                }
                //search input
                else if (data.action && data.action === 'search') {
                    await this.handleSearch(cacheId)
                }
                //external fetch input ( presentments, login, etc )
                else if (data.action && allActions.includes(data.action)) {
                    if (inputIsValid && data.action === 'update-parameters' || data.action === 'transact') {
                        if (data['format-as']) {
                            userInput = await this.formatt(data['format-as'], userInput, false, cacheId);
                        }
                        if (data['save-as']) {
                            this.settings.cacheData[cacheId].userData['global-request-details'][data['save-as']] = userInput;
                        }
                        this.settings.cacheData[cacheId].overrideNextData = false
                        this.settings.cacheData[cacheId].overridemenu = false

                        await this.actions.externalFetch({ cacheId })
                        await this.handleInvalidSelect(cacheId)
                        await this.handleShowIf(cacheId)
                        //await this.perform_analytics      ()
                    } else if (!inputIsValid) {
                        this.showInputError(cacheId)
                    }
                }
                //normal input
                else {
                    let skipEntry = data.skip || false
                    if (inputIsValid || userInput.trim().toLowerCase() === skipCharacter && skipEntry) {

                        if (userInput.trim().toLowerCase() === skipCharacter) { this.settings.cacheData[cacheId].userInput = '' }

                        this.settings.cacheData[cacheId].next = data.next
                        this.settings.cacheData[cacheId].overrideNextData = false
                        this.settings.cacheData[cacheId].overridemenu = false

                        if (data['format-as']) {
                            userInput = await this.formatt(data['format-as'], userInput, false, cacheId);
                        }
                        if (data['save-as']) {
                            this.settings.cacheData[cacheId].userData['global-request-details'][data['save-as']] = userInput;
                        }

                        //handling in app authentication by reloading data on valid input
                        if (data.name === 'inapp-login') {
                            //refetch the next step data
                            this.settings.cacheData[cacheId].next = userData['inapp-auth-menu'];
                            if (this.settings.cacheData[cacheId].next.includes('page')) {
                                data.nextData = this.loadPage(this.settings.cacheData[cacheId].next, cacheId);
                            } else {
                                data.nextData = this.loadPrompt(this.settings.cacheData[cacheId].next, cacheId);
                            }
                        }
                        this.handleInvalidSelect(cacheId)
                        this.handleShowIf(cacheId)

                        //for internal fetches, e.g internal login validation, we will fetch new data
                        //on-success: perform success handling if allowed
                        let internal_fetch_enabled = data['internal-fetch']
                        if (internal_fetch_enabled) {
                            this.handleInternalFetchSuccess(cacheId)
                        }
                    }
                    else {
                        this.showInputError(cacheId)
                    }
                }
                //get the string
                //load new Data

                let nextData = this.settings.cacheData[cacheId].overrideNextData

                if (!nextData && this.settings.cacheData[cacheId].next.includes('page')) {
                    nextData = this.loadPage(this.settings.cacheData[cacheId].next, cacheId);
                } else if (!nextData && !this.settings.cacheData[cacheId].next.includes('page')) {
                    nextData = this.loadPrompt(this.settings.cacheData[cacheId].next, cacheId);
                }

                //charges
                await this.actions.fetchCharges({ nextMenuData: nextData, cacheId })

                //skip menu
                if (nextData.type === 'skip') {
                    this.settings.cacheData[cacheId].data = nextData
                    str = await this.actions.skipMenu({ cacheId })
                } else {
                    str = await this.getString(nextData, this.settings.cacheData[cacheId].overridemenu, this.settings.cacheData[cacheId].next, cacheId);
                }

                return str
            }
        },
        selectMenu: {
            async handler(ctx) {
                let { cacheId } = ctx.params
                let { data, userInput, appConfig, userData, overridemenu } = this.settings.cacheData[cacheId];

                let dataOptions = data.options;
                let saveAs = data['save-as'] || false;
                let str = '';
                let selectAction = data.action;

                if (userInput > 0 && userInput <= dataOptions.length) {
                    let option = dataOptions[userInput - 1];
                    let nextData = '';

                    //Handle Page
                    if (data.nextData instanceof Array && data.nextData.length > 0) {
                        let optionIndex = userInput - 1;
                        nextData = data.nextData[optionIndex];
                        this.settings.cacheData[cacheId].next = data.nextData[optionIndex].name;

                        //persist the menu chosen incase of the inapp_login_prompt
                        if (nextData.name === 'inapp-login') {
                            this.settings.cacheData[cacheId].userData['inapp-auth-menu'] = nextData.next;
                        }
                        if (nextData.type === 'select' && nextData.options && nextData.options.length === 0) {
                            // console.log("next data is a select and is missing its options");
                            this.settings.cacheData[cacheId].next = nextData['options-error'];
                            //load new Data
                            // if (next.includes('page')) {
                            //     nextData = this.loadPage(next);
                            // }
                            // else {
                            //     nextData = this.loadPrompt(next);
                            // }
                        }
                        if (nextData.type === 'select' && typeof (nextData.options) === 'string') {
                            let nextOptions = userData['account-details'][nextData.options] || userData['global-constants'][nextData.options] || userData['global-request-details'][nextData.options];
                            if (!nextOptions || nextOptions.length === 0) {
                                this.settings.cacheData[cacheId].next = nextData['options-error'];
                            }
                        }
                        if (nextData['show-if'] || false) {
                            let paramValue = dot.pick(nextData['show-if']['param'], userData)
                            let validatesTo = nextData['show-if']['validates-to'] || false
                            let isNotEqualTo = nextData['show-if']['is-not-equal-to'] || false
                            let paramMatches = nextData['show-if']['matches'] || false
                            let validationName = nextData['show-if']['validates-to'];

                            if (validatesTo) {
                                let { isValid } = await this.validationRules(paramValue, validationName, { userData });

                                if (!isValid) {
                                    this.settings.cacheData[cacheId].next = nextData['show-if']['on-error'];
                                }
                            }

                            if (isNotEqualTo) {
                                let param1 = dot.pick(nextData['show-if']['param'], userData['global-request-details']) || nextData['show-if']['param']
                                let param2 = dot.pick(nextData['show-if']['is-not-equal-to'], userData['global-request-details']) || nextData['show-if']['is-not-equal-to']

                                let validate = param1 !== param2

                                if (!validate) {
                                    this.settings.cacheData[cacheId].next = nextData['show-if']['on-error'];
                                }
                            }

                            if (paramMatches) {
                                let param1 = dot.pick(nextData['show-if']['param'], userData['global-request-details']) || nextData['show-if']['param']
                                let param2 = dot.pick(nextData['show-if']['matches'], userData['global-request-details']) || nextData['show-if']['matches']

                                if (param1 === param2) {
                                    this.settings.cacheData[cacheId].next = nextData['show-if']['on-error'];
                                }
                            }
                        }


                    } else {
                        if (selectAction !== 'update-parameters') {
                            this.settings.cacheData[cacheId].next = data.next;
                            await this.handleInvalidSelect(cacheId)
                            //handle show if
                            await this.handleShowIf(cacheId)
                        }
                    }

                    if (saveAs === false) {
                        //means that the select is purely for navigation purposes, we can use this to track user choices
                        if (typeof option.name !== 'undefined') {
                            if (!option.name.includes('page')) {
                                // console.log(`[Analytics] user has accessed the ${option.name}`);
                            }
                            else {
                                // console.log(`[Analytics] user has accessed the ${option.name}`);
                            }
                        }
                    } else {
                        if (data['format-as']) {
                            option.value = await this.formatt(data['format-as'], option.value, false, cacheId);
                        }
                        this.settings.cacheData[cacheId].userData['global-request-details'][saveAs] = option.value;

                        //play with transforms

                        /** 
                         * "option-value-transform": {
                            "name"                 : "dateRange",
                            "type"                 : "moment"
                        },
                        */
                        if (option["option-value-transform"] || false) {
                            let transformName = option["option-value-transform"].name
                            let format = option["option-value-transform"].format

                            let transformed = await this.formatt(transformName, option.value, format, cacheId);

                            //TODO: save transformed to the global request details for now
                            let keys = Object.keys(transformed)

                            for (let key of keys) {
                                this.settings.cacheData[cacheId].userData['global-request-details'][key] = transformed[key];
                            }
                        }
                        //----------- HANDLE META SAVING -----------
                        // {
                        // 	"label": "GBP~0021002001078",
                        // 	"value": "GBP~0021002001078",
                        // 	"meta": [
                        // 		{
                        // 			"save-as": "working-currency",
                        // 			"value": "GBP~0021002001078",
                        // 			"cache-path": "global-request-details",
                        // 			"format-as": "currency-code"
                        // 		}
                        // 	]

                        // }

                        let meta = option['meta'];
                        if (meta && meta instanceof Array) {
                            let ignoreMeta = data["ignore-meta"];
                            for (let item of meta) {
                                let itemValue = item.value
                                let formatAs = item['format-as']
                                let saveAs = item['save-as']
                                let cachePath = item['cache-path']

                                //format
                                if (formatAs) {
                                    itemValue = await this.formatt(formatAs, itemValue, '', cacheId);
                                }

                                //save
                                if (ignoreMeta && !ignoreMeta.includes(saveAs)) {
                                    this.settings.cacheData[cacheId].userData[cachePath][saveAs] = itemValue
                                }

                                if (!ignoreMeta) {
                                    this.settings.cacheData[cacheId].userData[cachePath][saveAs] = itemValue
                                }
                            }
                        }
                    }
                    //load other menu if jump-to-menu is enabled
                    let jumpToMenu = option["jump-to"];
                    if (jumpToMenu) {
                        this.settings.cacheData[cacheId].next = jumpToMenu;
                        //load new Data
                        if (jumpToMenu.includes('page')) {
                            nextData = this.loadPage(jumpToMenu, cacheId);
                        }
                        else {
                            nextData = this.loadPrompt(jumpToMenu, cacheId);
                        }
                        if (nextData.type === 'select' && nextData.options.length === 0) {
                            this.settings.cacheData[cacheId].next = nextData['options-error'];
                        }

                        //handle show if
                        if (nextData['show-if'] || false) {
                            let paramValue = dot.pick(nextData['show-if']['param'], userData)
                            let validatesTo = nextData['show-if']['validates-to'] || false
                            let isNotEqualTo = nextData['show-if']['is-not-equal-to'] || false
                            let paramMatches = nextData['show-if']['matches'] || false
                            let validationName = nextData['show-if']['validates-to'];

                            if (validatesTo) {
                                let { isValid } = await this.validationRules(paramValue, validationName, { userData });

                                if (!isValid) {
                                    this.settings.cacheData[cacheId].next = nextData['show-if']['on-error'];
                                }
                            }

                            if (isNotEqualTo) {
                                let param1 = dot.pick(nextData['show-if']['param'], userData['global-request-details']) || nextData['show-if']['param']
                                let param2 = dot.pick(nextData['show-if']['is-not-equal-to'], userData['global-request-details']) || nextData['show-if']['is-not-equal-to']

                                let validate = param1 !== param2

                                if (!validate) {
                                    this.settings.cacheData[cacheId].next = nextData['show-if']['on-error'];
                                }
                            }

                            if (paramMatches) {
                                let param1 = dot.pick(nextData['show-if']['param'], userData['global-request-details']) || nextData['show-if']['param']
                                let param2 = dot.pick(nextData['show-if']['matches'], userData['global-request-details']) || nextData['show-if']['matches']

                                if (param1 === param2) {
                                    this.settings.cacheData[cacheId].next = nextData['show-if']['on-error'];
                                }
                            }
                        }
                    }

                    /**Handle select actions
                     *call API directly on update-paramaters
                     * transact to check user-input
                     */
                    switch (selectAction) {
                        case "update-parameters":
                            await this.actions.externalFetch({ cacheId })
                            await this.handleInvalidSelect(cacheId)
                            await this.handleShowIf(cacheId)
                            break;
                        case "transact":
                            switch (userInput) {
                                case '1':
                                    //check for inapp authentication
                                    let authenticate_transactions = appConfig["authenticate-transactions"]
                                    let authenticate_menu = data["authenticate"]

                                    //console.log ( { authenticate_menu } )
                                    if (authenticate_transactions && typeof authenticate_menu === 'undefined' || authenticate_transactions && authenticate_menu) {
                                        this.settings.cacheData[cacheId].userData["transaction-authenticate-next"] = data.name
                                        this.settings.cacheData[cacheId].userData["transaction-authenticate-fetch"] = data['external-fetch']
                                        this.settings.cacheData[cacheId].userData["transaction-authenticate-previous"] = data.previous

                                        //load the transaction login prompt
                                        this.settings.cacheData[cacheId].next = "transaction-login"

                                        // if (next.includes('page')) {
                                        //     nextData = this.loadPage(next);
                                        // }
                                        // else {
                                        //     nextData = this.loadPrompt(next);
                                        // }
                                    } else {
                                        await this.actions.externalFetch({ cacheId })
                                    }
                                    break;

                                default:
                                    this.settings.cacheData[cacheId].next = data['on-cancel'] || false;
                                    break;
                            }
                            break;

                        case "navigate":
                            if (userInput === '1') {
                                this.settings.cacheData[cacheId].next = data['on-accept'];
                            } else {
                                this.settings.cacheData[cacheId].next = data['on-cancel'];
                            }
                            if (this.settings.cacheData[cacheId].next.includes('logout')) {
                                // console.log(`[ Analytics ] user has logged out`);
                            }
                            break;

                        case "update-local":
                            if (userInput !== '2') {
                                let localPath = data['local-path'].replace(/\s/g, '') || false;
                                /**
                                 * IMPORTANT! local path has been set to only be two levels deep at maximum
                                 * hence data to be set should either be at the root level or on the first
                                 * nested level
                                 * e.g
                                 * LEVEL 1: language=value OR
                                 * LEVEL 2: account-details>language=value
                                 */
                                if (localPath) {
                                    let localPathArray = localPath.split('=');
                                    let path = localPathArray[0];
                                    let valueKey = localPathArray[1];
                                    let pathParts = [];
                                    let itemValue = userData['global-request-details'][valueKey];
                                    if (path.includes('>')) {
                                        pathParts = path.split('>');
                                        pathParts = pathParts.filter((p) => {
                                            return p !== '';
                                        });
                                        //update the path with the new value
                                        dot.str(pathParts.join('.'), itemValue, this.settings.cacheData[cacheId].userData);
                                    } else {
                                        this.settings.cacheData[cacheId].userData[path] = itemValue;
                                    }
                                    this.settings.cacheData[cacheId].userData = await this.refreshUserData(cacheId, this.settings.cacheData[cacheId].userData);
                                } else {
                                }
                            }
                            break;
                        default:
                            break;
                    }

                    //Handle show if
                    await this.handleShowIf(cacheId)

                    nextData = this.settings.cacheData[cacheId].overrideNextData

                    console.log( `next Data ${JSON.stringify(nextData,null,2)}`)

                    if (!nextData && this.settings.cacheData[cacheId].next.includes('page')) {
                        console.log()
                        nextData = this.loadPage(this.settings.cacheData[cacheId].next, cacheId);
                    } else if (!nextData && !this.settings.cacheData[cacheId].next.includes('page')) {
                        nextData = this.loadPrompt(this.settings.cacheData[cacheId].next, cacheId);
                    }

                    //charges
                    await this.actions.fetchCharges({ nextMenuData: nextData, cacheId })

                    //skip menu
                    if (nextData.type === 'skip') {
                        this.settings.cacheData[cacheId].data = nextData
                        str = await this.actions.skipMenu({ cacheId })
                    } else {
                        str = await this.getString(nextData, overridemenu, this.settings.cacheData[cacheId].next, cacheId);
                    }

                } else {
                    //charges
                    await this.actions.fetchCharges({ nextMenuData: data.nextData, cacheId })
                    str = await this.getString(data, data.error, '', cacheId);
                }

                return str;
            }
        },
        skipMenu: {
            async handler(ctx) {
                let { cacheId } = ctx.params
                let { overrideNextData, overridemenu } = this.settings.cacheData[cacheId]
                await this.actions.externalFetch({ cacheId })
                await this.handleInvalidSelect(cacheId)
                await this.handleShowIf(cacheId)

                let nextData = overrideNextData
                if (!nextData && this.settings.cacheData[cacheId].next.includes('page')) {
                    nextData = this.loadPage(this.settings.cacheData[cacheId].next, cacheId);
                }
                else if (!nextData && !this.settings.cacheData[cacheId].next.includes('page')) {
                    nextData = this.loadPrompt(this.settings.cacheData[cacheId].next, cacheId);
                }
                let str = await this.getString(nextData, overridemenu, this.settings.cacheData[cacheId].next, cacheId);

                if (nextData && nextData.type === 'skip') {
                    this.settings.cacheData[cacheId].data = nextData
                    str = await this.actions.skipMenu({ cacheId })
                }

                return str
            }
        },
        sendRequest: {
            async handler(ctx) {
                let { cacheId, requestPath, requestData = {} } = ctx.params
                let { userData, api, imsi, code, appConfig } = this.settings.cacheData[cacheId];

                let payload = {
                    "walletAccount": userData["msisdn"],
                    "mwallet": userData["mwallet"],
                    imsi,
                    ...userData['account-details'],
                    ...userData['global-request-details'],
                    ...requestData
                }

                let apiResult = await ctx.call('transactions.request', {
                    api, //api configuration settings: JSON
                    apiRoute: requestPath,
                    payload,
                    code,
                    appConfig
                });

                return apiResult;
            }
        },
        externalFetch: {
            async handler(ctx) {
                let { cacheId, txnAuthStep } = ctx.params
                let { data, userData, api, imsi, code, appConfig } = this.settings.cacheData[cacheId];

                let requestDetails = {}
                if (txnAuthStep) {
                    requestDetails = userData['transaction-authenticate-fetch']
                } else {
                    requestDetails = data['external-fetch']
                }

                let route = requestDetails.route;
                //let format          = requestDetails['format-as'];
                //let cache           = requestDetails.cache;
                let cache_path = requestDetails['cache-path'];
                let cache_params = requestDetails["cache-parameters"];
                let params_check = requestDetails["parameter-checks"];
                let success_handler = requestDetails["success-handler"];
                let error_handler = requestDetails["error-handler"];
                let prompts = [
                    requestDetails.success,
                    requestDetails.error
                ]

                let payload = {
                    "walletAccount": userData["msisdn"],
                    "mwallet": userData["mwallet"],
                    imsi,
                    ...userData['account-details'],
                    ...userData['global-request-details']
                }

                let apiResult = await ctx.call('transactions.request', {
                    api, //api configuration settings: JSON
                    apiRoute: route,
                    payload,
                    code,
                    appConfig
                });

                let api_response = 'success';
                //handle the api response (  it is assumed that it always returns a success or error as the status )
                let response_map = {
                    'success': 0,
                    "failed": 1
                };

                if (apiResult.success) {
                    if (success_handler) {
                        let success_function = requestDetails["success-handler"]['handler'];
                        let success_argument_name = requestDetails["success-handler"]['argument'];
                        let success_save_result_as = requestDetails["success-handler"]['save-as'];
                        if (success_argument_name) {
                            let argument = userData[success_argument_name];
                            //run the function
                            let codeString = code[success_function];
                            //create a new dynamic function
                            let f = new Function(codeString);
                            let success_function_result = f(argument);
                            //persist to redis
                            this.settings.cacheData[cacheId].userData[success_save_result_as] = success_function_result;
                        }
                    }

                    //handle cache parameters
                    if (apiResult.data && cache_params) {
                        let obj = {}
                        for (let param of cache_params) {
                            let saveName = param["save-as"]
                            let cacheData = dot.pick(param["path"], apiResult.data)
                            let defaultValue = param["default"]
                            let formatAs = param["format-as"] || false

                            if (formatAs) {
                                cacheData = await this.formatt(formatAs, cacheData, '', cacheId);
                            }

                            obj[saveName] = cacheData || defaultValue

                            if (params_check && typeof (params_check) === 'object' && Object.keys(params_check).includes(saveName)) {
                                let check_object = params_check[saveName]
                                let minParamValue = check_object["is-less-than"]
                                let isEqualTo = check_object["is-equal-to"] // if (validatesTo) {
                                //let validationName = Object.keys(check_object)[0]
                                if (minParamValue) {
                                    if (minParamValue.startsWith('__')) {
                                        minParamValue = minParamValue.replace(/__/, '')
                                        minParamValue = userData['global-request-details'][minParamValue]
                                    }
                                    //let { isValid } = await ctx.call('validator.cacheDataValidation', { validationName, input: cacheData });

                                    let minimum = parseFloat(minParamValue).toFixed(2)
                                    let parsedValue = parseFloat(cacheData).toFixed(2)
                                    if (Number(parsedValue) <= Number(minimum)) {
                                        return this.settings.cacheData[cacheId].next = check_object['redirect-to'];
                                    }
                                }
                                console.log(`*is-equal-to menu-handler.service param1  \n ${saveName} : ${cacheData}  ` )
                                console.log(`*is-equal-to menu-handler.service param1  \n is-equal-to : ${isEqualTo}  ` )
                                console.log(`*is-equal-to menu-handler.service param1  \n default : ${defaultValue}  ` )
                                console.log(`*is-equal-to menu-handler.service param1  \n ${JSON.stringify(check_object,null,2)} ` )

                                if (isEqualTo == cacheData) {
                                    // if (validatesTo) {
                                    return this.settings.cacheData[cacheId].next = check_object['redirect-to'];
                                }
                            }
                        }

                        if (cache_path) {
                            if (Object.keys(obj).length === 1 && Object.keys(obj)[0] === 'ROOT') {
                                let keys = Object.keys(obj['ROOT']);
                                for (let key of keys) {
                                    let cpath = key;
                                    let cvalue = obj['ROOT'][key]
                                    for (let item of Object.keys(cvalue)) {
                                        this.settings.cacheData[cacheId].userData[cpath][item] = cvalue[item];
                                    }
                                }
                            } else {
                                for (let key of Object.keys(obj)) {
                                    this.settings.cacheData[cacheId].userData[cache_path][key] = obj[key];
                                }
                            }
                        }
                    }
                } else {
                    api_response = 'failed';
                    this.settings.cacheData[cacheId].userData['global-request-details']['errMessage'] = apiResult.error;
                    if (error_handler) {
                        let error_function = requestDetails["error-handler"]['handler'];
                        let error_argument_name = requestDetails["error-handler"]['argument'];
                        let error_save_result_as = requestDetails["error-handler"]['save-as'];
                        let threshold = requestDetails["error-handler"]['threshold'];
                        let redirect_on_threshold = requestDetails["error-handler"]['redirect-on-threshold'];
                        if (error_argument_name) {
                            //run the error handler function
                            let argument = userData[error_argument_name];
                            //run the function
                            let codeString = code[error_function];
                            //create a new dynamic function
                            let f = new Function(codeString);
                            let error_function_result = f(argument);
                            //persist to redis
                            this.settings.cacheData[cacheId].userData[error_save_result_as] = error_function_result;
                            //check if any thresholds have been set
                            //let threshold_handler = requestDetails["error-handler"]['threshold-handler'] || false;
                            if (threshold && error_function_result === threshold && redirect_on_threshold) {
                                return this.settings.cacheData[cacheId].next = redirect_on_threshold;
                                //run the threshold function
                            }
                        }
                    }
                }

                //load the next menu data to use to create a menu response string
                this.settings.cacheData[cacheId].next = prompts[response_map[api_response]];

                let formatApiRoute = route.replace(/[^a-zA-Z_-]/g, '')
                formatApiRoute = formatApiRoute.replace(/[_-]/g, ' ')
                formatApiRoute = formatApiRoute.toLowerCase();

                this.settings.cacheData[cacheId].userData['global-request-details']['requestName'] = formatApiRoute;
            }
        },
        saveAnalytics: {
            handler(ctx) {
                let { api, code, appConfig } = this.settings.cacheData[ctx.params.cacheId]

                ctx.call('analytics.usage', {
                    ...ctx.params,
                    api,
                    code,
                    appConfig,
                    runAnalytics: appConfig['enable-analytics'],
                    customerName: this.settings.cacheData[ctx.params.cacheId].userData['account-details']['fullname']
                })

                return ''
            }

        }
    },

    methods: {
        getInitialMenu(cacheId) {
            let { appConfig, userData, currentStep } = this.settings.cacheData[cacheId]
            /**
             * -----------------------------------------------------------------------
             *  GETTING THE MODULE TO PARSE ON INITIAL ACCESS
             *
             *  Once the conditional logic is complete, it sets `this.current_menu`
             *  to the appropriate menu globally
             *
             *  App config file has to be loaded
             *
             * -----------------------------------------------------------------------
             */
            try {
                let initialStep = '';
                let page_switch_config = appConfig["page-switch-check"];
                let switchParam = appConfig["page-switch-check"].name;
                let initital_page_type = userData["account-details"][switchParam];
                let initial_page = page_switch_config.options[initital_page_type].page;
                let isIMSI = userData["is-imsi"] || userData["account-details"]["is-imsi"];
                let startMenus = appConfig['startup-menus'] || {};

                if (isIMSI) {
                    //let initial step to load is the enabled module based on the users type from the user data
                    initialStep = startMenus['registered-customer'] || `${initial_page}`.replace(/_/g, '-');

                    /**
                     * Hence The Logic is :
                     *
                     *  Registration enabled :
                     *       - If the user is registered:
                     *          If Authentication is enabled :
                     *          - check if the account is blocked: If blocked, show the account blocked prompt.
                     *          - check the number of pin trials ( if account is not blocked and pin trials is zero, reset the pin trials and show the
                     *            authentication prompt ) else show the authentication prompt with the number of pin trials remaining
                     *          If Authentication is disabled :
                     *          - load the initial module prompt
                     *      - If the user is not registered:
                     *          - Show the registration module prompt
                     *  Registration disabled :
                     *      - load the initial module prompt
                     */
                    let registrationEnabled = appConfig["register"];
                    let registerParam = appConfig["registration-check"];
                    //let imsiParam             = appConfig["imsi-check"];
                    let isRegistered = userData["account-details"][registerParam];
                    //let isImsi                = userData["account-details"][imsiParam];
                    let initialLoginCheck = appConfig["first-login-check"];
                    let isFirstLogin = userData["account-details"][initialLoginCheck];
                    let blockedAccessParam = appConfig["blocked-account-check"];
                    let dormantAccessParam = appConfig["dormant-account-check"];
                    let securityAccessParam = appConfig["security-questions-check"];
                    let isBlocked = userData["account-details"][blockedAccessParam];
                    let isDormant = userData["account-details"][dormantAccessParam];
                    let isSecure = userData["account-details"][securityAccessParam];
                    let maxPinTrials = appConfig["pin-trials-max"];
                    let pinTrialsRemaining = parseInt(userData["pin-trials-remaining"], 10);
                    let authenticationEnabled = appConfig["authenticate"];

                    console.log({ 
                        setStartMenu: initialStep,
                        initialLoginCheck: initialLoginCheck,
                        isFirstLogin: isFirstLogin,
                        isBlocked: isBlocked,
                        isDormant: isDormant,
                        isSecure: isSecure,
                        securityAccessParam: securityAccessParam,
                        registrationEnabled: registrationEnabled,
                        maxPinTrials: maxPinTrials,
                        authenticationEnabled: authenticationEnabled,
                        registerParam: registerParam,
                        page_switch_config:page_switch_config,
                        switchParam:switchParam,
                        initital_page_type:initital_page_type,
                        initial_page:initial_page,
                    })

                    //registered account with authentication enabled
                    if (registrationEnabled && isRegistered && authenticationEnabled ||
                        !registrationEnabled && isRegistered && authenticationEnabled) {
                        //user is accessing the app for the first time
                        if (isFirstLogin) {
                            initialStep = startMenus['is-first-login'] || `first-login-system-pin`;
                        }
                        else {
                            //user account is active
                            if (pinTrialsRemaining <= 0) {
                                userData["pin-trials-remaining"] = maxPinTrials;
                                initialStep = startMenus['registered-customer'] || initial_page;
                            }
                            //TODO: reset the pin trials to max if the user provides the correct password before using up all available pin trial attempts
                            else if (pinTrialsRemaining > 0 && pinTrialsRemaining < maxPinTrials) {
                                initialStep = startMenus['wrong-pin-entered'] || `wrong-login`;
                            }
                            else if (pinTrialsRemaining === maxPinTrials) {
                                initialStep = startMenus['registered-customer'] || initial_page;
                            }
                        }

                        console.log({ 'initialStep_1': initialStep })
                    }
                    //registered account with authentication disabled
                    if (registrationEnabled && isRegistered && !authenticationEnabled) {
                        initialStep = startMenus['registered-customer'] || initial_page;

                        console.log({ 'initialStep_2': initialStep })
                    }
                    //no security questions set
                    if (!isSecure && authenticationEnabled) {
                        initialStep = startMenus['no-security-questions'] || initial_page;

                        console.log({ 'initialStep_3': initialStep })
                    }
                    //unregistered account
                    if (registrationEnabled && !isRegistered ) {
                        initialStep = startMenus['unregistered-customer'] || `registration-page`;

                        console.log({ 'initialStep_4': initialStep })
                    }
                    //registratin disabled
                    if (!registrationEnabled && !isRegistered) {

                        initialStep = startMenus['registration-disabled'] || `registration-alert`;

                         console.log({ 'initialStep_5': initialStep })
                    }
                    //blocked accounts
                    if (isBlocked && authenticationEnabled) {
                        initialStep = startMenus['account-blocked'] || `account-blocked`;
                        console.log({ 'initialStep_6': initialStep })
                    }
                    //dormant accounts
                    if (isDormant && authenticationEnabled) {
                        initialStep = startMenus['dormant-account'] || `account-dormant`;
                        console.log({ 'initialStep_7': initialStep })
                    }
                    //set the current step
                    this.settings.cacheData[cacheId].currentStep = initialStep;

                    console.log({ 'initialStep_8': initialStep })
                }
                else {
                    //initial module is disabled
                    console.log('imsi check failed');
                    this.settings.cacheData[cacheId].currentStep = startMenus['imsi-check-failed'] || 'imsi-check-failed'
                }

                console.log({ setStartMenu: initialStep })
            }
            catch (e) {
                //initial module could not be loaded
                console.log('initial module could not be loaded', e);
                this.settings.cacheData[cacheId].currentStep = `technical-error`;
            }
        },
        async route(data, input = this.settings.cacheData[cacheId].userInput, cacheId) {
            //initialize our variables
            let { previousCharacter, homeCharacter, currentStep, userData } = this.settings.cacheData[cacheId]
            let str = '';
            let canGoBack = data.previous;
            let canGoHome = data.home;
            let menuAction = 'routeToCurrent';


            //determine the menu action
            if (input.trim() === '') {
                menuAction = 'routeToStart';
            }
            if (input.trim() === previousCharacter && canGoBack) {
                menuAction = 'routeToPrevious';
            }
            if (input.trim() === homeCharacter && canGoHome) {
                menuAction = 'routeToHome';
            }
            switch (menuAction) {
                case 'routeToStart': {
                    str = await this.getString(data, false, currentStep, cacheId);
                }
                    break;
                case 'routeToPrevious':
                    let tx_auth_menu = data.name === "transaction-login" ? true : false
                    if (tx_auth_menu) {
                        //load actual current menu data
                        let curr_menu = userData["transaction-authenticate-next"]
                        if (curr_menu.includes('page')) {
                            data = this.loadPage(curr_menu, cacheId)
                        }
                        else {
                            data = this.loadPrompt(curr_menu, cacheId);
                        }
                    }
                    str = await this.previous(data, cacheId)
                    break;
                case 'routeToHome':
                    str = await this.previous(data, cacheId)
                    break;
                case 'routeToCurrent':
                    switch (data.type) {
                        case 'select':
                            str = await this.actions.selectMenu({ cacheId });
                            break;
                        case 'input':
                            str = await this.actions.inputMenu({ cacheId });
                            break;
                        case 'skip':
                            str = await this.actions.skipMenu({ cacheId });
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }

            return str;
        },
        async transactionAuthentication(cacheId) {
            let { inputIsValid } = this.settings.cacheData[cacheId]
            if (inputIsValid) {
                this.handleInternalFetchSuccess(cacheId)
                await this.actions.externalFetch({ cacheId, txnAuthStep: true })
            } else {
                this.handleInternalFetchError(cacheId)
            }
        },
        async handleSearch(cacheId) {
            let { data, userData, userInput, next, currentStep } = this.settings.cacheData[cacheId];

            //we dont need to validate the input, all we need to do is to perform a search
            let datasetName = data['search-options'].dataset;
            let searchLimit = data['search-options'].limit;
            let saveToName = data['search-options'].saveTo;
            let dataset = dot.pick(datasetName, userData) || dot.pick(datasetName, userData["global-constants"]);
            this.settings.cacheData[cacheId].userData['searchItem'] = userInput

            //perform a search
            let searchResults = dataset.filter((item) => {
                let formattedName = item.label.toLowerCase().replace(/\s/g, '');
                let formattedInput = userInput.toLowerCase().replace(/\s/g, '');
                if (formattedName.startsWith(formattedInput)) {
                    return item;
                }
            })
            if (searchResults.length === 0) {
                searchResults = dataset.filter((item) => {
                    let formattedName = item.label.toLowerCase().replace(/\s/g, '');
                    let formattedInput = userInput.toLowerCase().replace(/\s/g, '');
                    if (formattedName.includes(formattedInput) && formattedInput.trim() !== '') {
                        return item;
                    }
                })
            }

            //error handling
            let errorCase = 'MATCHES_FOUND';
            let overridePrompt = false;

            //No Results
            if (searchResults.length === 0) {
                errorCase = 'NO_MATCH';
            }
            //too many results			
            else if (searchResults.length > 0 && searchResults.length > searchLimit) {
                errorCase = 'LIMIT_EXCEEDED';
            }

            switch (errorCase) {
                case "MATCHES_FOUND":
                    // go to the next step
                    this.settings.cacheData[cacheId].userData["account-details"][saveToName] = searchResults;
                    this.settings.cacheData[cacheId].next = data.next;
                    this.settings.cacheData[cacheId].overrideNextData = false
                    this.settings.cacheData[cacheId].overridemenu = false
                    //this.save(this.cache_id, this.user_data);
                    let nextData = {};
                    if (data.next.includes('page')) {
                        nextData = this.loadPage(data.next, cacheId);
                    } else {
                        nextData = this.loadPrompt(data.next, cacheId);
                    }
                    this.settings.cacheData[cacheId]["current_step"] = data.next;

                    nextData.options = searchResults;
                    await this.actions.fetchCharges({ nextMenuData: nextData, cacheId })
                    //this.settings.cacheData[cacheId].overrideNextData = nextData
                    break;
                case "NO_MATCH":
                    //show error prompt for no match
                    overridePrompt = data.errors[0];
                    //this.save(this.cache_id, this.user_data);

                    this.settings.cacheData[cacheId].overrideNextData = data
                    this.settings.cacheData[cacheId].overridemenu = overridePrompt
                    this.settings.cacheData[cacheId].next = currentStep
                    //this.settings.cacheData[cacheId].next = overridePrompt;
                    break;
                case "LIMIT_EXCEEDED":
                    //show error prompt for limit exceeded
                    overridePrompt = data.errors[1];

                    this.settings.cacheData[cacheId].overrideNextData = data
                    this.settings.cacheData[cacheId].overridemenu = overridePrompt
                    this.settings.cacheData[cacheId].next = currentStep
                    //this.settings.cacheData[cacheId].next = overridePrompt;
                    break;
                default:
                    break;
            }
        },
        async handleInvalidSelect(cacheId) {
            let { data, userData } = this.settings.cacheData[cacheId];
            if (data.nextData) {
                console.log(`handleInvalidSelect ${JSON.stringify(data,null,4)}`);
                let { nextData: { type, options }, nextData } = data
                if (type === 'select' && options && options.length === 0) {
                    this.settings.cacheData[cacheId].next = data.nextData['options-error'];
                }
                if (type === 'select' && options.length === 0) {
                    this.settings.cacheData[cacheId].next = data.nextData['options-error'];
                }
                if (type === 'select' && typeof (options) === 'string') {

                    let nextOptions = userData['account-details'][options] || userData['global-constants'][options] || userData['global-request-details'][options];
                    if (!nextOptions || nextOptions.length === 0) {
                        this.settings.cacheData[cacheId].next = nextData['options-error'];
                    }
                }
            }
        },
        async handleShowIf(cacheId) {
            let { data: { nextData }, userData } = this.settings.cacheData[cacheId];
            if (nextData && nextData['show-if'] || false) {
                let paramValue = dot.pick(nextData['show-if']['param'], userData)
                let validatesTo = nextData['show-if']['validates-to'] || false
                let isNotEqualTo = nextData['show-if']['is-not-equal-to'] || false
                let paramMatches = nextData['show-if']['matches'] || false
                let validationName = nextData['show-if']['validates-to'];

                if (validatesTo) {
                    let { isValid } = await this.validationRules(paramValue, validationName, { userData });

                    if (!isValid) {
                        this.settings.cacheData[cacheId].next = nextData['show-if']['on-error'];
                    }
                }

                if (isNotEqualTo) {

                    /**
                     * "show-if"       : {
                            "param"          : "fundsTransferCreditAccount",
                            "is-not-equal-to": "fundsTransferDebitAccount",
                            "on-error"       : "ft-same-account-error"
                        },
                    */
                    let param1 = dot.pick(nextData['show-if']['param'], userData['global-request-details']) || nextData['show-if']['param']
                    let param2 = dot.pick(nextData['show-if']['is-not-equal-to'], userData['global-request-details']) || nextData['show-if']['is-not-equal-to']

                    let validate = param1 !== param2

                    if (!validate) {
                        this.settings.cacheData[cacheId].next = nextData['show-if']['on-error'];
                    }
                }

                if (paramMatches) {
                    let param1 = dot.pick(nextData['show-if']['param'], userData['global-request-details']) || nextData['show-if']['param']
                    let param2 = dot.pick(nextData['show-if']['matches'], userData['global-request-details']) || nextData['show-if']['matches']

                    if (param1 === param2) {
                        this.settings.cacheData[cacheId].next = nextData['show-if']['on-error'];
                    }
                }
            }
        },
        showInputError(cacheId) {
            let { data, failedValidationIndex, currentStep } = this.settings.cacheData[cacheId];
            //NB: failedValidationIndex is the index of the validation error which maps to the key of the error menu in the json component configuration
            let hasError = data.error || false;
            let hasErrors = data.errors || false;
            let errorPrompt = false;
            if (hasError) {
                errorPrompt = data.error;
            }
            if (hasErrors) {
                errorPrompt = data.errors[failedValidationIndex];
            }

            this.settings.cacheData[cacheId].overrideNextData = data
            this.settings.cacheData[cacheId].overridemenu = `${errorPrompt}`
            this.settings.cacheData[cacheId].next = currentStep

            //for an internal fetch, handle it here
            let internal_fetch_enabled = data['internal-fetch']
            if (internal_fetch_enabled) {
                this.handleInternalFetchError(cacheId)
            }
        },
        handleInternalFetchError(cacheId) {
            let { data, userData, code } = this.settings.cacheData[cacheId]

            let error_handler = data["transaction-auth"]?.["error-handler"] || data['internal-fetch']?.["error-handler"] || false;

            if (error_handler) {
                let error_function = error_handler['handler'] || false;
                let argument_name = error_handler['argument'] || false;
                let save_result_as = error_handler['save-as'] || false;
                this.settings.cacheData[cacheId].next = data["transaction-auth"]?.["error"] || data['internal-fetch']?.["error"]
                this.settings.cacheData[cacheId].overridemenu = data["transaction-auth"]?.["error"] || data['internal-fetch']?.["error"]

                if (argument_name) {
                    //run the error handler function
                    let argument = userData[argument_name];
                    //run the function
                    let codeString = code[error_function];
                    //create a new dynamic function
                    let f = new Function(codeString);
                    let error_function_result = f(argument);

                    //persist to redis
                    this.settings.cacheData[cacheId].userData[save_result_as] = error_function_result;
                    //check if any thresholds have been set
                    let threshold = error_handler['threshold'];
                    let redirect_on_threshold = error_handler['redirect-on-threshold'] || false;
                    let threshold_handler = error_handler['threshold-handler'] || false;

                    if (
                        error_function_result === threshold &&
                        redirect_on_threshold
                    ) {
                        if (threshold_handler) {
                            this.actions.sendRequest({ cacheId, requestPath: threshold_handler })
                        }
                        this.settings.cacheData[cacheId].next = redirect_on_threshold;
                        this.settings.cacheData[cacheId].overridemenu = redirect_on_threshold;
                    }
                }
            }
        },
        handleInternalFetchSuccess(cacheId) {
            let { data, userData, code } = this.settings.cacheData[cacheId]

            let success_handler = data["transaction-auth"]?.["success-handler"] || data['internal-fetch']?.["success-handler"] || false;

            if (success_handler) {
                let success_function = success_handler['handler'] || false;
                let argument_name = success_handler['argument'] || false;
                let save_result_as = success_handler['save-as'] || false;
                this.settings.cacheData[cacheId].next = data["transaction-auth"]?.["success"] || data['internal-fetch']?.["success"]

                if (argument_name) {
                    let argument = userData[argument_name];
                    //run the function
                    let codeString = code[success_function];
                    //create a new dynamic function
                    let f = new Function(codeString);
                    let success_function_result = f(argument);
                    //persist to redis
                    this.settings.cacheData[cacheId].userData[save_result_as] = success_function_result;
                }
            }
        }
    }
}