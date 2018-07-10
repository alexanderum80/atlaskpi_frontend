import { IAccountDetails } from '../../../shared/models/account';
import { validEmail } from '../../../shared/validators';
import { BusinessUnit } from '../../../shared/models';

export class SignupModel {

  // account info
  email: string;
  accountName: string;
  fullname: string;
  authorizationCode: string;

  // seed data?
  seedData = false;

  toAccountDetails(): IAccountDetails {
      return {  name: this.accountName,
                personalInfo: {
                    email: this.email,
                    fullname: this.fullname
                },
                authorizationCode: this.authorizationCode

      };
  }

  get isEmailInfoValid(): boolean {
      return this.email !== undefined && this.email !== '' && validEmail(this.email);
  }

  get isAccountInfoValid(): boolean {
    return this.accountName !== undefined && this.accountName !== '';
  }

  get isValid(): boolean {
    return this.isEmailInfoValid || this.isAccountInfoValid;
  }
}
