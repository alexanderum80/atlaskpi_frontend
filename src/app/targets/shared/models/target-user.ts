export interface IBasicUser {
    _id: string;
    username: string;
    profile: {
        firstName: string;
        lastName: string;
    };
}
