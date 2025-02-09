import dayjs from "dayjs";

export function getDeltaTime(time: Date) {
    return new Date().getTime() - time.getTime();
}

export function getDateTime() {
    const now = new Date();
    const formattedDate = dayjs(now).format('YYYY-MM-DD');
    return formattedDate;
}