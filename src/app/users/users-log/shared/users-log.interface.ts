export interface IUserslogs {
    timestamp: Date;
    accessBy: string;
    ipAddress: string;
    event: string;
    payload: string;
    clentDetails: string;
}
