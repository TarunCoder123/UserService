import express from "express";
import cors from "cors";
import { Response, Request, NextFunction } from "express";
import Controller from "./interfaces/controller.interfaces";
import { env } from "./config/env";
import { log } from "./utils/helper.utils";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import sendResponse from "./responses/response.helper";
import { RESPONSE_MESSAGES, STATUS_CODES } from "./constants";
import { rateLimiter } from "./middleware/rateLimit.middleware";
require('dotenv').config();

class App {
    public app: express.Application;
    public req: express.Request = {} as express.Request;
    public res: express.Response = {} as express.Response;
    public next: express.NextFunction = () => {};

    constructor(controllers: Controller[]) {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }
    /**
     * Bind the port with the application on which this app is running
     */
    public listen() {
        this.app.listen(env.PORT ? Number(env.PORT) : 7200, () => {
            log.blue(`app is listenging at ${env.PORT ? Number(env.PORT) : 7200}`);
        });
    }

    /**
     * only return the http server after binding the port and start listing for requests
     * if you try to call without calling the listen then it return default null value as server
     * @return http server instance
     */
    public getServer(): express.Application {
        return this.app;
    }
    private initializeMiddlewares() {
        this.app.use(
            cors({
                credentials: true,
                origin: process.env.ORIGIN?.split(',') || undefined,
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
                preflightContinue: false
            })
        );
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(function onError(err: any, req: Request, res: any, next: NextFunction) {
            // The error id is attached to `res.sentry` to be returned
            // and optionally displayed to the user for support.
            res.statusCode = 500;
            res.end(res.sentry + "\n");
            next();
        });
        this.app.use(rateLimiter);
        // Apply globally: max 5 requests per 10 seconds
        // this.app.use(customRateLimiter({ windowMs: 10 * 1000, maxRequests: 5 }));
    }

    private initializeControllers(controllers: Controller[]) {
        // Check api status
        this.app.get("/", (req: Request, res: Response) => {
            sendResponse(res, { message: RESPONSE_MESSAGES.API_SERVICE })
        });
        // Setup the controllers
        controllers.forEach((controller) => {
            this.app.use('/api', controller.router);
        });
        //Unknown rotues handler
        this.app.use((req: Request, res: Response) => {
            sendResponse(res, {
                status: STATUS_CODES.UNAUTHORIZED,
                message: "bhai mere cchod",
            })
        });
    }
}

export default App;