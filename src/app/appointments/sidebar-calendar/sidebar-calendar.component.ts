import { SelectPickerComponent } from '../../ng-material-components/modules/forms/select-picker/select-picker.component';
import { objectWithoutProperties } from '../../shared/helpers/object.helpers';
import { UserService } from '../../shared/services/user.service';
import { IUserInfo, IUserPreference } from '../../shared/models/user';

import { AfterViewInit, Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Moment } from 'moment';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';

import { isString, isEmpty } from 'lodash';
import { Apollo } from 'apollo-angular';
import { MenuItem, SelectionItem } from '../../ng-material-components';
import {
    IDayCalendarConfig,
} from '../../ng-material-components/modules/forms/date-picker/day-calendar/day-calendar-config.model';
import { IDay } from '../../ng-material-components/modules/forms/date-picker/day-calendar/day.model';
import { StoreHelper } from '../../shared/services';
import { ApolloService } from '../../shared/services/apollo.service';
import { IAppointment } from '../shared/models/appointment.model';
import { cleanAppointemntsProviderId } from './../../shared/helpers/appointments.helper';
import { Store } from './../../shared/services/store.service';

const appointmentsByDate = require('./appointments-by-date.gql');
const AppointmentProvidersListQuery = require('./appointment-providers-list.query.gql');
const SearchAppointmentsQuery = require('./search-appointments.query.gql');
const updateUserPreferenceMutation = require('./update-user-preference.mutation.gql');

@Component({
    selector: 'kpi-sidebar-calendar',
    templateUrl: './sidebar-calendar.component.pug',
    styleUrls: ['./sidebar-calendar.component.scss']
})
export class SidebarCalendarComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('providerpicker') providerpicker: SelectPickerComponent;
    selectedDay: Moment;
    selectedProvider: string;
    fg: FormGroup = new FormGroup({});

    providerList: SelectionItem[] = [];

    actionItems: MenuItem[] = [{
        id: 'more',
        icon: 'more-vert',
        children: [{
                id: 'edit',
                icon: 'edit',
                title: 'Edit'
            },
            {
                id: 'delete',
                icon: 'delete',
                title: 'Delete'
            }
        ]
    }];

    appointments: IAppointment[];

    calendarConfig: IDayCalendarConfig = {
        firstDayOfWeek: 'mo',
        monthFormat: 'MMMM YYYY'
    };

    subscriptions: Subscription[] = [];
    loadingAppointments = false;
    currentUser: IUserInfo;

    constructor(private _apolloService: ApolloService,
                private _apollo: Apollo,
                private _cdr: ChangeDetectorRef,
                private _store: Store,
                private _storeHelper: StoreHelper,
                private _userSvc: UserService) {
        const that = this;
        this.subscriptions.push(
            this._userSvc.user$
                .distinctUntilChanged()
                .subscribe(user => {
                    if (user) {
                        that.currentUser = user;
                        that._updateProviderStore(user);
                    }
                })
        );
    }

    ngOnInit() {
        const that = this;
        that.selectedDay = moment();
        this.selectedProvider = this._store.getState().selectedAppointmentsProvider;
        this.subscriptions.push(
            this._store.changes$
                            .map(c => c.selectedAppointmentsProvider)
                            .debounceTime(250)
                            .subscribe(selectedProviders => {
            that.providerList = that.providerList.map(p =>
                new SelectionItem(  p.id,
                                    p.title,
                                    selectedProviders && cleanAppointemntsProviderId(selectedProviders).includes(String(p.id)))
            );
            that.selectedProvider = selectedProviders;
            that._setProviderValue(that.selectedProvider);
            that._cdr.detectChanges();
            that._loadAppointmentsFor(that.selectedDay);
        }));
        this.fetchProviders();
    }

    ngAfterViewInit() {
        const that = this;
        this.subscriptions.push(this.fg.get('provider').valueChanges
            .distinctUntilChanged()
            .subscribe(v => {
                that._storeHelper.update('selectedAppointmentsProvider', v);
                that.updateProviderPreference(v);
            }));
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    fetchProviders() {
        const that = this;
        this._apolloService.networkQuery(AppointmentProvidersListQuery)
        .then(result => {
          that.providerList = result.appointmentProvidersList.map(p =>
            new SelectionItem(p.externalId, p.name,
                              that.selectedProvider && cleanAppointemntsProviderId(that.selectedProvider).includes(String(p.externalId))));
        });
    }

    onDaySelected(day: IDay): void {
        this._loadAppointmentsFor(day.date);
    }

    updateProviderPreference(provider: string): void {
        if (!this.currentUser || !this.currentUser._id) {
            return;
        }

        const that = this;
        let providers = [];

        if (provider) {
            providers = provider.split('|');
        }

        this.subscriptions.push(
            this._apollo.mutate({
                mutation: updateUserPreferenceMutation,
                variables: {
                    id: this.currentUser._id,
                    input: {
                        providers: providers
                    }
                },
                refetchQueries: ['User']
            }).subscribe(({ data }) => {})
        );
    }

    private _setProviderValue(selectedProvider: string): void {
        if (this.fg && !isEmpty(this.fg.controls)) {
            if (this.fg.controls['provider'].value !== selectedProvider) {
                if (!selectedProvider) {
                    this.fg.controls['provider'].reset(selectedProvider);
                } else {
                    this.fg.controls['provider'].setValue(selectedProvider);
                }


                // clear all items from the select picker
                if (!selectedProvider) {
                    if (this.providerpicker && this.providerpicker.resetSelectedItems) {
                        this.providerpicker.resetSelectedItems();
                    }
                }
            }
        }
    }

    private _loadAppointmentsFor(date: Moment): void {
        const that = this;
        this.selectedDay = date;
        this.loadingAppointments = true;

        const cancelled = this._store.getState().showAppointmentCancelled;

        this._apolloService.networkQuery(SearchAppointmentsQuery, {
                criteria: {
                    date: date.toISOString(),
                    provider: cleanAppointemntsProviderId(this.selectedProvider),
                    cancelled: cancelled
                }
            })
            .then(res => {
                this.loadingAppointments = false;
                that.appointments = res.searchAppointments;
            });
    }

    private _updateProviderStore(user: IUserInfo): void {
        if (user.preferences && user.preferences.providers) {
            this._storeHelper.update('selectedAppointmentsProvider', user.preferences.providers);
        }
    }
}
