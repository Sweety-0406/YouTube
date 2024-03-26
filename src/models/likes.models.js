import mongoose,{Schema} from "mongoose";


const likesSchema = new Schema({
    likedId:{
        type : Schema.Types.ObjectId,
        ref : "user"
    },
    comment:{
        type : Schema.Types.ObjectId,
        ref : "comment"
    },
    video:{
        type : Schema.Types.ObjectId,
        ref : "video"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"tweet"
    }
},{timestamps:true})

export const Like = mongoose.model("Like",likesSchema)