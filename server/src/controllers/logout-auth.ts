import { Response, Request } from "express";
import logger from "../utils/logger";
import { clearAuthCookie } from "../utils/cookies";

const logoutAuthController = async (req: Request, res: Response) => {
    try{
        clearAuthCookie(res);
        res.status(200).json({ success: true, message: 'Logout successful' });
    }catch(error){
        logger.error("Logout controller error", { error });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export default logoutAuthController;
