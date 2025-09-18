
//get-billers
let getProfileMaru = ({ totalResults, field2, data, customerLoan, savingsTier, LOANSTATUS }) => {
    if (totalResults && totalResults === '1' && data) {
        return {
            'account-details': {
                'identification-id': data[0].IDENTIFICATION_ID,
                'nationalId': data[0].IDENTIFICATION_ID,
                'is-registered': true,
                'is-imsi': true,
                'is-blocked': data[0].ACTIVE === 0,
                'is-dormant': data[0].DORMANT === 1,
                'first-login': data[0].FIRST_LOGIN === 1,
                'secQuiz-set': data[0].SECURITY_QUESTIONS_SET === 1,
                'firstname': data[0].FIRST_NAME.toUpperCase(),
                'surname': data[0].LAST_NAME.toUpperCase(),
                'othername': data[0].SECOND_NAME.toUpperCase(),
                'fullname': data[0].ACCOUNT_NAME.toUpperCase(),
                'active': data[0].ACTIVE === 1,
                'customer-loan': customerLoan ? customerLoan : [],
                'savings-tier': savingsTier ? savingsTier : [],
                'loan-status': LOANSTATUS ? parseInt(LOANSTATUS, 10) : 0,
                'pin': data[0].PIN ? data[0].PIN : '',
                'loans-scored': 0,
                'lockSavingsAccount': data[0].LOCKSAVING_ACCOUNT ? data[0].LOCKSAVING_ACCOUNT : '',
                'lockSavingsAmount': '0',
                'mwallet-account': data[0].MWALLET_ACCOUNT ? data[0].MWALLET_ACCOUNT : '',
                'cbsCustId': data[0].CBS_CUSTOMER_ID ? data[0].CBS_CUSTOMER_ID : '',
                'securityQuestions': data[0].SECURITY_QUESTIONS_SET === 1
            },
            'global-request-details': {
                'firstname': data[0].FIRST_NAME.toUpperCase(),
                'phonenumber': data[0].field102,
                'cbsCustId': data[0].CBS_CUSTOMER_ID ? data[0].CBS_CUSTOMER_ID : ''
            },
            'email': data[0].EMAIL_ADDRESS,
            'msisdn': data[0].PHONE_NUMBER,
            'mwallet': data[0].MWALLET_ACCOUNT,
            'lockSavingsAccount': data[0].LOCKSAVING_ACCOUNT || '',
            'lockSavingsAmount': '0',
            'imsi': data[0].IMSI,
            'is-imsi': true,
            'deviceChanged': '0',
            'otpExpired': '0',
            'transaction-authenticated': false
        }
    }
    else if (totalResults && totalResults === '0') {
        return {
            'account-details': {
                'is-registered': false,
                'is-blocked': false,
                'is-imsi': true,
                'first-login': false
            }, 'is-imsi': true
        }
    }
    else if (totalResults && totalResults === '02') {
        return {
            'account-details': {
                'is-registered': true,
                'is-blocked': false,
                'is-imsi': false,
                'first-login': false
            }, 'is-imsi': false
        }
    } return {
        'account-details': {
            'is-registered': false,
            'is-blocked': false,
            'is-imsi': true,
            'first-login': false
        },
        'is-imsi': true
    }
}


let getProfile = (({ status, data }) => {
    if (status && status === 200 && data) {
        return {
            'account-details': {
                'is-registered': true,
                'is-imsi': true,
                'is-blocked': data.accountBlocked,
                'is-dormant': 0,
                'active': true,
                'first-login': data.firstTimeLogin,
                'app-corporate-description': data.corporate || 'Advance',
            },
            'global-request-details': {},
            'imsi': '',
            'is-imsi': true
        };
    };
    if (status && status === 400) {
        return {
            'account-details':
            {
                'is-registered': false,
                'is-blocked': false,
                'is-imsi': true,
                'first-login': false
            },
            'is-imsi': true
        };
    };
    if (status && status === 401) {
        return {
            'account-details':
            {
                'is-registered': true,
                'is-blocked': false,
                'is-imsi': false,
                'first-login': false
            },
            'is-imsi': false
        };
    };
    return {
        'account-details': {
            'Is-registered': false,
            'is-blocked': false,
            'is-imsi': false,
            'first-login': false
        },
        'is-imsi': false
    };
}).toString()


//get-billers
let getBiller = (
    ({ status, data }) => {
        if (status && status == '00' && data) {
            return {
                'billers': data.map(item => {
                    return {
                        'value': item.value,
                        'label': item.label,
                        'enabled': true
                    };
                })
            };
        }
        if (status && status === '99') {
            return {
                'billers': ''
            }
        }
    }
).toString()


console.log(`GET PROFILE =====\n\n  ${JSON.stringify(getProfile).replace(/(?:\\[rn])+/g, "").replace(/\s\s+/g, '')}`);



