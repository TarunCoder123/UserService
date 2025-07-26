import * as express from "express";
import { Controller } from "@interfaces";
import { Request, Response } from "express";
import { sessionCheck } from "../middleware/session.middleware";
import userHelper from "../controller-helper/user.helper";

class UserController implements Controller {
    public path="/user";
    public router= express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes=()=>{
        this.router.get(`${this.path}/profile`,sessionCheck,this.getProfileDetails);
    }
    /**
     * The user can get the detail about his profile 
     * @param {any} req
     * @param {Response} res
     * @returns
     */
    public getProfileDetails = async (req:any,res:Response)=>{
        const email=String(req.user.email);
        const profileDetails=await userHelper.getProfileDetails(email);

    }

}

export default UserController;