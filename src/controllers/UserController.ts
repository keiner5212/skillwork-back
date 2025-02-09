import { Request, Response, Router } from "express";
import { UserDAO } from "../dao/UserDAO";
import {
	CreateUserBodyValidations,
	UpdateUserBodyValidations,
} from "../middlewares/UserValidations";
import { User } from "../entities/User";
import { ErrorControl } from "../constants/ErrorControl";
import { verifyToken } from "../middlewares/jwt";
import { CheckCache } from "../middlewares/Cache";
import { uploadImage } from "../service/fireStorage";
import multer from "multer";
import { JobDAO } from "../dao/JobDAO";
import { HttpStatusCode } from "axios";

const upload = multer();
export class UserController extends UserDAO {
	private router: Router;

	constructor() {
		super();
		this.router = Router();
	}

	public routes(): Router {
		// add
		this.router.post(
			"/",
			CreateUserBodyValidations,
			async (req: Request, res: Response) => {
				const user = User.fromJson(req.body);
				const data = await UserDAO.add(user);
				if (data[0] == ErrorControl.SUCCESS) {
					return res
						.status(data[2])
						.send("User created successfully: " + data[1]);
				}
				return res.status(data[2]).send(data[1]);
			}
		);

		// get user
		this.router.get(
			"/",
			verifyToken,
			async (req: Request, res: Response) => {
				const userId = req.body.user.id;
				const data = await UserDAO.getUserById(userId);
				return res.status(data[2]).send(data[1]);
			}
		);

		// sign in
		this.router.post("/signin", async (req: Request, res: Response) => {
			const { email, password } = req.body;
			const data = await UserDAO.signIn(email, password);
			return res.status(data[2]).send(data[1]);
		});

		this.router.post(
			"/valorateuser",
			verifyToken,
			async (req: Request, res: Response) => {
				const { user_id, rate } = req.body;
				const { id } = req.body.user;
				const data = await UserDAO.valorateuser(id, user_id, rate);
				return res.status(data[2]).send(data[1]);
			}
		);

		// forgot password (send)
		this.router.post(
			"/forgot_password",
			async (req: Request, res: Response) => {
				const { email } = req.body;
				const data = await UserDAO.forgorPassword(email);
				return res.status(data[2]).send(data[1]);
			}
		);

		this.router.post("/send_code", async (req: Request, res: Response) => {
			const { email } = req.body;
			if (!email)
				return res
					.status(HttpStatusCode.BadRequest)
					.send("email not found");
			const data = await UserDAO.sendVerificationCode(email);
			return res.status(data[2]).send(data[1]);
		});

		this.router.post(
			"/verify_code",
			async (req: Request, res: Response) => {
				const { email, code } = req.body;
				if (!code || !email)
					return res
						.status(HttpStatusCode.BadRequest)
						.send("Code or email not found");
				const data = await UserDAO.verifyCode(email, code, true);
				return res.status(data[2]).send(data[1]);
			}
		);

		// forgot password (verify code)
		this.router.post(
			"/forgot_password/verify_code",
			async (req: Request, res: Response) => {
				const { email, code } = req.body;
				if (!code || !email)
					return res
						.status(HttpStatusCode.BadRequest)
						.send("Code or email not found");
				const data = await UserDAO.verifyCode(email, code);
				return res.status(data[2]).send(data[1]);
			}
		);

		// forgot password (reset)
		this.router.post(
			"/forgot_password/reset",
			async (req: Request, res: Response) => {
				const { email, code, password } = req.body;
				if (!code || !email || !password)
					return res
						.status(HttpStatusCode.BadRequest)
						.send("Code, email or password not found");
				const data = await UserDAO.resetPassword(email, code, password);
				return res.status(data[2]).send(data[1]);
			}
		);

		// update
		this.router.put(
			"/",
			UpdateUserBodyValidations,
			upload.none(),
			verifyToken,
			async (req: Request, res: Response) => {
				const user = User.fromJson(req.body);
				const image = req.body.image;

				if (image) {
					if (image.type === "Buffer" && Array.isArray(image.data)) {
						const url = await uploadImage(
							Buffer.from(image.data),
							req.body.user.id + ".jpg"
						);
						user.image = url;
					}
				}
				const data = await UserDAO.update(user, req.body.user.id);
				return res.status(data[2]).send(data[1]);
			}
		);

		return this.router;
	}
}
