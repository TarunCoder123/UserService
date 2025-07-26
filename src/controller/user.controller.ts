import * as express from "express";
import { Controller } from "@interfaces";
import { Request, Response } from "express";
import { sessionCheck } from "../middleware/session.middleware";
import userHelper from "../controller-helper/user.helper";
import userProfileValidation from "validation/userProfile.validation";
import { ApiResponse } from "interfaces/user.helpers.interfaces";
import sendResponse from "responses/response.helper";
import { uploadAvatar } from "../middleware/uploadAvatar.middleware";

class UserController implements Controller {
    public path = "/user";
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes = () => {
        this.router.get(`${this.path}/profile`, sessionCheck, this.getProfileDetails);
        this.router.patch(`${this.path}/profile`, userProfileValidation, sessionCheck, this.updateProfileDetails);
        this.router.post(`${this.path}/upload.avatar`, sessionCheck, uploadAvatar.single("avatar"), this.uploadAvatars);
        this.router.delete(`${this.path}/delete`, sessionCheck, this.deleteUser);
    }
    /**
     * The user can get the detail about his profile 
     * @param {any} req
     * @param {Response} res
     * @returns
     */
    public getProfileDetails = async (req: any, res: Response) => {
        const email = String(req.user.email);
        const profileDetails = await userHelper.getProfileDetails(email);
        return sendResponse(res, profileDetails);
    }
    /**
     * The controller by which user can update the details about his profile like (bio,name,avatarUrl and location)
     * @param {any} req
     * @param {Response} res
     * @returns
     */
    public updateProfileDetails = async (req: any, res: Response) => {
        const email = String(req.user.email);
        const UpdatedFields = req.updateUser;
        const updateProfileData = await userHelper.updateProfileDetails(email, UpdatedFields);
        return sendResponse(res, updateProfileData);
    }
    /**
     * The controller by which user can upload there avatar in there bio
     * @param {any} req
     * @param {Response} res
     * @returns
     */
    public uploadAvatars = async (req: any, res: Response) => {
        const email = String(req.user.email);
        const file = req.file;
        const uploadAvatarResponse = await userHelper.uploadAvatars(email, file);
        return sendResponse(res, uploadAvatarResponse);
    }
    /**
     * This is controller by which a user can delete the details by soft delete
     * @param {any} req
     * @param {Response} res
     * @returns
     */
    public deleteUser = async (req: any, res: Response) => {
        const email = String(req.user.email);
        const deleteResponse = await userHelper.deleteUser(email);
        return sendResponse(res, deleteResponse);
    }
}

export default UserController;