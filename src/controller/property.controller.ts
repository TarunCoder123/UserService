import * as express from "express";
import { Controller } from "@interfaces";
import { Request,Response } from "express";
import sendResponse from "../responses/response.helper";
import propertyHelpers from "../controller-helper/property.helpers";


class PropertyController implements Controller {
   public path='/system';
   public router=express.Router();

   constructor() {
     this.initializeRoutes();
   }

   private initializeRoutes=()=>{
    this.router.get(`${this.path}/property`,this.getAllPropertyFilter);
    this.router.post(`${this.path}/property`,this.postProperty);
    this.router.get(`${this.path}/my/property`,this.getPropertyByMe);
    this.router.get(`${this.path}/my/property/stats`,this.getPropertyLikeAndCommentByMe);
   }
   /** 
    * User can view all the property and user can make the filter property of specific city,country and user id.
    * @param req
    * @param res
    * @returns
    */
   public getAllPropertyFilter=async (req:any,res:Response)=>{
    const limit=Number(req.query.limit);
    const page=Number(req.query.page);
    const userId=String(req.query.user_id);
    const propertyId=String(req.query.property_id);
    const address=String(req.query.address);
    const minPrice=Number(req.query.minPrice);
    const maxPrice=Number(req.query.maxPrice);
    const isActive=Boolean(req.query.isActive);
    const propertiesData=await propertyHelpers.getAllPropertyFilter(userId,propertyId,address,minPrice,maxPrice,isActive,limit,page);
    return sendResponse(res,propertiesData);
   }
  /** 
   * User can post all the property
   * @param req
   * @param res
   * @returns
  */
  public postProperty=async (req:any,res:Response)=>{
    const body:any=(req.body);
    const email=String(req.user.email);
    const resultProperty=await propertyHelpers.postProperty(body,email);
    return sendResponse(res,resultProperty);
  }
  /** 
   * User can get all the property posted by him
   * @param req
   * @param res
   * @returns
  */
  public getPropertyByMe=async (req:any,res:Response)=>{
    const email=String(req.user.email);
    const responseDataProperty=await propertyHelpers.getPropertyByMe(email);
    return sendResponse(res,responseDataProperty);
  }
  /** 
   * User can get all the property posted by him
   * @param req
   * @param res
   * @returns
  */
 public getPropertyLikeAndCommentByMe=async (req:any,res:Response)=>{
  const property_id=String(req.query.property_id);
  const PropertyDataLikeAndComment=await propertyHelpers.getPropertyLikeAndCommentByMe(property_id);
  return sendResponse(res,PropertyDataLikeAndComment);
 }
}

export default PropertyController;