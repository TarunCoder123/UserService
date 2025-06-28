import express from "express";
import { Response,Request,NextFunction } from "express";
import Controller from "./interfaces/controller.interfaces";
import {env} from "./config/env";
import { log } from "./utils/helper.utils";

class App {
    public app:express.Application;
    public req:express.Request;
    public res:express.Response;
    public next:express.NextFunction;

    constructor(controllers: Controller[]){
        this.app=express();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }
    /**
     * Bind the port with the application on which this app is running
     */
    public listen(){
        this.app.listen(env.PORT?Number(env.PORT):7200,()=>{
            log.blue(`app is listenging at ${env.PORT?Number(env.PORT):7200}`);
        });
    }
}