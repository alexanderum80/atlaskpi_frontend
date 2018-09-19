
import { IPermission } from '../../../permissions/shared/models';
import { FormGroup } from '@angular/forms';
import { INewUser } from '../models';
import { ApolloQueryResult } from 'apollo-client';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { IMutationResponse } from '../../../shared/models';
import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { GraphQLService } from '../../../shared/services/graphql.service';
import { IUser } from '../models';
import { usersApi } from '../graphqlActions/userActions';

@Injectable()
export class UsersService extends GraphQLService<IUser> {
    private _forgotPasswordSubject = new BehaviorSubject<IMutationResponse>(null);
    private _resetPasswordSubject = new BehaviorSubject<IMutationResponse>(null);
    private _userSubject = new BehaviorSubject<IMutationResponse>(null);

    usersQueryData: QueryRef<any>;
    roleValid: boolean;

    constructor(private _apollo: Apollo) {
        super(_apollo, usersApi.search, ({data}) => data.users.data);
        // this.initQuery({ details: this.paginationDetailsSubject });
    }

    get users$(): Observable<IUser[]> {
        return this.store$;
    }

    sendForgotPasswordLink(email: string, companyName?: string): Observable<IMutationResponse>  {
        this._apollo.mutate({
            mutation: usersApi.forgotPassword,
                variables: {
                    email,
                    companyName
                }
        })
        .toPromise()
        .then((response) => {
            this._forgotPasswordSubject.next({ success: (<any>response.data).userForgotPassword.success });
        }, (err) => {
            this._forgotPasswordSubject.next({ errors: [
                { field: 'email', errors: ['There was an error sending the forgot password link'] }
            ]});
        });

        return this._forgotPasswordSubject.asObservable();
    }

    verifyResetPasswordToken(token: string, companyName?: string): Observable<ApolloQueryResult<any>> {
        return this._apollo.watchQuery({
            query: usersApi.verifyResetPasswordToken,
            variables: {
                token,
                companyName
            }
        }).valueChanges;
    }

    verifyEnrollmentToken(token: string): Observable<ApolloQueryResult<any>> {
        return this._apollo.watchQuery({
            query: usersApi.verifyEnrollmentToken,
            variables: {
                token
            }
        }).valueChanges;
    }

    resetPassword(token: string, password: string, enrollment = false,
                firstName?: string, lastName?: string, companyName?: string): Observable<IMutationResponse> {
        this._apollo.mutate({
            mutation: usersApi.resetPassword,
                variables: {
                    token,
                    password,
                    enrollment,
                    profile: {
                        firstName,
                        lastName
                    },
                    companyName
                }
        })
        .toPromise()
        .then((response) => {
            this._resetPasswordSubject.next({ success: (<any>response.data).resetPassword.success });
        }, (err) => {
            this._resetPasswordSubject.next({ errors: [
                { field: '', errors: ['There was an error changing your password'] }
            ]});
        });

        return this._resetPasswordSubject.asObservable();
    }

    createUser(data: INewUser): Observable<IMutationResponse> {
        this._apollo.mutate({
            mutation: usersApi.create, variables: data
        })
        .toPromise()
        .then((response) => {
            this.refetch();
            this._userSubject.next({ errors: (<any>response.data).createUser.errors });
        }, (err) => {
            this._userSubject.next({ errors: [
                { field: '', errors: ['There was an error creating this user'] }
            ]});
        });

        return this._userSubject.asObservable();
    }

    updateUser(id: string, data: INewUser): Observable<IMutationResponse> {
        this._apollo.mutate({
            mutation: usersApi.update,
            variables: {id, data}
        })
        .toPromise()
        .then((response) => {
            this.refetch();
            this._userSubject.next({ errors: (<any>response.data).updateUser.errors });
        }, (err) => {
            this._userSubject.next({ errors: [
                { field: '', errors: ['There was an error creating this user'] }
            ]});
        });

        return this._userSubject.asObservable();
    }

     removeUserById(id: string): Observable<IMutationResponse> {
        if (!id) { return; };
        this.apollo.mutate({
                mutation: usersApi.delete,
                variables: {
                   id: id,
                },
                refetchQueries: [
                    'AllUsers'
                ]
        })
        .toPromise()
        .then((response) => {
                if (this.hasOwnProperty('refetch')) {
                    this.refetch();
                };
                this._userSubject.next({ errors: (<any>response.data).removeUser.errors,
                                         entity: (<any>response.data).removeUser.user });
        }, (err) => {
            this._userSubject.next({ errors: [
                { field: '', errors: ['There was an error removing this kpi'] }
            ]});
        });

        return this._userSubject.asObservable();
    }

    User(id: string): Observable<ApolloQueryResult<any>> {
        return this._apollo.query({
            query: usersApi.read,
            variables: {
                id
            },
            fetchPolicy: 'network-only',
        });
    }

    getRoles(data: any) {
        const arr = [];
        const checkRoles = ['firstName', 'lastName', 'email'];
        for (const i in data) {
        if (checkRoles.indexOf(data) === -1) {
            if (data[i] === true) {
            arr.push(i);
            }
        }
        }
        return arr;
    }

    watchChanges(fg: FormGroup) {
        const that = this;
            fg.valueChanges
            .debounceTime(200)
            .distinctUntilChanged()
            .subscribe(roleInfo => {
                if (!roleInfo) {
                    return;
                }

                const watchRoleInfo = {
                    roles: that.getRoles(roleInfo)
                };
                that.roleValid = watchRoleInfo.roles.length ? true : false;
            });
    }

    isFormValid(fg: FormGroup) {
        return fg.valid && this.roleValid;
    }
}

