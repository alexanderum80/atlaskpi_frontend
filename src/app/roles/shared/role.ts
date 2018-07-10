export interface IRole {
    _id?: string;
    name: string;
    permissions: any[];
    timestamp?: Date|string;
}

export interface IRemoveResponse {
    removeRole: IRole;
}
export interface IRoleRemoveResponse {
    data: IRemoveResponse;
}
