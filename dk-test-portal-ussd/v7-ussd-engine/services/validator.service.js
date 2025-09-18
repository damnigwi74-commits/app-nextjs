"use strict"

const ValidateMixin = require('../mixins/validators.mixins')

module.exports = {
    name: "validator",

    mixins: [ ValidateMixin ],

    actions: {
        validate: {
            async handler (ctx) {
                let { data, userInput, userData, appConfig, code } = ctx.params;

                let inputIsValid = false;
                //perform validations here using a for loop
                //Structure of the validation is ~ name, type, arguments
                let validations = data.validation || [];
                let currentValidation = '';
                //override for search
                if ( validations.length === 0 ) { 
                    inputIsValid === true 
                }

                for(let validation of validations){
                    let validatorName       = validation.name;
                    let validationArguments = validation['arguments'] || {};
                    currentValidation       = validatorName;
                    let validationType      = validation.type;

                    // if(validation.arguments){
                    //     let validationArgumentsArray = validation.arguments.split(",");
                    //     validationArgumentsArray = validationArgumentsArray.filter(e => e && e);

                    //     for(let argument of validationArgumentsArray){
                    //         if (argument.includes("=")) {
                    //             let argumentsParts = argument.split("=");
                    //             validationArguments[argumentsParts[0].trim()] = argumentsParts[1].trim();
                    //         }
                    //     }
                    // }

                    try {
                        if(validationType === 'joi' || validationType === 'custom'){
                                let validate = await this.validationRules(
                                    userInput,
                                    validatorName,
                                    { 
                                        promptData: data, 
                                        userData, 
                                        appConfig, 
                                        appCode: code
                                    },
                                    validationArguments
                                )
                                if (validate.isValid) {
                                    inputIsValid = true;
                                }
                                else {
                                    inputIsValid = false;
                                    break;
                                }
                        }
                    } catch (error) {
                        console.log(error)
                    }

                }
                //get the current index of the failed validation
                let failedValidationIndex = false;
                if (inputIsValid === false) {
                    for (let index in validations) {
                        if (validations[index].name === currentValidation) {
                            failedValidationIndex = index;
                        }
                    }
                }
                return {
                    inputIsValid,
                    failedValidationIndex
                };
            }
        },
        cacheDataValidation: {
            async handler (ctx) {
                let { input, validationName, userData } = ctx.params;
                return await this.validationRules(input, validationName, { userData })
            }
        }
    }
}