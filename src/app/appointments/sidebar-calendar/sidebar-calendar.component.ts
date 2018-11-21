import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { isEmpty } from 'lodash';
import { Moment } from 'moment';
import * as moment from 'moment-timezone';
import { BehaviorSubject, Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';

import { MenuItem, SelectionItem } from '../../ng-material-components';
import {
    IDayCalendarConfig,
} from '../../ng-material-components/modules/forms/date-picker/day-calendar/day-calendar-config.model';
import { IDay } from '../../ng-material-components/modules/forms/date-picker/day-calendar/day.model';
import { SelectPickerComponent } from '../../ng-material-components/modules/forms/select-picker/select-picker.component';
import { cleanAppointemntsProviderId } from '../../shared/helpers/appointments.helper';
import { AKPIDateFormatEnum } from '../../shared/models/date-range';
import { IUserInfo } from '../../shared/models/user';
import { StoreHelper } from '../../shared/services';
import { ApolloService } from '../../shared/services/apollo.service';
import { Store } from '../../shared/services/store.service';
import { UserService } from '../../shared/services/user.service';
import { IAppointment } from '../shared/models/appointment.model';

const appointmentsByDate = require('graphql-tag/loader!./appointments-by-date.gql');
const AppointmentProvidersListQuery = require('graphql-tag/loader!./appointment-providers-list.query.gql');
const SearchAppointmentsQuery = require('graphql-tag/loader!./search-appointments.query.gql');
const updateUserPreferenceMutation = require('graphql-tag/loader!./update-user-preference.mutation.gql');

@Component({
    selector: 'kpi-sidebar-calendar',
    templateUrl: './sidebar-calendar.component.pug',
    styleUrls: ['./sidebar-calendar.component.scss']
})
export class SidebarCalendarComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('providerpicker') providerpicker: SelectPickerComponent;
    selectedProvider: string;
    fg: FormGroup = new FormGroup({});

    providerList: SelectionItem[] = [];
    optionsExpanded = false;
    showCalendar = false;

    appointments: IAppointment[];

    calendarConfig: IDayCalendarConfig = {
        firstDayOfWeek: 'mo',
        monthFormat: 'MMMM YYYY'
    };

    subscriptions: Subscription[] = [];
    loadingAppointments = false;
    currentUser: IUserInfo;

    localTimeZone: string;
    timezoneOffset: number;

    selectedDay$: Observable<Moment>;
    private daySubject = new BehaviorSubject<Moment>(null);
    private _lastDayApplied: Date;

    constructor(private _apolloService: ApolloService,
                private _apollo: Apollo,
                private _cdr: ChangeDetectorRef,
                private _store: Store,
                private _storeHelper: StoreHelper,
                private _userSvc: UserService) {

        this.selectedDay$ = this.daySubject.asObservable();

        this.localTimeZone = moment.tz.guess();
        this.subscriptions.push(
            this._userSvc.user$
                .distinctUntilChanged()
                .subscribe(user => {
                    if (user) {
                        this.currentUser = user;
                        this._updateProviderStore(user);
                        this.timezoneOffset = moment.tz(user.profile.timezone).utcOffset() - moment.tz(this.localTimeZone).utcOffset();
                    }
                })
        );
    }

    ngOnInit() {
        const that = this;

        this.subscriptions.push(this.selectedDay$.subscribe(d => this._loadAppointmentsFor(d)));

        // that.selectedDay = moment();
        this.daySubject.next(moment());

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

    next() {
        const d = this.daySubject.value.clone();
        this.daySubject.next(d.add(1, 'day'));
    }

    back() {
        const d = this.daySubject.value.clone();
        this.daySubject.next(d.subtract(1, 'day'));
    }

    toggleOptions() {
        this.showCalendar = !this.showCalendar;
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
        this.daySubject.next(day.date);
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
        if (!date || this._lastDayApplied === date.toDate()) {
            return;
        }

        this._lastDayApplied = date.toDate();
        const that = this;
        this.loadingAppointments = true;

        const cancelled = this._store.getState().showAppointmentCancelled;

        this._apolloService.networkQuery(SearchAppointmentsQuery, {
                criteria: {
                    date: date.format(AKPIDateFormatEnum.US_DATE),
                    provider: cleanAppointemntsProviderId(this.selectedProvider),
                    cancelled: cancelled
                }
            })
            .then(res => {
                this.loadingAppointments = false;

                if (!this.timezoneOffset) {
                    that.appointments = res.searchAppointments;
                    return;
                }

                that.appointments = res.searchAppointments.map(a => {
                    return {
                        ...a,
                        from: moment(a.from).add(this.timezoneOffset, 'minutes').toDate()
                     };
                });
            });
    }

    private _updateProviderStore(user: IUserInfo): void {
        if (user.preferences && user.preferences.providers) {
            this._storeHelper.update('selectedAppointmentsProvider', user.preferences.providers);
        }
    }
}
