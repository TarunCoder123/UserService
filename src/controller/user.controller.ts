import * as express from "express";
import { Controller } from "@interfaces";
import { Request,Response } from "express";
import sendResponse from "../responses/response.helper";
import userHelper from "../controller-helper/user.helper";

class UserController implements Controller  {
    public path='/auth';
    public router=express.Router(); 

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes = () => {

    }

    /**
     * It sign up of the user as it is first time visiting the website
     * @param req
     * @param res
     * @returns
     */
    public userSignup=async (req:Request,res:Response)=>{
        const email=String(req.body.email);
        const name=String(req.body.name);
        const password=String(req.body.password);
        const userData=await userHelper.userSignup(email,name,password);
        return sendResponse(res,userData);
    }
    /**
     * It sign in of the user as it is can used to login on the website and get the access token and refresh toke
     * @param req
     * @param res
     * @returns 
     */
    public userLogin=async (req:Request,res:Response)=>{
        const email=String(req.body.email);
        const password=String(req.body.password);
        const userData=await userHelper.userLogin(email,password);
        return sendResponse(res,userData);
    }


}

export default UserController;