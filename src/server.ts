import App from "./app";
import { log } from "./utils/helper.utils";
import DBConnectionHandler from "./connection"
import redisHelper from "./helper/redis.helper";
import { REDIS_ERR_MSG } from "./constants/redis.constant";
import UserController from "./controller/user.controller";
import PropertyController from "./controller/property.controller";
require('dotenv').config;

(async () => {
    try {
        const app = new App([new UserController(),new PropertyController()]);

        // connect to the postgres server
        const isDBconnected = await DBConnectionHandler.createDBConnection();
        if (!isDBconnected) throw new Error("error is there");

        
        //connect to the redis server
        const isRedisConnected = await redisHelper.connectRedis();
        if (!isRedisConnected) throw new Error(REDIS_ERR_MSG.CONN_ERR);

        app.listen();
    } catch (err) {
        console.log(err,"err");
        log.red(`error occur during the server file`);
    }
})();