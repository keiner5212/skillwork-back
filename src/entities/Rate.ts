import { getDateTime } from "../utils/Time";

export class Rate {

    public static readonly COLLECTION = "rates";
    id_rate?: string;
    id_user?: string;
    id_job?: string;
    rate?: number;
    created_at?: Date;

    constructor(id_rate?: string, id_user?: string, id_job?: string, rate?: number, created_at?: Date) {
        this.id_rate = id_rate;
        this.id_user = id_user;
        this.id_job = id_job;
        this.rate = rate;
        this.created_at = created_at;
    }

    public static fromJson(json: any): Rate {
        return new Rate(
            json.id_rate,
            json.id_user,
            json.id_job,
            json.rate,
            json.created_at
        );
    }

    public toSaveJson(): any {
        return {
            id_user: this.id_user,
            id_job: this.id_job,
            rate: this.rate,
            created_at: getDateTime(),
        };
    }

    public static fromJsonArray(jsonArray: any[]): Rate[] {
        return jsonArray.map((json: any) => Rate.fromJson(json));
    }

	/* json example
    {
        "id_user": "1",
        "id_job": "1",
        "rate": "1",
    }
    */
}