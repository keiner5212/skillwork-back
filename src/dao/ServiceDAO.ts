import { HttpStatusCode } from "axios";
import { DaoResponse, ErrorControl } from "../constants/ErrorControl";
import { createDebugger } from "../utils/debugConfig";
import { DefinedCategories } from "../constants/Categories";

// logger config
const log = createDebugger("CategoryDAO");
const logError = log.extend("error");

export class ServiceDAO {
	protected static async getAll(categories: string[]): Promise<DaoResponse> {
		try {
			if (categories.length === 0) {
				return [ErrorControl.SUCCESS, [], HttpStatusCode.Ok];
			}
			const servicesFiltered = categories.map((category: string) => {
				return DefinedCategories[category];
			});
			return [ErrorControl.SUCCESS, servicesFiltered.flat(), HttpStatusCode.Ok];
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
