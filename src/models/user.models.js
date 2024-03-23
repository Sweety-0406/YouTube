import mongoose,{Schema} from "mongoose";
import  Jwt  from "jsonwebtoken";
import bcrypt from 'bcrypt'

const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        unique:true,
    },
    avatar:{
        type:String,
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchHistory:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    refreshTokens:{
        type:String
    }
},{timestamps:true})

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();
    this.password  = await bcrypt.hash(this.password,10)
    next();
})
userSchema.methods.isPasswordCorrect = async function (password){
   return await bcrypt.compare(password,this.password)
}

userSchema.methods.generatAccessToken = function (){
    return Jwt.sign(
        {
            _id : this.id,
            fullName : this.fullName,
            userName:this.userName,
            email : this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generatRefreshToken = function (){
    return jwt.sign(
        {
            _id : this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
     )
}


export const User = mongoose.model("User",userSchema)