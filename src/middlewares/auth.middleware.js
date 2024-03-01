//? authorization header :  Authorization: Bearer <token>

import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/sanptube/user.model.js";


export const verifyAndExtractDataFromJWTToken=asyncHandler(async(req,res,next)=>{
    try {
        const accessToken=req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];
        if(!accessToken){
            throw new ApiError(400,"Token not found");
        }
        //now verify if its real
        const options={
            httpOnly:true,
            secured:true
        }
        const decodedToken=await jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET,options);
    
        if(!decodedToken){
            throw new ApiError(401,"Token is not valid");
        }
        const userDetails=await User.findById(decodedToken._id).select("-password -refreshToken");
    
        if(!userDetails){
            throw new ApiError(404,"User not found or the access token is invalid");
        }
        //? adding the user info for the further use.
        req.user=userDetails;
        //! its important otherwise the control will not be passed to the next operation or middleware
        next()
    } catch (error) {
        throw new ApiError(404,error?.message)
    }
    
})