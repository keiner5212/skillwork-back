import { DocumentReference } from "firebase/firestore";
import { getDateTime } from "../utils/Time";

export class AvailableStatus {
	static readonly PENDIENTE = "Pendiente";
	static readonly EN_COTIZACION = "En Cotizacion";
	static readonly EN_PROCESO = "En Proceso";
	static readonly EN_REVISION = "En Revision";
	static readonly TERMINADO = "Terminado";
	static readonly CANCELADO = "Cancelado";
}

export class Job {
	public static readonly COLLECTION = "jobs";

	id_job?: string;
	id_creator?: DocumentReference;
	title?: string;
	description?: string;
	location?: string;
	required_skills?: string[];
	salary?: number;
	categories?: string[];
	services?: string[];
	created_at?: Date;
	expired_at?: Date;
	applicants?: {
		id_user?: DocumentReference;
		status?: AvailableStatus;
		data?: any;
	}[];

	constructor(
		id_job?: string,
		id_creator?: DocumentReference,
		title?: string,
		description?: string,
		location?: string,
		required_skills?: string[],
		salary?: number,
		categories?: string[],
		services?: string[],
		created_at?: Date,
		expired_at?: Date,
		applicants?: {
			id_user?: DocumentReference;
			status?: AvailableStatus;
		}[]
	) {
		this.id_job = id_job;
		this.id_creator = id_creator;
		this.title = title;
		this.description = description;
		this.location = location;
		this.required_skills = required_skills;
		this.salary = salary;
		this.categories = categories;
		this.services = services;
		this.created_at = created_at;
		this.expired_at = expired_at;
		this.applicants = applicants;
	}

	public static toJson(job: Job): any {
		let applicantsData: any = [];
		if (job.applicants && job.applicants.length > 0) {
			applicantsData = job.applicants.map((app) => {
				if (app.id_user && app.id_user.id) {
					return {
						id_user: app.id_user.id,
						status: app.status,
						data: app.data,
					};
				}
			});
		}
		return {
			id_job: job.id_job ?? "",
			id_creator: job.id_creator?.id ?? "",
			title: job.title ?? "",
			description: job.description ?? "",
			location: job.location ?? "",
			required_skills: job.required_skills ?? [],
			salary: job.salary ?? 0,
			categories: job.categories ?? [],
			services: job.services ?? [],
			created_at: job.created_at ?? getDateTime(),
			expired_at: job.expired_at ?? getDateTime(),
			applicants: applicantsData,
		};
	}

	public static fromJson(json: any): Job {
		return new Job(
			json.id_job,
			json.id_creator,
			json.title,
			json.description,
			json.location,
			json.required_skills,
			json.salary,
			json.categories,
			json.services,
			json.created_at,
			json.expired_at,
			json.applicants
		);
	}

	public toSaveJson(): any {
		return {
			id_creator: this.id_creator ?? "",
			title: this.title ?? "",
			description: this.description ?? "",
			location: this.location ?? "",
			required_skills: this.required_skills ?? [],
			salary: this.salary ?? 0,
			categories: this.categories ?? [],
			services: this.services ?? [],
			created_at: getDateTime(),
			expired_at: this.expired_at ?? getDateTime(),
			applicants: this.applicants ?? [],
		};
	}

	public static fromJsonArray(jsonArray: any[]): Job[] {
		return jsonArray.map((json: any) => Job.fromJson(json));
	}

	/* json example
    {
        "id_creator": "1",
        "title": "title",
        "description": "description",
        "location": "location",
        "required_skills": ["skill1", "skill2"],
        "salary": 1000,
        "expired_at": "2022-01-01T00:00:00.000Z"
    }
    */
}
