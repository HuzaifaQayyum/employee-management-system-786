export interface Entry {
    _id: string;
    date: Date;
    noOfHrs: number;
    from: {
        _id: string;
        name: string;
    };
    to: {
        _id: string;
        name: string;
    };
    deleted?: boolean;
    updated?: boolean;
}
