import { getDateTime } from "../utils/Time";

export class Contract {

    public static readonly COLLECTION = "contracts";

    id_contract?: string;
    id_user?: string;
    id_job?: string;
    created_at?: Date;

    constructor(id_contract?: string, id_user?: string, id_job?: string, created_at?: Date) {
        this.id_contract = id_contract;
        this.id_user = id_user;
        this.id_job = id_job;
        this.created_at = created_at;
    }

    public static fromJson(json: any): Contract {
        return new Contract(
            json.id_contract,
            json.id_user,
            json.id_job,
            json.created_at
        );
    }

    public toSaveJson(): any {
        return {
            id_user: this.id_user,
            id_job: this.id_job,
            created_at: getDateTime(),
        };
    }

    public static fromJsonArray(jsonArray: any[]): Contract[] {
        return jsonArray.map((json: any) => Contract.fromJson(json));
    }

    /* json example
    {
        "id_user": "1",
        "id_job": "1",
    }
    */
}