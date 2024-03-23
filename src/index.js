// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connetDB from "./db/index.js"
import express from 'express';
import { app } from "./app.js";

dotenv.config({
    path:'./env'
})

connetDB()
.then(()=>{
    app.on("Error",(err)=>{
       console.log(err);
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`App is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log(err);
})










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