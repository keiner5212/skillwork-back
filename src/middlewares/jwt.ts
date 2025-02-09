import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { config } from "dotenv";
import { RolesConstants } from "../constants/Roles";
import { HttpStatusCode } from "axios";
import { createDebugger } from "../utils/debugConfig";

config();

const middlewareDebugger = createDebugger("jwt");
/**
 * Verify token
 * @param req
 * @param res
 * @param next
 */
export const verifyToken = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader?.split(" ")[1];

	if (token == null) {
		middlewareDebugger("Access denied. No token provided.");
		return res
			.status(HttpStatusCode.Unauthorized)
			.send("Access denied. No token provided.");
	}

	verify(
		token,
		process.env.JWT_SECRET as string,
		(err: any, payload: any) => {
			if (err) {
				middlewareDebugger("Invalid token:", token);
				return res
					.status(HttpStatusCode.Forbidden)
					.send("Invalid token.");
			}
			req.body.user = payload;
			next();
		}
	);
};

/**
 * validate Admin
 * @param req
 * @param res
 * @param next
 */
export const validateClient = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (req.body.user.role !== RolesConstants.CLIENTE) {
		return res.status(HttpStatusCode.Unauthorized).send("Access denied.");
	}
	next();
};
