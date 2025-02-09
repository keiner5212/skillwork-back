import { getDeltaTime } from "./Time";


export class Cache {

    private static instance: {
        [key: string]: {
            data: any,
            savedAt: Date,
            lifetime: number,
            infinite: boolean
        }
    } = {};

    public static get(key: string): any {
        // if not in cache, return null
        if (!this.instance[key]) {
            return null;
        }

        // if expired, delete from cache and return null
        const data = this.instance[key];
        if (getDeltaTime(data.savedAt) > data.lifetime) {
            delete this.instance[key];
            return null;
        }

        // if not expired, return data
        return data.data;
    }

    public static delete(key: string): void {
        delete this.instance[key];
    }

    public static makeInfinite(key: string): void {
        this.instance[key].infinite = true;
    }

    public static set(key: string, value: any, lifetime?: number): void {
        this.instance[key] = {
            data: value,
            savedAt: new Date(),
            lifetime: lifetime ?? 5 * 60 * 1000 /* 5 minutes of lifetime by default */,
            infinite: false
        };
    }
}
