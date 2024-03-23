import express from'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { upload } from './middlewares/multer.middleware.js';

const app = express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"20kb"}));
app.use(express.urlencoded({
    extended:true,
    limit:"20kb"
}))
app.use(express.static("public"))
app.use(cookieParser())


//router
import  userRouter  from './routes/user.routes.js';
app.use("/api/v1/users",
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name: "coverImage",
            maxCount : 1
        }
    ]),
    userRouter
 )

export {app};

