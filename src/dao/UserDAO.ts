import { config } from "dotenv";
import { User } from "../entities/User";
import {
	addDoc,
	arrayUnion,
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	updateDoc,
	where,
} from "firebase/firestore";
import { db } from "../service/firebaseDB";
import { createDebugger } from "../utils/debugConfig";
import {
	ComparePassword,
	EncriptPassword,
} from "../utils/cryptography/encrypt";
import { sign } from "jsonwebtoken";
import { fromDefault, sendMail } from "../utils/Email/SendEmail";
import { generateCode } from "../utils/Email/VerificationCode";
import { Cache } from "../utils/cache";
import { DaoResponse, ErrorControl } from "../constants/ErrorControl";
import { HttpStatusCode } from "axios";
import { getDateTime } from "../utils/Time";

config();

// logger config
const log = createDebugger("UserDAO");
const logError = log.extend("error");

export class UserDAO {
	protected static async signIn(
		email: string,
		password: string
	): Promise<DaoResponse> {
		try {
			//get user by email
			const usersRef = collection(db, User.COLLECTION);
			const q = query(usersRef, where("email", "==", email));
			const querySnapshot = await getDocs(q);

			if (querySnapshot.empty) {
				return [
					ErrorControl.PERSONALIZED,
					"User not found",
					HttpStatusCode.NotFound,
				];
			}
			const user = User.fromJson({
				...querySnapshot.docs[0].data(),
				id_user: querySnapshot.docs[0].id,
			});

			//compare password
			const passwordMatch = await ComparePassword(
				password,
				user.password
			);
			if (!passwordMatch) {
				return [
					ErrorControl.PERSONALIZED,
					"Password incorrect",
					HttpStatusCode.BadRequest,
				];
			}

			// create token and return it
			const token = sign(
				{ id: user.id_user, email, role: user.role },
				process.env.JWT_SECRET as string,
				{
					expiresIn: process.env.JWT_EXPIRATION_TIME,
				}
			);
			return [
				ErrorControl.SUCCESS,
				{
					token: token,
					role: user.role,
				},
				HttpStatusCode.Ok,
			];
		} catch (error) {
			const msg = "Error in sign in";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async add(user: User): Promise<DaoResponse> {
		try {
			// verify if email already exists
			const usersRef = collection(db, User.COLLECTION);
			const q = query(usersRef, where("email", "==", user.email));
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				return [
					ErrorControl.PERSONALIZED,
					"Email already exists",
					HttpStatusCode.Conflict,
				];
			}

			// encrypt password
			user.password = await EncriptPassword(user.password);
			// convert user to json
			const userTosave = user.toSaveJson();
			// save user
			const docRef = await addDoc(
				collection(db, User.COLLECTION),
				userTosave
			);
			log("Document written with ID: %s", docRef.id);
			return [ErrorControl.SUCCESS, docRef.id, HttpStatusCode.Created];
		} catch (error) {
			const msg = "Error adding document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async sendVerificationCode(
		email: string
	): Promise<DaoResponse> {
		try {
			const code = generateCode(6);

			const info = await sendMail({
				from: fromDefault,
				to: email,
				subject: "Confirm your email",
				text: "Your verification code: " + code,
			});

			if (!info[0]) {
				throw new Error("Email not sent, error: " + info[1]);
			}
			const key = "forgot_password_code_" + email;
			Cache.set(key, code);

			return [ErrorControl.SUCCESS, "Email sent", HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error sending email";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}
	protected static async forgorPassword(email: string): Promise<DaoResponse> {
		try {
			// verify if email already exists
			const usersRef = collection(db, User.COLLECTION);
			const q = query(usersRef, where("email", "==", email));
			const querySnapshot = await getDocs(q);

			if (querySnapshot.empty) {
				return [
					ErrorControl.PERSONALIZED,
					"Email not found",
					HttpStatusCode.NotFound,
				];
			}

			const code = generateCode(6);

			const info = await sendMail({
				from: fromDefault,
				to: email,
				subject: "Forgot password",
				text: "Your verification code: " + code,
			});

			if (!info[0]) {
				throw new Error("Email not sent, error: " + info[1]);
			}
			const key = "forgot_password_code_" + email;
			Cache.set(key, code);

			return [ErrorControl.SUCCESS, "Email sent", HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error sending email";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async verifyCode(
		email: string,
		code: string,
		once = false
	): Promise<DaoResponse> {
		try {
			const key = "forgot_password_code_" + email;
			const cachedCode = Cache.get(key);

			if (!cachedCode) {
				return [
					ErrorControl.PERSONALIZED,
					"Code not found",
					HttpStatusCode.NotFound,
				];
			}

			if (cachedCode !== code) {
				return [
					ErrorControl.PERSONALIZED,
					"Code incorrect",
					HttpStatusCode.BadRequest,
				];
			}

			// make sure code is not expired
			if (!once) Cache.makeInfinite(key);

			return [ErrorControl.SUCCESS, "Code correct", HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error verifying code";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async resetPassword(
		email: string,
		code: string,
		password: string
	): Promise<DaoResponse> {
		try {
			const key = "forgot_password_code_" + email;
			const cachedCode = Cache.get(key);

			if (!cachedCode) {
				return [
					ErrorControl.PERSONALIZED,
					"Code not found",
					HttpStatusCode.NotFound,
				];
			}

			if (cachedCode !== code) {
				return [
					ErrorControl.PERSONALIZED,
					"Code incorrect",
					HttpStatusCode.BadRequest,
				];
			}
			// remove code
			Cache.delete(key);

			// encrypt password
			const hashedPassword = await EncriptPassword(password);
			// update password
			const usersRef = collection(db, User.COLLECTION);
			const q = query(usersRef, where("email", "==", email));
			const querySnapshot = await getDocs(q);

			if (querySnapshot.empty) {
				return [
					ErrorControl.PERSONALIZED,
					"Email not found",
					HttpStatusCode.NotFound,
				];
			}

			const userRef = querySnapshot.docs[0].ref;

			await updateDoc(userRef, {
				password: hashedPassword,
			});

			return [
				ErrorControl.SUCCESS,
				"Password updated",
				HttpStatusCode.Ok,
			];
		} catch (error) {
			const msg = "Error updating password";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async getUserById(id_user: string): Promise<DaoResponse> {
		try {
			const docRef = doc(db, User.COLLECTION, id_user);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				return [
					ErrorControl.PERSONALIZED,
					"User not found",
					HttpStatusCode.NotFound,
				];
			}

			const user = User.fromJson({ ...docSnap.data(), id_user });
			// delete password
			user.deletePassword();
			return [ErrorControl.SUCCESS, user, HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error getting user";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async update(
		user: User,
		id_user: string
	): Promise<DaoResponse> {
		try {
			const docRef = doc(db, User.COLLECTION, id_user);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				return [
					ErrorControl.PERSONALIZED,
					"User not found",
					HttpStatusCode.NotFound,
				];
			}

			await updateDoc(docRef, user.toUpdateJson(docSnap.data()));

			return [ErrorControl.SUCCESS, "User updated", HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error updating user";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async valorateuser(
		user_id: string,
		valorated_user_id: string,
		rate: number
	): Promise<DaoResponse> {
		try {
			const docRef = doc(db, User.COLLECTION, valorated_user_id);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				return [
					ErrorControl.PERSONALIZED,
					"User not found",
					HttpStatusCode.NotFound,
				];
			}

			const valorations = docSnap.data()?.valorations || [];
			const hasRated = valorations.some(
				(v: any) => v.id_user === user_id
			);

			if (hasRated) {
				return [
					ErrorControl.PERSONALIZED,
					"User has already rated this user",
					HttpStatusCode.Conflict,
				];
			}

			await updateDoc(docRef, {
				valorations: arrayUnion({
					id_user: user_id,
					rate: rate,
					created_at: getDateTime(),
				}),
			});

			return [
				ErrorControl.SUCCESS,
				"User valorated",
				HttpStatusCode.Created,
			];
		} catch (error) {
			const msg = "Error updating document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}
}
