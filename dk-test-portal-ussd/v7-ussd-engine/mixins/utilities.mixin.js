"use strict"
require('dotenv').config();
const envJson = require('../env.json')
const env = process.env
const encryptionKeys = env
const apiTimeout = envJson.api.timeout
const ussdEnv = env.ENVIRONMENT
const securePin = require("secure-pin");
const CryptoJS = require('crypto-js')

module.exports = {
    name: "utilities_mixin",

    methods: {
        filterNullsFromObj(obj) {
            let filtered = {}
            let keys = Object.keys(obj)

            for (let key of keys) {
                if (key && obj[key] !== null) {
                    filtered[key.toLowerCase()] = obj[key]
                }
            }

            return filtered
        },
        base64(payload) {
            let payloadToBase64 = payload
            try {
                payloadToBase64 = JSON.stringify(payloadToBase64)
            } catch (error) { }

            payloadToBase64 = Buffer.from(payloadToBase64).toString('base64');
            return payloadToBase64;
        },
        base64Decode(payload) {
            let payloadFromBase64 = Buffer.from(payload, 'base64').toString('utf-8');
            return payloadFromBase64
        },
        timeStamp(arg) {
            try {
                let moment = require('moment');
                let formatted = moment().format(arg);
                return formatted;
            }
            catch (e) {
                return false;
            }
        },
        JSON(data) {
            return JSON.stringify(data);
        },
        fromJSON(data) {
            try {
                return JSON.parse(data);
            }
            catch (e) {
                return data;
            }
        },
        //-TODO:format nested objects
        XML(data) {
            var xml = false;
            if (typeof (data) === "object") {
                xml = `<?xml version= "1.0" encoding="utf-8"?>\n<message>`;
                let keys = Object.keys(data);
                for (let key of keys) {
                    xml += `\n\t<${key}>${data[key]}</${key}>`;
                }
                xml += `\n</message>`;
            }
            return xml;
        },
        async xml2Json(xml) {
            return new Promise((resolve, reject) => {

                let xml2js = require('xml2js')
                let parser = new xml2js.Parser({ explicitArray: false })

                parser.parseString(xml, (err, result) => {

                    if (err) {
                        reject(err)
                    }
                    resolve(result)
                })
            })
        },
        stan() {
            let randomInt = securePin.generatePinSync(6);
            return randomInt;
        },
        transactionId() {
            var uniqid = require('uniqid');
            return uniqid.process().toUpperCase();
        },
        encryptedPin() {
            let pin = securePin.generatePinSync(4);
            let encryptedPin = this.aesEncrypt(pin);

            return {
                pin,
                encryptedPin
            }

        },
        hashedPin(param) {
            let pin = securePin.generatePinSync(4);
            let hashedPin = CryptoJS.HmacSHA256(Buffer.from(pin + param).toString('base64'), encryptionKeys.pinSecret).toString(CryptoJS.enc.Hex);

            return {
                pin,
                hashedPin
            }
        },
        internationalPhoneNumber(phone) {
            if (phone.startsWith('0') && phone.length === 10) {
                phone = '254' + phone.slice(1)
            }
            return phone
        },
        secureUserData(data) {
            var sData = {}
            let dataKeys = Object.keys(data)
            for (let i of dataKeys) {
                if (typeof data[i] === 'boolean') {
                    data[i] = data[i].toString()
                }
                if (typeof data[i] === 'number') {
                    data[i] = data[i].toString()
                }
                sData[i] = this.aesEncrypt(data[i])
            }
            if (ussdEnv === 'production') {
                return sData
            }else{
                return data
            }
        },
        retrieveUserData(data) {
            var sData = {}
            let dataKeys = Object.keys(data)
            for (let i of dataKeys) {
                sData[i] = this.aesDecrypt(data[i])
                if (sData[i] === 'true') {
                    sData[i] = true
                }
                if (sData[i] === 'false') {
                    sData[i] = false
                }
            }
            if (ussdEnv === 'production') {
                return sData
            }else{
                return data
            }
        },
        aesEncrypt(message) {

            if (typeof message === 'object') {
                message = JSON.stringify(message)
            }
            let encrypted = message
            try {
                encrypted = CryptoJS.AES.encrypt(
                    message,
                    CryptoJS.enc.Hex.parse(encryptionKeys.AES_KEY),
                    {
                        iv: CryptoJS.enc.Hex.parse(encryptionKeys.AES_IV),
                        mode: CryptoJS.mode.CBC,
                        formatter: CryptoJS.enc.Utf8,
                        padding: CryptoJS.pad.Pkcs7
                    }
                ).toString()
            } catch (error) {
                this.logger.info({ error: error.message, message })
            }

            return encrypted;

        },
        aesDecrypt(message) {


            let decrypted = message
            try {
                decrypted = CryptoJS.AES.decrypt(
                    message.toString(),
                    CryptoJS.enc.Hex.parse(encryptionKeys.AES_KEY),
                    {
                        iv: CryptoJS.enc.Hex.parse(encryptionKeys.AES_IV),
                        mode: CryptoJS.mode.CBC,
                        formatter: CryptoJS.enc.Utf8,
                        padding: CryptoJS.pad.Pkcs7
                    }
                ).toString(CryptoJS.enc.Utf8);
            } catch (error) {
                this.logger.info({ error: error.message, message })
            }

            try {
                decrypted = JSON.parse(decrypted);
            }
            catch (e) {
            }

            return decrypted
        },
        async httpFetch(method, url, data, custom_headers = {}) {

            const axios = require('axios');
            const qs = require('querystring');
            let response = {};
            let result = false;
            let code = 408;

            // Axios Instance
            let instance = axios.create()

            if (url.startsWith('https')) {
                const https = require('https')
                let httpsAgent = new https.Agent({ rejectUnauthorized: false })
                instance = axios.create({ httpsAgent })
            }

            instance.defaults.timeout = this.settings.apiTimeout || apiTimeout;

            //add headers if enabled
            let header_config = {};
            if (custom_headers) {
                header_config = {
                    headers: custom_headers
                }
            }

            try {
                switch (method) {
                    case "get":
                        try {
                            response = await instance.get(url, data, header_config)
                        } catch (error) {
                            response = error.response
                        }
                        break;
                    case "post":
                        try {
                            let reqOptions = {
                                url: url,
                                method: "POST",
                                headers: custom_headers,
                                data: data,
                            }

                            this.logger.info(`\n utilities.mixin requestBody \n ${JSON.stringify(reqOptions, null, 2)} \n \n`)
                            this.logger.warn(`\n utilities.mixin requestBody  --------- URL ---------- ${url} \n`)
                            //
                            if (custom_headers['content-type'] === 'application/x-www-form-urlencoded') {
                                //this.logger.info(`utilities.mixin  application/x-www-form-urlencoded`)
                                response = await instance.post(url, qs.stringify(data), header_config)
                            } else if (custom_headers['content-type'].includes('multipart/form-data')) {
                                //this.logger.info(`utilities.mixin  multipart/form-data`)

                                let reqOptionsFormdata = {
                                    url: url,
                                    method: "POST",
                                    headers: custom_headers,
                                    data: data,
                                }
                                response = await axios.request(reqOptionsFormdata);

                            } else {
                                //this.logger.info(`utilities.mixin  others `)
                                response = await instance.post(url, data, header_config)
                            }

                        } catch (error) {
                            this.logger.info(`utilities.mixin  error `)
                            response = error.response
                        }
                        break;
                    case "patch":
                        try {
                            if (custom_headers['content-type'] === 'application/x-www-form-urlencoded') {
                                response = await instance.post(url, qs.stringify(data), header_config)
                            } else {
                                response = await instance.post(url, data, header_config)
                            }

                        } catch (error) {
                            response = error.response
                        }
                        break;
                    default:
                        break;
                }
                if (response) {
                    code = response.status;
                    result = response.data;
                    if (code === 200) {
                        return {
                            success: true,
                            code,
                            data: result
                        }
                    } else {
                        return {
                            success: false,
                            code,
                            data: result
                        }
                    }
                } else {
                    return {
                        success: false,
                        code,
                        data: result
                    }
                }
            }
            catch (e) {
                return {
                    success: false,
                    code,
                    data: result
                }
            }

        }
    }
}