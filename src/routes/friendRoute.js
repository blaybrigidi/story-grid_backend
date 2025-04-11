/** @format */
import * as friendController from "../app/controllers/friendController.js";
import * as friendValidate from "../app/middleware/validation/friendValidate.js";
import responseHandler from "../app/helper/encryptingRes.js";

export default function (router, aut) {
    // Friend request endpoints
    router.post("/friend/request", aut.verifyToken, aut.isUserVerified, friendValidate.validateFriendRequest, responseHandler(friendController.sendFriendRequest)
    );

    router.post("/friend/accept/:friendId", 
        aut.verifyToken, 
        aut.isUserVerified, 
        responseHandler(friendController.acceptFriendRequest)
    );

    router.get("/friend/pending", 
        aut.verifyToken, 
        aut.isUserVerified, 
        responseHandler(friendController.getPendingRequests)
    );

    router.get("/friend/list", 
        aut.verifyToken, 
        aut.isUserVerified, 
        responseHandler(friendController.getFriends)
    );

    router.delete("/friend/reject/:friendId", 
        aut.verifyToken, 
        aut.isUserVerified, 
        responseHandler(friendController.rejectFriendRequest)
    );

    router.delete("/friend/remove/:friendId", 
        aut.verifyToken, 
        aut.isUserVerified, 
        responseHandler(friendController.removeFriend)
    );
} 