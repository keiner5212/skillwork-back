import { getDateTime } from "../utils/Time";

export class User {
	public static readonly COLLECTION = "users";

	id_user?: string;
	name?: string;
	email?: string;
	description?: string;
	document_type?: string;
	document?: string;
	phone?: string;
	role?: number;
	password?: string;
	image?: string;
	categories?: string[];
	services?: string[];
	created_at?: Date;
	valorations?: {
		id_user?: string;
		rate?: number;
		created_at?: Date;
	}[];

	constructor(
		id_user?: string,
		name?: string,
		email?: string,
		description?: string,
		document_type?: string,
		document?: string,
		phone?: string,
		password?: string,
		role?: number,
		image?: string,
		categories?: string[],
		services?: string[],
		created_at?: Date,
		valorations?: {
			id_user?: string;
			rate?: number;
			created_at?: Date;
		}[]
	) {
		this.id_user = id_user;
		this.name = name;
		this.email = email;
		this.description = description;
		this.document_type = document_type;
		this.document = document;
		this.phone = phone;
		this.password = password;
		this.image = image;
		this.role = role;
		this.categories = categories;
		this.services = services;
		this.created_at = created_at;
		this.valorations = valorations;
	}

	public static fromJson(json: any): User {
		return new User(
			json.id_user,
			json.name,
			json.email,
			json.description,
			json.document_type,
			json.document,
			json.phone,
			json.password,
			json.role,
			json.image,
			json.categories,
			json.services,
			json.created_at,
			json.valorations
		);
	}

	public toSaveJson(): any {
		return {
			name: this.name ?? "Guest",
			email: this.email,
			description: this.description ?? "",
			document_type: this.document_type ?? "",
			document: this.document ?? "",
			phone: this.phone ?? "",
			password: this.password,
			created_at: getDateTime(),
			role: this.role ?? 1,
			categories: this.categories ?? [],
			services: this.services ?? [],
			valorations: this.valorations ?? [],
		};
	}

	public toUpdateJson(original: any): any {
		return {
			name: this.name ?? original.name ?? "",
			email: this.email ?? original.email ?? "",
			description: this.description ?? original.description ?? "",
			document_type: this.document_type ?? original.document_type ?? "",
			document: this.document ?? original.document ?? "",
			phone: this.phone ?? original.phone ?? "",
			image: this.image ?? original.image ?? "",
			categories: this.categories ?? original.categories ?? [],
			services: this.services ?? original.services ?? [],
			valorations: this.valorations ?? original.valorations ?? [],
		};
	}

	public deletePassword(): void {
		this.password = undefined;
	}

	public static fromJsonArray(jsonArray: any[]): User[] {
		return jsonArray.map((json: any) => User.fromJson(json));
	}
}
