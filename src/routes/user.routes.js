import { loginUser, registerUser, logOut, refreshAccessToken,updatePassword,getCurrentUser,AccountUpdate,userAvatarUpdate,userCoverImageUpdate} from "../controllers/user.controllers.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/register").post(
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
    registerUser
);

//secure
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logOut)
router.route("/refresh-access-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,updatePassword)
router.route("/current-user-information").post(verifyJWT,getCurrentUser)
router.route("/account-detail-updation").post(AccountUpdate)
router.route("/user-avatar-updation").post(verifyJWT,userAvatarUpdate)
router.route("/avatar-coverImage-updation").post(verifyJWT,userCoverImageUpdate)

export default router;

