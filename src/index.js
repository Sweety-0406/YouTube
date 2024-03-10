// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connetDB from "./db/index.js"

dotenv.config({
    path:'./env'
})

connetDB()


/*
 (async ()=>{ 
   try {
    await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
    
    app.on("error",()=>{
        console.log(error);
    })
    app.listen(process.env.PORT,()=>{
       console.log(`app is running on port ${process.env.PORT}`)
    })
   } catch (error) {
    console.log(error);
    process.exit(1)
   }
})()
 */