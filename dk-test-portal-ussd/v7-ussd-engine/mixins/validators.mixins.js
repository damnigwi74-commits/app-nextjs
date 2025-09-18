"use strict"

const { findPhoneNumbersInText, isValidPhoneNumber } = require("libphonenumber-js")
const Validator = require("fastest-validator");
const v = new Validator();
const dot = require("dot-object")
const CryptoJS = require("crypto-js");
const moment = require("moment");

module.exports = {
    name: "validator_mixins",

    methods: {

        async validationRules(input, validatorName, env, validationArgs = {}, errorMessage = '') {
            let { min, max, path, length, format, firstPath, secondPath } = validationArgs
            let schema = {}
            let checkSchema = false
            let oldLength
            let newLength
            let res = {
                isValid: false
            }

            switch (validatorName) {
                case "isAlphaNumeric": {
                    let oldInpt = input.replace(/[^0-9A-Za-z ]/g, '')
                    if (input === oldInpt && input.length > 1) {
                        res = {
                            isValid: true
                        }
                    } else {
                        res = {
                            isValid: false
                        }
                    }
                }
                    break;
                case "isUpto4Decimals": {
                    let oldDecLength = input.length
                    let newDecLength = input.replace(/[^.0-9]/g, '').length

                    if (oldDecLength === newDecLength && !input.split('.')[1] ||
                        oldDecLength === newDecLength && input.split('.')[1]?.length <= 4
                    ) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }
                }
                    break;
                case "isMultipleOf50": {
                    if (this.checkIfIsNumber(input) && !(input % 50000)) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }
                }
                    break;
                case "is4DigitPin": {
                    if (this.checkIfIsNumber(input), input.length === 4) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }
                }
                    break;
                case "isStrongPin": {
                    console.log("PIN: ", input)
                    if (this.checkPinStrength(input).valid) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }
                }
                    break;
                case "isCorrectDate": {
                    let dtFm = format || 'YYYY-MM-DD'
                    res = {
                        isValid: moment(input, dtFm, true).isValid()
                    }
                }
                    break;
                case "isPaybillAmount":
                    if (input <= 150000 && input >= 10) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }
                    break;


                case "isDiasporaAmount":
                    if (input <= 1000000 && input >= 200) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }
                    break;

                case "isValidCardNumber":

                    oldLength = input.length
                    newLength = input.replace(/[^0-9]/g, '').length

                    if (oldLength === newLength && oldLength === 16) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }

                    break;
                case "isValidCardExpiry":

                    let parts = input.split("/")

                    if (parts.length === 2) {
                        let d = new Date()
                        let year = d.getFullYear().toString().slice(2)
                        let month = d.getMonth() + 1

                        // current year validation


                        if (
                            input.length === 5 &&
                            parts[0].length === 2 &&
                            parts[1].length === 2 &&
                            parseInt(parts[0], 10) < 13 &&  // months
                            parseInt(parts[0], 10) > 0 &&  // months 
                            parseInt(parts[1], 10) < 100 && // year
                            parseInt(parts[1], 10) > -1     // year 
                        ) {
                            // same year, month has to be greater
                            if (parseInt(parts[1], 10) === parseInt(year, 10) && parseInt(parts[0], 10) < parseInt(month, 10)) {
                                res = {
                                    isValid: false
                                }
                            }
                            else if (parseInt(parts[1], 10) > parseInt(year, 10)) {
                                res = {
                                    isValid: true
                                }
                            }
                            else {
                                res = {
                                    isValid: false
                                }
                            }

                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }

                    break;
                case "isValidCvv":
                    oldLength = input.length
                    newLength = input.replace(/[^0-9]/g, '').length

                    if (oldLength === newLength && oldLength === 3) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }
                    break;

                case "isInternationalPhoneNumber":

                    oldLength = input.length
                    newLength = input.replace(/[^0-9]/g, '').length

                    if (
                        oldLength === newLength && oldLength === 12 && input.startsWith("2")
                    ) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }
                    break
                case "isDiasporaPhoneNumber": {
                    let checkDiapora = findPhoneNumbersInText(input)

                    res = {
                        isValid: checkDiapora.length !== 0,
                        check: checkDiapora
                    }
                } break
                case "isStatement":

                    input = input.replace(/[.]/g, ' ')//replace dots with spaces ( eclectics issues )
                    input = input.toString().trim()

                    try {
                        let dataLength = input.length
                        let regex = /[^A-Za-z\s]+$/i
                        let newData = input.replace(regex, "")
                        let newDataLength = newData.length
                        if (dataLength > 0 && dataLength === newDataLength) {
                            res = {
                                isValid: true
                            }
                        }
                        else {
                            res = {
                                isValid: false
                            }
                        }
                        if (max && dataLength > Number(max)) {
                            res = {
                                isValid: false,
                                message: `Exceeds length ${max}`
                            }
                        }
                    }
                    catch (e) {
                        res = {
                            isValid: false
                        }
                    }
                    break;

                case "isBillAmount":
                    schema = {
                        input: {
                            type: 'number',
                            positive: true,
                            min: 5,
                            convert: true
                        }
                    }

                    checkSchema = v.validate({ input }, schema)

                    res = {
                        isValid: typeof checkSchema === 'boolean'
                    }
                    break
                case "isAmount":
                    console.log("----------------------------------------     Min: ", min)
                    if (min?.startsWith('%@')) {
                        min = env.userData['account-details'][min.replace('%@', '')]
                        console.log("----------------------------------------      Min: ", min)
                    }

                    if (min) {
                        parseInt(min, 10)
                    }

                    schema = {
                        input: {
                            type: 'number',
                            positive: true,
                            min: min || 1,
                            convert: true
                        }
                    }

                    checkSchema = v.validate({ input }, schema)

                    res = {
                        isValid: typeof checkSchema === 'boolean'
                    }
                    break
                case "isLockSavingsAmount":
                    schema = {
                        input: {
                            type: 'number',
                            positive: true,
                            min: 5000,
                            convert: true
                        }
                    }

                    checkSchema = v.validate({ input }, schema)

                    res = {
                        isValid: typeof checkSchema === 'boolean'
                    }
                    break

                case "isFtAmount":
                    schema = {
                        input: {
                            type: 'number',
                            positive: true,
                            min: 10,
                            convert: true
                        }
                    }

                    checkSchema = v.validate({ input }, schema)

                    res = {
                        isValid: typeof checkSchema === 'boolean'
                    }
                    break
                case "isPesalinkAmount":
                    schema = {
                        input: {
                            type: 'number',
                            positive: true,
                            min: min || 10,
                            max: max || 999999,
                            convert: true
                        }
                    }

                    checkSchema = v.validate({ input }, schema)

                    res = {
                        isValid: typeof checkSchema === 'boolean'
                    }
                    break
                case "isText":
                    let oldInp = input.replace(/[^A-Za-z ]/g, '')
                    if (input === oldInp && input.length > 1) {
                        res = {
                            isValid: true
                        }
                    } else {
                        res = {
                            isValid: false
                        }
                    }
                    break;
                case "isAirtimeAmount":
                    schema = {
                        input: {
                            type: 'number',
                            positive: true,
                            min: 10,
                            convert: true
                        }
                    }

                    checkSchema = v.validate({ input }, schema)

                    res = {
                        isValid: typeof checkSchema === 'boolean'
                    }
                    break
                case "isKraPin":
                    if (input.length > 0) {
                        let startsWithLetter = input[0].match(/[a-zA-Z]/i) && input[0].length === 1 || false
                        let endsWithLetter = input[input.length - 1].match(/[a-zA-Z]/i) && input[input.length - 1].length === 1 || false
                        let contains9Digits = input.replace(/[^0-9]/g, '').length === 9
                        let contains2Letters = input.replace(/[^a-z]/gi, '').length === 2

                        if (startsWithLetter && endsWithLetter && contains9Digits && contains2Letters && input.length === 11) {
                            res = {
                                isValid: true
                            }
                        }
                        else {
                            res = {
                                isValid: false
                            }
                        }


                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }



                    break
                case "isIdNumber":

                    oldLength = input.length
                    newLength = input.replace(/[^0-9]/g, '').length

                    if (oldLength === newLength && oldLength >= 6) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }
                    break;
                case "isPhoneNumber": {

                    let checkPhone = isValidPhoneNumber(input, 'KE')

                    res = {
                        isValid: checkPhone,
                        check: checkPhone
                    }
                } break;
                case "isCbAccountNumber":

                    oldLength = input.length
                    newLength = input.replace(/[^0-9]/g, '').length

                    if (oldLength === newLength && oldLength === 10) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }

                    break;
                case "isWithinNumericRange":
                    if (input.length >= parseInt(min, 10) && input.length <= parseInt(max, 10)) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false,
                            message: errorMessage
                        }
                    }
                    break;
                case "isNumber":

                    oldLength = input.length
                    newLength = input.replace(/[^0-9]/g, '').length

                    if (oldLength === newLength) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }


                    break;
                case "is6Digits":

                    if (input.length === 6) {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false
                        }
                    }


                    break;
                case "isEmail":
                    schema = {
                        input: {
                            type: 'email'
                        }
                    }

                    checkSchema = v.validate({ input }, schema)

                    res = {
                        isValid: typeof checkSchema === 'boolean',
                        message: ""
                    }
                    break;
                case "isAny":
                    res = {
                        isValid: true
                    }
                    break;

                case "isNotEmpty":
                    if (input.trim() !== "") {
                        res = {
                            isValid: true
                        }
                    }
                    else {
                        res = {
                            isValid: false,
                            message: ""
                        }
                    }
                    break;
                case "isExcelFile":
                    // if ( input === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ){
                    // 	res = {
                    // 		isValid :true
                    // 	}
                    // }
                    // else {
                    // 	res = {
                    // 		isValid:false
                    // 	}
                    // }
                    res = {
                        isValid: true
                    }
                    break;
                case "isNotEqualToLastEntry": {
                     console.log("PIN: ", input)
                    //check if mode is internal authentication or external authentication
                    let isInternalAuth = env.appConfig["internal-authentication"]


                    if (isInternalAuth) {

                        //format the PIN according to the rules defined
                        let oldValue = dot.pick(path.trim(), env.userData['global-request-details'])

                        //transform the entered pin
                        let transform_function = env.promptData["transform-function"] || false

                        if (transform_function) {

                            let codeString = env.appCode[transform_function]

                            //create a new dynamic function
                            let f = new Function(codeString)

                            let newValue = f({
                                data: input,
                                msisdn: env.userData.msisdn,
                                crypto: CryptoJS
                            })

                            if (oldValue !== newValue) {
                                res = {
                                    isValid: true
                                }
                            }
                            else {
                                res = {
                                    isValid: false
                                }
                            }
                        }
                        else {
                            if (oldValue === input) {
                                res = {
                                    isValid: false
                                }
                            }
                            else {
                                res = {
                                    isValid: true
                                }
                            }
                        }
                    }

                    //else skip and return control to the external authenticator
                    else {
                        
                        res = {
                            //isValid: true
                            isValid: isNotOldPin(input, env)
                        }
                    }
                } break;

                case "isNotOldPin": {
                    console.log("PIN: ", input)
                    let oldPin = env.userData['global-request-details'].oldPin
                    if (input === oldPin) {
                        res = {
                            isValid: false
                        }
                    } else {
                        res = {
                            isValid: true
                        }
                    }

                } break;

                case "isEqualToLastEntry": {

                    //check if mode is internal authentication or external authentication
                    let isEqInternalAuth = env.appConfig["internal-authentication"]

                    if (isEqInternalAuth) {

                        //format the PIN according to the rules defined
                        let oldValue = dot.pick(path.trim(), env.userData['global-request-details'])

                        //transform the entered pin
                        let transform_function = env.promptData["transform-function"] || false

                        if (transform_function) {

                            let codeString = env.appCode[transform_function]

                            //create a new dynamic function
                            let f = new Function(codeString)

                            let newValue = f({
                                data: input,
                                msisdn: env.userData.msisdn,
                                crypto: CryptoJS
                            })

                            if (oldValue === newValue) {
                                res = {
                                    isValid: true
                                }
                            }
                            else {
                                res = {
                                    isValid: false
                                }
                            }
                        } else {
                            if (oldValue === input) {
                                res = {
                                    isValid: true
                                }
                            }
                            else {
                                res = {
                                    isValid: false
                                }
                            }
                        }
                    }
                    //else skip and return control to the external authenticator
                    else {
                        res = {
                            isValid: true
                        }
                    }
                } break;
                case "isCorrectPin": {
                    //check if mode is internal authentication or external authentication
                    let isCorInternalAuth = env.appConfig["internal-authentication"]

                    if (isCorInternalAuth) {
                        //format the PIN according to the rules defined
                        let oldPin = env.userData['account-details'].pin || false

                        //transform the entered pin
                        let codeString = env.appCode["hash_pin"]

                        //create a new dynamic function
                        let f = new Function(codeString)
                        //
                        let newValue = f({
                            data: input,
                            msisdn: env.userData.msisdn,
                            crypto: CryptoJS
                        })
                        //
                        if (oldPin !== newValue) {
                            res = {
                                isValid: false
                            }
                        } else {
                            res = {
                                isValid: true
                            }
                        }
                    } else {
                        res = {
                            isValid: true
                        }
                    }
                } break;
                case "compareValues": {
                    let firstValue = dot.pick(firstPath.trim(), env.userData)
                    let secondValue = dot.pick(secondPath.trim(), env.userData)

                    if (firstValue === secondValue) {
                        res = {
                            isValid: true
                        }
                    } else {
                        res = {
                            isValid: false
                        }
                    }
                } break;
                case "matchesLength": {
                    schema = {
                        input: {
                            type: 'string',
                            length
                        }
                    }

                    checkSchema = v.validate({ input }, schema)

                    res = {
                        isValid: typeof checkSchema === 'boolean'
                    }
                } break;
                case "isWithinLimit": {
                    if (min?.startsWith('%@')) {
                        min = env.userData['global-request-details'][min.replace('%@', '')]
                    }
                    if (max?.startsWith('%@')) {
                        max = env.userData['global-request-details'][max.replace('%@', '')]
                    }
                    if (min) {
                        parseInt(min, 10)
                    }
                    if (max) {
                        parseInt(max, 10)
                    }
                    schema = {
                        input: {
                            type: 'number',
                            positive: true,
                            min: min || 1,
                            max: max || 9999999999,
                            convert: true
                        }
                    }

                    checkSchema = v.validate({ input }, schema)

                    res = {
                        isValid: typeof checkSchema === 'boolean'
                    }
                } break;


                default:
                    res = {
                        isValid: true
                    }
                    break;
            }

            return res
        },

        isNotOldPin(data, env){

            let oldPin = env.userData['global-request-details'].oldPin
            if (data === oldPin) {
                return false
            }
            return true
        },

        checkIfIsNumber(data) {
            //isNaN
            let dataLength = data.length
            let newDataLength = data.replace(/[^0-9]/g, "").length
            if (dataLength === newDataLength) {
                return true
            }
            else {
                return false
            }
        },
        checkPinStrength(pinString) {
            console.log("PIN: ", pinString)
            //invalid length
            if (pinString.length !== 4) {
                return { "valid": false, "msg": "invalid_pin_length" }
            }
            //Convert the PIN into an array
            let pin = []
            for (let p = 0; p < pinString.length; p++) {
                pin.push(pinString.charAt(p))
            }
            //helper function to map only unique values
            let onlyUnique = (value, index, self) => {
                return self.indexOf(value) === index
            }
            try {
                let numbers = '1,2,3,4,5,6,7,8,9,0'
                let numericArray = numbers.split(',')
                let totinvalid = pin.length
                //let unique = pin.filter(onlyUnique)
                //Ensures all digits are numbers
                for (let i = 0; i < totinvalid; i++) {
                    if (numericArray.indexOf(pin[i]) == -1) {
                        return { "valid": false, "msg": "alpha_characters_found" }
                    }
                }
                //Ensures that the pin doesnt consist of a single character
                //let uniquePin = pin.filter(onlyUnique)
                //Ensure no sequence passwords exist e.g 1234, 4321, 9876,6789
                let sequence = []
                for (let x = 0; x < pin.length; x++) {
                    let difference = pin[x] - pin[x + 1]
                    sequence.push(difference)
                }
                let sequenceDetected = sequence.filter(onlyUnique)
                if (sequenceDetected.length == 1 && sequenceDetected[0].toString() === '1') {
                    return { "valid": false, "msg": "easy_pin" }
                }
                if (sequenceDetected.length == 1 && sequenceDetected[0].toString() === '0') {
                    return { "valid": false, "msg": "easy_pin" }
                }
                if (sequenceDetected.length == 1 && sequenceDetected[0].toString() === '-1') {
                    return { "valid": false, "msg": "easy_pin" }
                }
                //ensure that no birthdays are entered
                let birthdays = []
                let date = new Date()
                let year = date.getFullYear()
                let maxyear = parseInt(year) - 18
                let minyear = parseInt(year) - 100
                for (let t = minyear; t <= maxyear; t++) {
                    birthdays.push(t)
                }
                if (birthdays.indexOf(parseInt(pinString)) != -1) {
                    return { "valid": false, "msg": "birthday_found" }
                }

                //check for 3 consicutive characters
                let pinArray = pinString.split('')
                for (let pinItem of pinArray) {
                    if ((pinString.split(`${pinItem}${pinItem}${pinItem}`).length - 1) > 0) {
                        return { "valid": false, "msg": "easy_pin" };
                    }
                }

                return { "valid": true, "msg": "valid_pin" }
            }
            catch (e) {
            }
        }
    }
}