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
     * It login of the user helps in sign up
     * @param req
     * @param response
     * @returns
     */
    public userLogin=async (req:Request,res:Response)=>{
        const email=String(req.body.email);
        const name=String(req.body.name);
        const password=String(req.body.password);
        const userData=await userHelper.userLogin(email,name,password);
        return sendResponse(res,userData);
    }
}

export default UserController;