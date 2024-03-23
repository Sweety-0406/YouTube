import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloundinary} from "../utils/cloudinary.js"

const registerUser = asyncHandler( async (req,res)=>{
    /*
      //ask for username,password,email 
      //check for is any of the above field missed
      //check is if any user,email exist for the same username
      //is avatar and coverImage there?:must handle avatar
      //upload on cloudinary : check is avatar upload in cloudinary or not
      //create a user in db
      //return user
    */


    const {userName, fullName, email, password} = req.body;
    console.log(userName , fullName, email, password)
    if(
      [userName,fullName,email,password].some((field)=>
        field.trim() === "")
    ){
      throw new ApiError(400,"All fields are required");
    }
    const existedUser = await User.findOne({
      $or:[{userName},{email}]
    })

    if(existedUser){
      throw new ApiError(409,"User is already existed")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
      throw new ApiError(400,"Avatar file is not found.")
    }

    const avatar = await uploadOnCloundinary(avatarLocalPath);
    const coverImage = await uploadOnCloundinary(coverImageLocalPath);
    if(!avatar){
      throw new ApiError(400,"Avatar file is not found.")
    }
    const user = await User.create({
      userName,
      fullName,
      email,
      password,
      avatar : avatar.url,
      coverImage : coverImage?.url || ""
    })

    const isUserCreated = await User.findById(user._id).select(
      "-password -refreshTokens"
    )

    if(!isUserCreated){
      throw new ApiError(500,"Usre not created")
    }

    return res.status(201).json(
      new ApiResponse(200,user,"User is created successfully")
    )
})

export {
    registerUser
}