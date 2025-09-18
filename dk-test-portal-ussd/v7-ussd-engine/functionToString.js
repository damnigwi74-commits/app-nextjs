
//get-Profile

let getProfile = ({ status, data }) => {
    if (status && status === 200 && data) {
        return {
            'account-details': {
                'active': true,
                'is-imsi': true,
                'is-registered': true,
                'is-secure': true,
                'is-blocked': data.accountBlocked ? true : false,
                'is-dormant': data.withdrawFrozen,
                'first-login': data.firstTimeLogin,
                'maximumWithdrawLimit': data.maximumWithdrawLimit,
                'minimumWithdrawLimit': data.minimumWithdrawLimit,
                'minimumLoanApplication': data.minimumLoanApplication,
                'pinExpired': data.pinExpired,
                'firstname': data.firstname,
                'fullname': `${data.firstname}`,
                'app-corporate-description': `${data.corporate}`,
                'loansFrozen': data.loansFrozen,
                'status': status
            },
            'global-request-details': {
                'firstname': data.firstname,
            },
            'email': data.firstname ,
            'msisdn': data.phoneNumber,
            'imsi': '',
            'is-imsi': true,
            'is-registered': true,
            'is-blocked': data.accountBlocked,
            'is-dormant': data.withdrawFrozen,
            'first-login': data.firstTimeLogin
        };
    };
    if (status && status === 400) {
        return {
            'account-details': {
                'is-registered': false,
                'is-blocked': false,
                'is-imsi': true,
                'is-secure': true,
                'first-login': false,
                'is-dormant': false,
                'status': 400,
                'app-corporate-description': 'Eclectics Advancys Solution'
            },
            'is-registered': false,
            'is-blocked': false,
            'is-imsi': true,
            'first-login': false,
        };
    };
    return {
        'account-details': {
            'is-registered': false,
            'is-blocked': false,
            'is-imsi': true,
            'is-secure': true,
            'first-login': false,
            'is-dormant': false,
            'app-corporate-description': 'Eclectics Advancys Solution',
            'status': 500
        },
        'is-registered': false,
        'is-blocked': false,
        'is-imsi': true,
        'first-login': false
    };
}

//get-billers

let getBiller = ({ totalResults, field2, data, customerLoan, savingsTier, LOANSTATUS }) => {
    if (totalResults && totalResults === '1' && data) {
        return {
            'global-request-details': {
                'firstname': data[0].FIRST_NAME.toUpperCase(),
                'phonenumber': data[0].field102,
                'cbsCustId': data[0].CBS_CUSTOMER_ID ? data[0].CBS_CUSTOMER_ID : ''
            }
        }
    } else if (totalResults && totalResults === '0') {
        return {
            'is-imsi': true
        }
    }
}

const getSidianLinkedAccount = (data) => {
    let response = { ...data };

    if (response.data.length > 0) {
        let myData = response.data;

        myData = myData.map((item) => {
            return {
                value: item.account,
                label: item.account,
                enabled: true,
                meta: [
                    {
                        'save-as': 'selectedAccount',
                        'cache-path': 'global-request-details',
                        'value':  item.account
                    },
                    {
                        'save-as': 'accountLimit',
                        'cache-path': 'global-request-details',
                        'value':  item.accountLimit
                    },
                    {
                        'save-as': 'accountCurrency',
                        'cache-path': 'global-request-details',
                        'value':  item.currency
                    },
                    {
                        'save-as': 'accountName',
                        'cache-path': 'global-request-details',
                        'value':  item.name
                    },
                    {
                        'save-as': 'accountCategory',
                        'cache-path': 'global-request-details',
                        'value':  item.category
                    },
                    {
                        'save-as': 'odLimitTaken',
                        'cache-path': 'global-request-details',
                        'value':  item.odLimitTaken
                    }
                ]
            };
        });

        response.myData = myData;
    }

    return response;
}


//
let getProfileString = getProfile.toString().replace(/\s+/g, ' ')
let getSidianLinkedAccountString = getSidianLinkedAccount.toString().replace(/\s+/g, ' ')
//
console.log(`STRING \n\n ${getProfileString.toString()}\n\n `)







// Example Input
const inputData = {
    "status": "00",
    "message": "Linked Sidian Accounts",
    "data": [
        {
            "id": 23,
            "createdBy": null,
            "createdOn": "2024-11-19T12:42:52.412+00:00",
            "lastModifiedBy": null,
            "lastModifiedDate": null,
            "softDelete": false,
            "account": "01015150037911",
            "category": "1007",
            "currency": "KES",
            "name": "MARY KEMUMA OMBOGA",
            "onlineWorkingBalance": "0",
            "onlineActualBalance": "0",
            "accountLimit": 1762,
            "customerNumber": "1303292",
            "phoneNumber": "254790245060",
            "odLimitTaken": "800",
            "dateTaken": null,
            "odActive": true
        }
    ],
    "timestamp": null,
    "metadata": null,
    "exist": false
};

// Process the input data
const result = getSidianLinkedAccount(inputData);
//console.log(result);


