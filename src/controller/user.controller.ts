import * as express from "express";
import { Controller } from "@interfaces";
import { Request, Response } from "express";
import sendResponse from "../responses/response.helper";
import userHelper from "../controller-helper/user.helper";
import prisma from "../client/prisma.client";
import { sessionCheck } from "../middleware/session.middleware";

class UserController implements Controller {
    public path = '/auth';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes = () => {
        this.router.post(`${this.path}/signup`, this.userSignup);
        this.router.post(`${this.path}/login`, this.userLogin);
        this.router.get(`${this.path}/logout`, this.userLogut);
        this.router.post(`${this.path}/change-password`, this.userChangePassword);
        this.router.get(`${this.path}/Userlist`, this.userGetList);
        this.router.post(`${this.path}/send-otp`, this.sendOTP);
        this.router.post(`${this.path}/verify-otp`, this.verifyOTP);
        this.router.post(`${this.path}/send-otp-email`, this.sendOTPEmail);
        this.router.post(`${this.path}/verify-otp-email`, this.verifyOTPEmail);
        this.router.post(`${this.path}/forget-password`, this.forgetPassword);
        this.router.post(`${this.path}/reset-password`, this.userResetPassword);
        this.router.get(`${this.path}/mfa/setup`, sessionCheck, this.userGenerateMFASecret);
        this.router.post(`${this.path}/verify/path`, sessionCheck, this.verifyMFASecret);
    }

    /**
     * It sign up of the user as it is first time visiting the website
     * @param req
     * 
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
    public userLogut = async (req: Request, res: Response) => {
        const user = (req as any).user;
        const logoutData = await userHelper.userLogout(user);
        if (!logoutData?.error) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
        }
        return sendResponse(res, logoutData);
    }
    /**
     * The user can click to get the reset password link on the mail
     * 
     */
    public forgetPassword = async (req: Request, res: Response) => {
        const email = String(req.body.email);
        const responseForgetPassword = await userHelper.forgetPassword(email);
        return sendResponse(res, responseForgetPassword);
    }
    /**
     * The user can change the password of the account
     * @param req
     * @param res
     * @returns
     */
    public userChangePassword = async (req: Request, res: Response) => {
        const oldPassword = String(req.body.old_password);
        const newPassword = String(req.body.new_password);
        const email = String((req as any).user.email);
        const responseData = await userHelper.userChangePassword(oldPassword, newPassword, email);
        return sendResponse(res, responseData);
    }
    /**
     * THer user can get the list of all the user 
     * @param req
     * @param res
     * @returns
     * 
     */
    public userGetList = async (req: Request, res: Response) => {
        const responseData = await userHelper.getUserList();
        return sendResponse(res, responseData)
    }
    /**
     * The user can send the otp on thier mobile
     * @param req
     * @param res
     * @returns
     */
    public sendOTP = async (req: Request, res: Response) => {
        const phone = String(req.body.phone);
        const responseData = await userHelper.sendOTP(phone);
        return sendResponse(res, responseData);
    }
    /**
     * The user can verify the otp send on the mobile
     * @param req
     * @param res
     * @returns
     */
    public verifyOTP = async (req: Request, res: Response) => {
        const phone = String(req.body.phone);
        const otp = String(req.body.otp);
        const responseData = await userHelper.verifyOTP(phone, otp);
        return sendResponse(res, responseData);
    }
    /**
     * The user can send the otp on thier mobile
     * @param req
     * @param res
     * @returns
     */
    public sendOTPEmail = async (req: Request, res: Response) => {
        const email = String(req.body.email);
        const responseData = await userHelper.sendOTPEmail(email);
        return sendResponse(res, responseData);
    }
    /**
     * The user can verify the otp send on the mobile
     * @param req
     * @param res
     * @returns
     */
    public verifyOTPEmail = async (req: Request, res: Response) => {
        const email = String(req.body.email);
        const otp = String(req.body.otp);
        const responseData = await userHelper.verifyOTPEmail(email, otp);
        return sendResponse(res, responseData);
    }
    /**
     * The user can change the password of the account
     * @param req
     * @param res
     * @returns
     */
    public userResetPassword = async (req: Request, res: Response) => {
        const token = String(req.body.token);
        const newPassword = String(req.body.new_password);
        const responseData = await userHelper.userChangePasswordEmail(token, newPassword);
        return sendResponse(res, responseData);
    }
    /**
     * This is the controller where user can generate the mfa secret for himself 
     * @param {any} req
     * @param {Response} res
     * @returns
     */
    public userGenerateMFASecret = async (req: any, res: Response) => {
        const user = req.user;
        const responseData = await userHelper.userGenerateMFASecret(user);
        return sendResponse(res, responseData);
    }
    /**
     * This is the controller where user can verify the mfa secret that generate by him
     * @param {any} req
     * @param {Response} res
     * @returns
     */
    public verifyMFASecret = async (req: any, res: Response) => {
        const token = String(req.body.token);
        const user = req.user;
        const responseData = await userHelper.verifyMFASecret(token, user);
        req.user.mfaVerified = responseData.data.isVerified;
        return sendResponse(res, responseData);
    }
}

export default UserController;