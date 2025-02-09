import { Request, Response } from "express";
import { Cache } from "../utils/cache";
import { createDebugger } from "../utils/debugConfig";
import { HttpStatusCode } from "axios";

const middlewareDebugger= createDebugger('cache');

export const CheckCache = async (req: Request, res: Response, next: any) => {
    const cacheKey = req.method + req.originalUrl;
    const cachedData = Cache.get(cacheKey);
    if (cachedData) {
        middlewareDebugger(`Cache found for ${cacheKey}`);
        return res.status(HttpStatusCode.Ok).send(cachedData);
    } else {
        req.body.cacheKey = cacheKey;
        next();
    }

}