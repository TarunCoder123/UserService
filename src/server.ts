import App from "./app";
import { log } from "./utils/helper.utils";
require('dotenv').config;

(async ()=>{
    try{
        // const app=new App();

        // connect to the postgres server

        app.listen();
    }catch(err){
        log.red(`error occur during the server file`);
    }
})();