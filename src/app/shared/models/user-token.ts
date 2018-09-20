import { ICompanyInfo } from '../services/local-storage.service';
import * as moment from 'moment';

export interface IUserToken {
    issued: moment.Moment;
    expires: moment.Moment;
    access_token: string;
    // company info
    subdomain: string;
    companyName: string;
    email: string;
    fullName: string;

    companyInfo: ICompanyInfo;
}

export class UserToken implements IUserToken {
    issued: moment.Moment;
    expires: moment.Moment;
    access_token: string;
    // company info
    subdomain: string;
    companyName: string;
    email: string;
    fullName: string;

    constructor(info: IUserToken) {
        if (!info || !info.access_token || !info.expires) { throw new Error('Invalid token'); }

        const parseDateAsString = moment(info['issued']).isValid();

        this.issued = parseDateAsString ? moment(info['issued']) : moment(Number(info['issued']));
        this.expires = parseDateAsString ? moment(info['expires']) : moment(Number(info['issued']));
        this.access_token = info['access_token'];

        this.subdomain = info.subdomain;
        this.companyName = info.companyName;
        this.email = info.email;
        this.fullName = info.fullName;
    }

    get companyInfo(): ICompanyInfo {
        return {
            // company info
            subdomain: this.subdomain,
            companyName: this.companyName,
            email: this.email,
            fullName: this.fullName
        };
    }
}
