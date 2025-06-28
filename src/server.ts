import App from "./app";
import { log } from "./utils/helper.utils";
import DBConnectionHandler from "./connection"
require('dotenv').config;

(async ()=>{
    try{
        const app=new App();

        // connect to the postgres server
        const isDBconnected = await DBConnectionHandler.createDBConnection();
        if (!isDBconnected) throw new Error("error is there");

        app.listen();
    }catch(err){
        log.red(`error occur during the server file`);
    }
})();