import mongoose,{Schema} from "mongoose";


const commentSchema = new Schema({
    owner:{
        type : Schema.Types.ObjectId,
        ref : "user"
    },
    content:{
        type : String,
        required : true
    },
    video:{
        type : Schema.Types.ObjectId,
        ref : "video"
    }
},{timestamps:true})

export const Comment = mongoose.model("Comment",commentSchema)