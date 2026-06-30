import { Response } from "express";
import { config } from "../config/config";
import ms from "ms";

export const setAuthCookie = (
    res: Response,
    token: string
) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ms(config.jwt.expiration as ms.StringValue)
    });
};

export const clearAuthCookie = (res: Response) => {
    res.clearCookie("token",{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
};