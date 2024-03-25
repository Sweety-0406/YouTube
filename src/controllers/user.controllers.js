import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import {uploadOnCloundinary} from "../utils/cloudinary.js"
import  jwt  from "jsonwebtoken";




const generateAccessTokenAndRefreshToken = async function (userId){
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generatAccessToken()
    const refreshToken = user.generatRefreshToken()
    user.refreshTokens = refreshToken;
    user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(400,"Someghing went wrong")
  }
}

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
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files  && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
      coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
      throw new ApiError(400,"Avatar file is not found.")
    }

    const avatar = await uploadOnCloundinary(avatarLocalPath);
    const coverImage = await uploadOnCloundinary(coverImageLocalPath);
    if(!avatar){
      throw new ApiError(400,"something went wrong. Avatar file is not found.")
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
      new ApiResponse(200,isUserCreated,"User is created successfully")
    )
})

const loginUser = asyncHandler(async (req,res)=>{
  /*
   //check is every field are filled or not
   //after check is user exist or not
   //then check is password right or not-->
         //first off all take password and decode it by jwt
         //then check is that password is right for that username or not
   //generate accessToken and refreshToken   
   //send cookies along with response       
  */

   const {userName, fullName, email, password} = req.body;

    const user = await User.findOne({
     $or : [{userName},{email}]
   })
   if(!user){
    throw new ApiError(404,"User not found")
   }
   const isCorrectPassword =await user.isPasswordCorrect(password)

   if(!isCorrectPassword){
    throw new ApiError(401,"Password is incorrect")
   }

   const {accessToken,refreshToken} =await generateAccessTokenAndRefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshTokens")

   const options = {
    httpOnly:true,
    secure:true
   } 

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(
        200,
        {
          user:loggedInUser,accessToken,refreshToken
        },
        `${loggedInUser.userName} is successFully logged in.`)
    )


})

const logOut = asyncHandler(async (req,res)=>{
  const user = req.user;
  await User.findByIdAndUpdate(
     user._id,
     {
      $set:{
        refreshTokens:undefined
      }
     },
     {
      new:true
     }
  )
  const options = {
    httpOnly:true,
    secure:true
  } 
  return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
      new ApiResponse(200,{},"User successfully logged Out ")
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
   const incommingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
   if(!incommingRefreshToken){
    throw new ApiError(400,"Unauthorize accessed")
   }
   const decodeToken = jwt.verify(incommingRefreshToken,process.env.ACCESS_TOKEN_SECRET);
   const user = await User.findById(decodeToken._id);
   if(!user){
    throw new ApiError(404,"User not found");
   }
   if(incommingRefreshToken !== user?.refreshTokens){
    throw new ApiError(401,"Invalid refresh token")
   }

   const {accessToken,newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id);
   const options = {
      httpOnly:true,
      secure:true
   }
   return res
         .status(200)
         .cookie("accessToken",accessToken,options)
         .cookie("refreshToken",newRefreshToken,options)
         .json(
            new ApiResponse(
                200,
                {
                  accessToken,refreshToken : newRefreshToken
                },
                "successfully refreshed access token"
              )
         )
})

const updatePassword = asyncHandler(async (req,res)=>{
  const {oldPassword, newPassword, confirmedPassword} = req.body;
  if(oldPassword === newPassword){
    throw new ApiError(404,"Password is same old password")
  }
  const user = await User.findById(req.user._id);
  const isCorrectPassword = user.isPasswordCorrect(oldPassword)

  if(!isCorrectPassword){
    throw new ApiError(400,"Incorrect password")
  }
  if(newPassword !== confirmedPassword){
    throw new ApiError(402,"New password and confirmed password is not same")
  }
  user.password = newPassword
  user.save({validateBeforeSave:false});

  return res 
        .status(200)
        .json(
          new ApiResponse(200,{},"Password changed successfully.")
        )

})

const getCurrentUser = asyncHandler(async(req,res)=>{
  return res
      .status(200)
      .json(
        new ApiResponse(200,req.user,"User is successfully fetched")
      )
})

const AccountUpdate = asyncHandler(async(req,res)=>{
  const {fullName,email} = req.body
  if(!fullName || !email){
  throw new ApiError(404,"Full name email both are requied field")
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set :{
        fullName,
        email
      } 
    },
    {
      new:true
    }
  ).select("-password -refreshTokens")

  return res
         .status(200)
         .json(
           new ApiResponse(200,user,"Account is successfully updated.")
         )

})

const userAvatarUpdate = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path 
  if(!avatarLocalPath){
    throw new ApiError(400,"Missing path of avatar")
  }
  const avatar = await uploadOnCloundinary(avatarLocalPath);
  if(!avatar.url){
    throw new ApiError(400,"Something went wrong during uploading on cloudinary")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      avatar : avatar?.url
    },
    {new:true}
  ).select("-password")

  return res
         .status(200)
         .json(
          new ApiResponse(200,user,"User avatar is successfully updated")
         )
  
})

const userCoverImageUpdate = asyncHandler(async(req,res)=>{
  const coverImageLocalPath = req.file?.path 
  if(!coverImageLocalPath){
    throw new ApiError(400,"Missing path of avatar")
  }
  const coverImage = await uploadOnCloundinary(coverImageLocalPath);
  if(!coverImage.url){
    throw new ApiError(400,"Something went wrong during uploading on cloudinary")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      coverImage : coverImage?.url
    },
    {new:true}
  ).select("-password")

  return res
         .status(200)
         .json(
          new ApiResponse(200,user,"User cover image is successfully updated")
         )
  
})

export {
    registerUser,
    loginUser,
    logOut,
    refreshAccessToken,
    updatePassword,
    getCurrentUser,
    AccountUpdate,
    userAvatarUpdate,
    userCoverImageUpdate 
}