"use strict"

const CryptoJS = require("crypto-js");
const moment = require('moment');
const commaNumber = require('comma-number');
const MaskData = require('maskdata');
const argon2i = require('argon2-browser');

module.exports = {
    name: "formatters_mixins",

    methods: {
        async formatt(id, value, extra, cacheId) {
            let {
                userData
            } = this.settings.cacheData[cacheId]

            let transformed = value;

            const maskPhoneOptions = {
                maskWith: "*",
                unmaskedStartDigits: 4,
                unmaskedEndDigits: 4
            };

            switch (id) {
                case 'accounts-list': {
                    transformed = value.map(e => {
                        return {
                            label: MaskData.maskPhone(e.LINKEDACCOUNT, maskPhoneOptions),
                            value: e.LINKEDACCOUNT
                        }
                    })
                }
                    break;

                case "bank-codes": {

                    let banks = value

                    transformed = []
                    try {
                        if (banks.length > 0) {
                            transformed = banks.map(bank => {
                                return {
                                    label: bank.BANK_NAME,
                                    value: bank.SORT_CODE
                                }
                            })
                        }
                    } catch (error) {

                    }


                } break
                case 'concat-balance':

                    transformed = ''

                    if (value.includes('|')) {
                        let items = value.split('|')
                        items = items.filter((item) => {
                            return item && item.trim !== ''
                        })

                        let fortmin = items[1]
                        let fortmax = items[0]

                        this.settings.cacheData[cacheId].userData['global-request-details']['actual-balance'] = commaNumber(`${parseFloat(fortmin).toFixed(2)}`)
                        this.settings.cacheData[cacheId].userData['global-request-details']['available-balance'] = commaNumber(`${parseFloat(fortmax).toFixed(2)}`)

                    } else {

                    }

                    break;
                case "balance-timestamp":
                    this.settings.cacheData[cacheId].userData['global-request-details']['balanceTime'] = moment().format('DD-MM-YYYY')
                    break;
                case 'money':
                    transformed = commaNumber(`${parseFloat(value).toFixed(2)}`)
                    break;
                case 'add-commas':
                    this.settings.cacheData[cacheId].userData['global-request-details']['commaAmount'] = commaNumber(value)
                    break;
                case 'date':
                    try {
                        transformed = moment(value).format('DD MMM YYYY')
                    } catch (error) {
                    }
                    break;
                case 'so-date':
                    try {
                        transformed = moment(value).format('DD-MM-YYYY')
                    } catch (error) {
                    }
                    break;
                case 'international-mobile-number':
                    if (value.length === 10) {
                        transformed = `${this.settings.cacheData[cacheId].appConfig["meta-data"]["app-country-code"]}${value.slice(1)}`;
                    }
                    if (value.length === 9) {
                        transformed = `${this.settings.cacheData[cacheId].appConfig["meta-data"]["app-country-code"]}${value}`;
                    }
                    break;
                case 'mwallet-account':
                    if (value.length === 10) {
                        transformed = `CA${value.slice(1)}`;
                    }
                    if (value.length === 9) {
                        transformed = `CA${value}`;
                    }
                    break;
                case "createSpaces":
                    transformed = value.replace(/[.]/g, ' ')
                    break;
                case 'capitalize':
                    try {
                        transformed = value.toLowerCase().replace(/(?:^|\s)\S/g, function (a) {
                            return a.toUpperCase();
                        });
                    } catch (e) {
                    }
                    break;

                case "pin-hash":
                    transformed = CryptoJS.HmacSHA256(Buffer.from(value + userData.msisdn).toString('base64'), this.settings.cacheData[cacheId].appConfig["pinHashSecret"]).toString(CryptoJS.enc.Hex);
                    break;
                case "argon-pin-hash":
                    try {
                        const hashOptions = {
                            pass: value,
                            salt: new Buffer.from(`${userData.msisdn}${this.settings.cacheData[cacheId].appConfig["pinHashSecret"]}`).toString('base64'),
                            time: 3,
                            mem: 2048,
                            hashLen: 32,
                            parallelism: 1,
                            type: argon2i.ArgonType.Argon2id
                        }
                        const pinArgonHash = await argon2i.hash(hashOptions);
                        transformed = Buffer.from(pinArgonHash.hashHex, 'hex').toString('base64');
                    } catch (error) {
                        console.log(error)
                        transformed = value
                    }
                    break;

                case "moment-date-range":
                    let periodFigure = '',
                        periodMeasure = '';

                    if (value && value.toLowerCase().includes('day')) {
                        periodFigure = parseInt(value, 10);
                        periodMeasure = 'days';

                    }
                    if (value && value.toLowerCase().includes('week')) {
                        periodFigure = parseInt(value, 10);
                        periodMeasure = 'weeks';

                    }
                    if (value && value.toLowerCase().includes('month')) {
                        periodFigure = parseInt(value, 10);
                        periodMeasure = 'months';

                    }
                    if (value && value.toLowerCase().includes('year')) {
                        periodFigure = parseInt(value, 10);
                        periodMeasure = 'years';

                    }


                    let today = moment();
                    let selection = moment().subtract(periodFigure, periodMeasure);
                    let dateTo = today.format(extra);
                    let dateFrom = selection.format(extra);

                    return {
                        dateTo,
                        dateFrom,
                        periodMeasure,
                        periodFigure
                    }
                    //break;

                case "formatLoanLimitAccount":
                    let currentValue = value;
                    console.log("formatter.mixins <--------> currentValue", currentValue)
                    // if(value<=10){
                    let valuesArray = []
                    transformed = []
                    while (currentValue > 10) {
                        valuesArray.push(currentValue)
                        currentValue = currentValue = Math.floor(currentValue / 2)  // Using Math.floor to get integers //currentValue / 2
                    }
                    transformed = valuesArray.map(item => {

                        let obj = {
                            label: `Kes: ${item.toString()}`,
                            value: `${item.toString()}`
                        }
                        return obj
                    })

                    const lastEntryBe = {
                        label: "Enter amount",
                        value: "0",
                        'jump-to': "loan-application-amount"
                    }
                    transformed = [...transformed.slice(0, 3), lastEntryBe]
                    // }

                    break


                case "formatLoanLimitMinimumAmount":
                    let loanLimitMinimumAmount  = this.settings.cacheData[cacheId].userData['global-request-details']['minimumLoanApplication'] ?? '100'//[max.replace('%@', '')]//"100";
                    this.settings.cacheData[cacheId].userData['global-request-details']['minLoanAmount'] = loanLimitMinimumAmount
                    break;

                case "formatDivideByTwo":
                    //let amountToDivide = "100";
                    //this.user_data['global-request-details']['minLoanAmount'] = loanLimitMinimumAmount
                    let amountToDivide = value;
                    // if(value<=10){
                    if (amountToDivide > 10) {
                        var theAmount = this.settings.cacheData[cacheId].userData['account-details']['limit']
                        var newAmount = theAmount / 2
                        this.settings.cacheData[cacheId].userData['global-request-details']['borrowAmount'] = newAmount
                    }
                    break;
                default:
                    break;
            }

            return transformed;
        }
    }
}