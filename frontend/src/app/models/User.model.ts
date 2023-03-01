export interface User {
    _id: string;
    email: string;
    verified: boolean;
    admin: boolean;
    validTill: number;
}
