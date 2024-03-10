import {DB_NAME} from '../constants.js'
import mongoose from "mongoose";

const connetDB = async ()=>{ 
   try {
    const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
    console.log(`app is running on port ${connectionInstance.connection.host}`)
 
   } catch (error) {
    console.log(error);
    process.exit(1)
   }
}

export default connetDB;