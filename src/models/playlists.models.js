import mongoose,{Schema} from "mongoose";


const playlistSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    owner:{
        type : Schema.Types.ObjectId,
        ref : "user"
    },
    videos:{
        type : Schema.Types.ObjectId,
        ref : "video"
    }
},{timestamps:true})

export const Playlist = mongoose.model("Playlist",playlistSchema)