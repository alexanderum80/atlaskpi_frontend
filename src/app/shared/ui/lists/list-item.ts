export interface IOrderField {
    fieldName: string;
    fieldValue: any;
    descripcion: string;
}
export interface IListItem {
    id: any;
    imagePath?: string;
    icon?: string;
    title?: string;
    subtitle?: string;
    extras?: any;
    visible?: boolean;
    selected?: boolean;
    createdBy?: string;
    createdDate?: Date;
    updatedBy?: string;
    updatedDate?: Date;
    orderFields?: IOrderField[];
    type?: string;
}
