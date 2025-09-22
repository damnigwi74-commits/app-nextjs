
let DevTools = require ( './lib')
let udt      = new DevTools ()

let appEclectics      = 'eclectics-loan-ussd@0.0.2'
let appDemo      = 'loan-ussd@0.0.1'
let appSidian      = 'sidian-bank-loan-ussd@0.0.2'
let appSidianFmcg      = 'sidian-fmcg-loan-ussd@0.0.2'

udt.deployConfig( appSidian )
