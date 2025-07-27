import * as express from "express";
import { Controller } from "@interfaces";
import { Request, Response } from "express";
import sendResponse from "../responses/response.helper";
import propertyHelpers from "../controller-helper/property.helpers";
import upload from "../middleware/propertiesPhoto.middleware";
import { sessionCheck } from "middleware/session.middleware";


class PropertyController implements Controller {
  public path = '/property';
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get(`${this.path}/`, this.getAllPropertyFilter);
    this.router.post(`${this.path}/`, this.postProperty);
    this.router.get(`${this.path}/my/`, this.getPropertyByMe);
    this.router.get(`${this.path}/my/stats`, this.getPropertyLikeAndCommentByMe);
    this.router.post(`${this.path}/:id/photos`, upload.single("photo"), this.uploadPropertyPhoto);
    this.router.post(`${this.path}/:id/like`, sessionCheck, this.likeProperty);
  }
  /** 
   * User can view all the property and user can make the filter property of specific city,country and user id.
   * @param req
   * @param res
   * @returns
   */
  public getAllPropertyFilter = async (req: any, res: Response) => {
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const userId = String(req.query.user_id);
    const propertyId = String(req.query.property_id);
    const address = String(req.query.address);
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    const isActive = Boolean(req.query.isActive);
    const propertiesData = await propertyHelpers.getAllPropertyFilter(userId, propertyId, address, minPrice, maxPrice, isActive, limit, page);
    return sendResponse(res, propertiesData);
  }
  /** 
   * User can post all the property
   * @param req
   * @param res
   * @returns
  */
  public postProperty = async (req: any, res: Response) => {
    const body = req.body;
    const email = String(req.user.email);
    const resultProperty = await propertyHelpers.postProperty(body, email);
    return sendResponse(res, resultProperty);
  }
  /** 
   * User can get all the property posted by him
   * @param req
   * @param res
   * @returns
  */
  public getPropertyByMe = async (req: any, res: Response) => {
    const email = String(req.user.email);
    const responseDataProperty = await propertyHelpers.getPropertyByMe(email);
    return sendResponse(res, responseDataProperty);
  }
  /** 
   * User can get all the property posted by him like and comment
   * @param req
   * @param res
   * @returns
  */
  public getPropertyLikeAndCommentByMe = async (req: any, res: Response) => {
    const property_id = String(req.query.property_id);
    const PropertyDataLikeAndComment = await propertyHelpers.getPropertyLikeAndCommentByMe(property_id);
    return sendResponse(res, PropertyDataLikeAndComment);
  }
  /**
   * User can get the comment reply of the specific comment 
   * @parma req
   * @param res
   * @returns 
   */
  public getComments = async (req: any, res: Response) => {
    const property_id = String(req.query.property_id);
    const PropertyDataLikeAndComment = await propertyHelpers.getPropertyLikeAndCommentByMe(property_id);
    return sendResponse(res, PropertyDataLikeAndComment);
  }
  /**
   * User can upload the properties photo and added in the database
   * 
   */
  public uploadPropertyPhoto = async (req: any, res: Response) => {
    const propertyId = req.param.id;
    const files = req.files;
    const uploadPropertyPhotoDetails = await propertyHelpers.uploadPropertyPhoto(propertyId, files);
    return sendResponse(res, uploadPropertyPhotoDetails);
  }
  /**
   * 
   * 
   */
  public likeProperty = async (req:any,res:Response)=>{
    const propertyId = String(req.param.id);
    const email = String(req.user.email)
    const likePropertyResponse=await propertyHelpers.likeProperty(propertyId,email);
    return sendResponse(res,likePropertyResponse);
  }
}

export default PropertyController;