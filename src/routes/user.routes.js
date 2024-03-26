import { loginUser, registerUser, logOut, refreshAccessToken,updatePassword,getCurrentUser,AccountUpdate,userAvatarUpdate,userCoverImageUpdate,userChannelDetails} from "../controllers/user.controllers.js";
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
router.route("/current-user-information").get(verifyJWT,getCurrentUser)
router.route("/account-detail-updation").patch(AccountUpdate)
router.route("/user-avatar-updation").patch(verifyJWT, upload.single("avatar"), userAvatarUpdate)
router.route("/avatar-coverImage-updation").patch(verifyJWT, upload.single("userCover"),userCoverImageUpdate)
router.route("/c/:userName").get(verifyJWT,userChannelDetails)

export default router;

