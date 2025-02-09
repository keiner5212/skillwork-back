import { NextFunction, Request, Response } from "express";
import { createDebugger } from "../utils/debugConfig";
import Joi from "joi";


const middlewareDebugger= createDebugger('JobValidations');


export const CreateJobBodyValidations=(
    req: Request,
    res: Response,
    next: NextFunction
)=>{

    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        required_skills: Joi.array().required(),    
		categories: Joi.array().optional(),
		services: Joi.array().optional(),
        expired_at: Joi.date().required(),
        status: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if(error){
        middlewareDebugger(error.details[0].message);
        return res.status(404).send(error.details[0].message);
    }
    next();
}
