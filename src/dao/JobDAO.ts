import { createDebugger } from "../utils/debugConfig";
import { AvailableStatus, Job } from "../entities/Job";
import {
	addDoc,
	and,
	collection,
	deleteDoc,
	doc,
	limit,
	startAfter,
	getDocs,
	query,
	updateDoc,
	where,
	orderBy,
	DocumentSnapshot,
	arrayUnion,
	getDoc,
	DocumentReference,
} from "firebase/firestore";
import { db } from "../service/firebaseDB";
import { DaoResponse, ErrorControl } from "../constants/ErrorControl";
import { HttpStatusCode } from "axios";
import { User } from "../entities/User";

// logger config
const log = createDebugger("JobDAO");
const logError = log.extend("error");

export class JobDAO {
	protected static async add(
		job: Job,
		id_user: string
	): Promise<DaoResponse> {
		try {
			const jobJson = job.toSaveJson();
			const jobsRef = collection(db, Job.COLLECTION);
			const userRef = doc(db, User.COLLECTION, id_user);
			jobJson.id_creator = userRef;
			const docRef = await addDoc(jobsRef, jobJson);
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

	protected static async getAll(): Promise<DaoResponse> {
		try {
			const jobsRef = collection(db, Job.COLLECTION);
			const docs = await getDocs(jobsRef);
			if (docs.empty) {
				return [ErrorControl.SUCCESS, [], HttpStatusCode.Ok];
			}

			const nextJobs = docs.docs.map((doc) =>
				Job.toJson(Job.fromJson({ ...doc.data(), id_job: doc.id }))
			);
			return [ErrorControl.SUCCESS, nextJobs, HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error getting documents";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async get(id_job: string): Promise<DaoResponse> {
		try {
			const jobsRef = collection(db, Job.COLLECTION);
			const q = query(jobsRef, where("__name__", "==", id_job));
			const querySnapshot = await getDocs(q);
			if (querySnapshot.empty) {
				return [
					ErrorControl.PERSONALIZED,
					"Job not found",
					HttpStatusCode.NotFound,
				];
			}
			return [
				ErrorControl.SUCCESS,
				Job.toJson(
					Job.fromJson({
						...querySnapshot.docs[0].data(),
						id_job: querySnapshot.docs[0].id,
					})
				),
				HttpStatusCode.Ok,
			];
		} catch (error) {
			const msg = "Error getting document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async update(
		job: Job,
		id_job: string,
		id_user: string
	): Promise<DaoResponse> {
		try {
			const jobsRef = collection(db, Job.COLLECTION);
			const userdocRef = doc(db, User.COLLECTION, id_user);
			const q = query(
				jobsRef,
				and(
					where("id_creator", "==", userdocRef),
					where("__name__", "==", id_job)
				)
			);
			const querySnapshot = await getDocs(q);
			const docRef = querySnapshot.docs[0].ref;
			await updateDoc(docRef, job.toSaveJson());
			return [ErrorControl.SUCCESS, docRef.id, HttpStatusCode.Ok];
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

	protected static async delete(
		id_job: string,
		id_user: string
	): Promise<DaoResponse> {
		try {
			const jobsRef = collection(db, Job.COLLECTION);
			const userdocRef = doc(db, User.COLLECTION, id_user);
			const q = query(
				jobsRef,
				and(
					where("id_creator", "==", userdocRef),
					where("__name__", "==", id_job)
				)
			);
			const querySnapshot = await getDocs(q);
			const docRef = querySnapshot.docs[0].ref;
			await deleteDoc(docRef);
			return [ErrorControl.SUCCESS, docRef.id, HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error deleting document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async getUserJobs(id_user: string): Promise<DaoResponse> {
		try {
			const jobsRef = collection(db, Job.COLLECTION);
			const userdocRef = doc(db, User.COLLECTION, id_user);
			const q = query(jobsRef, where("id_creator", "==", userdocRef));
			const querySnapshot = await getDocs(q);
			if (querySnapshot.empty) {
				return [ErrorControl.SUCCESS, [], HttpStatusCode.Ok];
			}
			const jobs = querySnapshot.docs.map((doc) =>
				Job.fromJson({ ...doc.data(), id_job: doc.id })
			);
			return [
				ErrorControl.SUCCESS,
				jobs.map((job) => Job.toJson(job)),
				HttpStatusCode.Ok,
			];
		} catch (error) {
			const msg = "Error deleting document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async aplyJob(
		id_job: string,
		id_user: string
	): Promise<DaoResponse> {
		const userdocRef = doc(db, User.COLLECTION, id_user);
		const jobdocRef = doc(db, Job.COLLECTION, id_job);
		try {
			await updateDoc(jobdocRef, {
				applicants: arrayUnion({
					id_user: userdocRef,
					status: AvailableStatus.PENDIENTE,
				}),
			});
			return [
				ErrorControl.SUCCESS,
				"Job applied",
				HttpStatusCode.Created,
			];
		} catch (error) {
			const msg = "Error deleting document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async getAppliedJobs(
		id_user: string
	): Promise<DaoResponse> {
		try {
			const userdocRef = doc(db, User.COLLECTION, id_user);
			const q = query(
				collection(db, Job.COLLECTION),
				where("applicants", "!=", null)
			);
			const querySnapshot = await getDocs(q);
			if (querySnapshot.empty) {
				return [ErrorControl.SUCCESS, [], HttpStatusCode.Ok];
			}

			const jobs = querySnapshot.docs
				.filter((doc) => {
					const applicants = doc.data().applicants || [];
					return applicants.some(
						(applicant: { id_user: DocumentReference }) =>
							applicant.id_user.id === userdocRef.id
					);
				})
				.map((doc) => Job.fromJson({ ...doc.data(), id_job: doc.id }));
			return [
				ErrorControl.SUCCESS,
				jobs.map((job) => Job.toJson(job)),
				HttpStatusCode.Ok,
			];
		} catch (error) {
			const msg = "Error fetching applied jobs";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}
	protected static async getApplicants(id_job: string): Promise<DaoResponse> {
		try {
			const jobdocRef = doc(db, Job.COLLECTION, id_job);
			const querySnapshot = await getDoc(jobdocRef);

			if (!querySnapshot.exists()) {
				return [
					ErrorControl.ERROR,
					"Job not found",
					HttpStatusCode.NotFound,
				];
			}

			const applicants = querySnapshot.data().applicants || [];
			if (applicants.length === 0) {
				return [ErrorControl.SUCCESS, [], HttpStatusCode.Ok];
			}

			const usersPromises = applicants.map(
				async (applicant: {
					id_user: DocumentReference;
					status: AvailableStatus;
					data: any;
				}) => {
					const docSnap = await getDoc(applicant.id_user);
					if (docSnap.exists()) {
						const user = User.fromJson({
							...docSnap.data(),
							id_user: docSnap.id,
						});
						user.deletePassword();
						return {
							...user,
							status: applicant.status,
							data: applicant.data ?? undefined,
						};
					}
					return null;
				}
			);

			const users = (await Promise.all(usersPromises)).filter(Boolean);

			return [ErrorControl.SUCCESS, users, HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error fetching applicants";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async changeApplicationStatus(
		id_job: string,
		id_user: string,
		status: AvailableStatus,
		data: any
	): Promise<DaoResponse> {
		const userdocRef = doc(db, User.COLLECTION, id_user);
		const jobdocRef = doc(db, Job.COLLECTION, id_job);
		try {
			const querySnapshot = await getDoc(jobdocRef);

			if (!querySnapshot.exists()) {
				return [
					ErrorControl.ERROR,
					"Job not found",
					HttpStatusCode.NotFound,
				];
			}

			const applicants = querySnapshot.data().applicants || [];

			const applicant = applicants.find(
				(applicant: {
					id_user: DocumentReference;
					status: AvailableStatus;
				}) => applicant.id_user.id === userdocRef.id
			);

			if (!applicant) {
				return [
					ErrorControl.ERROR,
					"Applicant not found",
					HttpStatusCode.NotFound,
				];
			}

			const updadtedApplicant = [
				...applicants.filter(
					(applicant: { id_user: DocumentReference }) =>
						applicant.id_user.id !== userdocRef.id
				),
				{
					...applicant,
					status,
					data: data && data != "" ? data : applicant.data,
				},
			];

			await updateDoc(jobdocRef, {
				applicants: updadtedApplicant,
			});
			return [
				ErrorControl.SUCCESS,
				"Application status updated successfully",
				HttpStatusCode.Ok,
			];
		} catch (error) {
			const msg = "Error fetching applicants";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}
}
