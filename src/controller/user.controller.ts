import * as express from "express";
import { Controller } from "@interfaces";
import { Request, Response } from "express";
import sendResponse from "../responses/response.helper";
import userHelper from "../controller-helper/user.helper";

class UserController implements Controller {
    public path = '/auth';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes = () => {
       this.router.post(`${this.path}/signup`,this.userSignup);
       this.router.post(`${this.path}/login`,this.userLogin);
       this.router.get(`${this.path}/logout`,this.userLogut);
       this.router.post(`${this.path}/change-password`,this.userChangePassword);
    }

    /**
     * It sign up of the user as it is first time visiting the website
     * @param req
     * @param res
     * @returns
     */
    public userSignup = async (req: Request, res: Response) => {
        const email = String(req.body.email);
        const name = String(req.body.name);
        const password = String(req.body.password);
        const userData = await userHelper.userSignup(email, name, password);
        return sendResponse(res, userData);
    }
    /**
     * It sign in of the user as it is can used to login on the website and get the access token and refresh toke
     * @param req
     * @param res
     * @returns 
     */
    public userLogin = async (req: Request, res: Response) => {
        const email = String(req.body.email);
        const password = String(req.body.password);
        const userData = await userHelper.userLogin(email, password);
        if (userData.error) {
            return sendResponse(res, userData);
        }
        const { access_token, refresh_token } = userData.data;
        
        res.cookie('accessToken', access_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return sendResponse(res, userData);
    }
    /**
     * It logout of the user from the website
     * @param req
     * @param res
     * @returns 
     */
    public userLogut=async (req:Request,res:Response)=>{
        const user=(req as any).user;
        const logoutData=await userHelper.userLogout(user);
        if(!logoutData?.error){
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
        }
        return sendResponse(res,logoutData);
    }
    /**
     * The user can chagnge the password of the account
     * @param req
     * @param res
     * @returns
     */
    public userChangePassword=async (req:Request,res:Response)=>{
        const oldPassword=String(req.body.old_password);
        const newPassword=String(req.body.new_password);
        const email=String((req as any).user.email);
        const responseData=await userHelper.userChangePassword(oldPassword,newPassword,email);
        return sendResponse(res,responseData);
    }
     
}

export default UserController;