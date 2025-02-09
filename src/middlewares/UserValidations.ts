import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { createDebugger } from "../utils/debugConfig";

const middlewareDebugger = createDebugger("UserValidations");

export const CreateUserBodyValidations = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const schema = Joi.object({
		email: Joi.string().required(),
		password: Joi.string().required(),
		role: Joi.number().required(),
	});

	const { error } = schema.validate(req.body);
	if (error) {
		middlewareDebugger(error.details[0].message);
		return res.status(404).send(error.details[0].message);
	}

	next();
};

export const UpdateUserBodyValidations = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const schema = Joi.object({
		// id_user: Joi.number().required(), on the token
		name: Joi.string().allow('').required(),
		email: Joi.string().required(),
		description: Joi.string().allow('').required(),
		document_type: Joi.string().allow('').optional(),
		document: Joi.string().allow('').optional(),
		phone: Joi.string().allow('').required(),
		// password: Joi.string().required(), update password not allowed
		// role: Joi.number().required(), on the token
		categories: Joi.array().optional(),
		services: Joi.array().optional(),
		image: Joi.any().optional(),
	});

	const { error } = schema.validate(req.body);

	if (error) {
		middlewareDebugger(error.details[0].message);
		return res.status(404).send(error.details[0].message);
	}

	next();
};
