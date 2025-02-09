import { Request, Response, Router } from "express";
import { CategoryDAO } from "../dao/CategoryDAO";
import { verifyToken } from "../middlewares/jwt";

export class CategoryController extends CategoryDAO {
	private router: Router;

	constructor() {
		super();
		this.router = Router();
	}

	public routes(): Router {
		// get all
		this.router.get(
			"/",
			verifyToken,
			async (req: Request, res: Response) => {
				const data = await CategoryDAO.getAll();
				return res.status(data[2]).send(data[1]);
			}
		);

		return this.router;
	}
}
