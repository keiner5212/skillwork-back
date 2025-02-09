import { HttpStatusCode } from "axios";
import { DaoResponse, ErrorControl } from "../constants/ErrorControl";
import { createDebugger } from "../utils/debugConfig";
import { DefinedCategories } from "../constants/Categories";

// logger config
const log = createDebugger("CategoryDAO");
const logError = log.extend("error");

export class CategoryDAO {
	protected static async getAll(): Promise<DaoResponse> {
		try {
			return [
				ErrorControl.SUCCESS,
				Object.keys(DefinedCategories),
				HttpStatusCode.Ok,
			];
		} catch (error) {
			const msg = "Error getting documents!";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}
}
