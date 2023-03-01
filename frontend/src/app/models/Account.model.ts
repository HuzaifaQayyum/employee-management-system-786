export interface Account { 
    _id?: string;
    email: string;
    verified: boolean;
    createdAt: Date;
    admin: boolean;
    deleted?: boolean;
    updated?: boolean;
}