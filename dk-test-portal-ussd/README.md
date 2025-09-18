# USSD 

## USSD CONFIG DEPLOYMENT
- Go to the directory where the config file is located (v7-ussd-config)
- Navigate to where env.json is located and change the redis host , port , database and password if required to the correct values for prodiction enviroment 
- Confirm Dockerfile  is present 
- Marge development to master  and pipeline will be triggered commencing build stage which produce docker image artifcats that is stored harbor image registry .   

## USSD ENGINE DEPLOYMENT
- Go to the directory where the engine is located (v7-ussd-engine).
- Navigate to where env.json is located and change the redis host , port , database and password if required to the correct values for prodiction enviroment .
- In the env.json change the listening port (Current is =  PORT is 6970) .
- Change the environment to production in the env.json file .
- Confirm Dockerfile is present .
- Marge development to master  and pipeline will be triggered commencing build stage which produce docker image artifcats that is stored harbor image registry  .