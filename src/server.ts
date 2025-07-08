import App from "./app";
import { log } from "./utils/helper.utils";
import DBConnectionHandler from "./connection"
import redisHelper from "./helper/redis.helper";
import { REDIS_ERR_MSG } from "./constants/redis.constant";
import UserController from "./controller/user.controller";
require('dotenv').config;

console.log("wfs");

(async () => {
    try {
        console.log("1");
        const app = new App([new UserController()]);
        console.log("2");
        // connect to the postgres server
        const isDBconnected = await DBConnectionHandler.createDBConnection();
        if (!isDBconnected) throw new Error("error is there");
        console.log("1");

        //connect to the redis server
        const isRedisConnected = await redisHelper.connectRedis();
        if (!isRedisConnected) throw new Error(REDIS_ERR_MSG.CONN_ERR);

        app.listen();
    } catch (err) {
        console.log(err,"err");
        log.red(`error occur during the server file`);
    }
})();