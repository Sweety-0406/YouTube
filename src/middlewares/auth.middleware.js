import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next)=>{  //(req, _,next)
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(404,"User not authorized")
        }
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodeToken?._id).select("-password -refreshTokens")

        if(!user){
            throw new ApiError(400,"User not found")
        }
        req.user = user;
        next();
         
    } catch (error) {
        throw new ApiError(400,error?.message || "something went wrong")
    }
})