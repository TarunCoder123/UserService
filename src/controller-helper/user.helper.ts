import bcrypt from 'bcrypt';
import { RESPONSE_MESSAGES,STATUS_CODES } from "../constants/index";
import prisma from "../client/prisma.client";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import { isValidEmail } from "./common.helper";


class UserHelper {
    constructor (){
        (async ()=>{})();
    }
    /**
     * The user sign-in helper handles all the login opertions and checks for valid users
     * @param {string} email
     * @param {string} name
     * @param {string} password
     * @returns {Promise<ApiResponse>} return after saving the user data
     */
    public userLogin=async (email:string,name:string,password:string):Promise<ApiResponse> => {
        try{
        // check the email is valid or not
        const valid=isValidEmail(email);
        if(!valid){
            return {
                error: true,
                message: "email is not valid",
                status: 400
            }
        }
  
        // check if user is present in the user table 
        const user = await prisma.user.find({where:{email}});

        if(user){
            return {
                error: true,
                message: "Email is already registered",
                status: 409
            }
        }

        // register the email and name and password to the table
        const hashed=await bcrypt.hash(password, 10);
        const data = await prisma.user.create({
            data: {
                name:name,
                email:email,
                password:hashed
            }
        });

        return {
            error: false,
            data : {message:"Sign up is successfully"},
            status: STATUS_CODES.CREATED
        };
    } catch(e){
        return {
            error: true,
            data: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
            status: Number(STATUS_CODES.INTERNALSERVER)
        }
    }
    }

}

export default new UserHelper();