import * as express from "express";
import { Controller } from "@interfaces";
import { Request,Response } from "express";
import sendResponse from "../responses/response.helper";
import propertyHelpers from "../controller-helper/property.helpers";


class PropertyController implements Controller {
   public path='/property';
   public router=express.Router();

   constructor() {
     this.initializeRoutes();
   }

   private initializeRoutes=()=>{
      
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
}

export default PropertyController;