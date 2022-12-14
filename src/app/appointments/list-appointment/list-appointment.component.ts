import { AKPIDateFormatEnum } from '../../shared/models/date-range';
import { SelectPickerComponent } from '../../ng-material-components/modules/forms/select-picker/select-picker.component';
import { IUserInfo } from '../../shared/models';
import { UserService } from '../../shared/services/user.service';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarDateFormatter, CalendarEvent, CalendarEventAction } from 'angular-calendar';
import { Apollo } from 'apollo-angular';
import { isSameDay, isSameMonth } from 'date-fns';
import * as moment from 'moment-timezone';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { isEmpty, isBoolean, isString } from 'lodash';

import { ModalComponent, SelectionItem } from '../../ng-material-components';
import { ViewAppointmentActivity } from '../../shared/authorization/activities/appointments/view-appointment.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { StoreHelper } from '../../shared/services';
import { IAppointment } from '../shared/models/appointment.model';
import { cleanAppointmentsProviderId, cleanAppointmentsResourceId } from '../../shared/helpers/appointments.helper';
import { Store } from '../../shared/services/store.service';
import { CustomDateFormatter } from './custom-date-formatter.provider';
import { generateTimeZoneOptions } from '../../shared/helpers/timezone.helper';
import { BrowserService } from 'src/app/shared/services/browser.service';
import { get } from 'lodash';

// import { AddEditAppointmentComponent } from '../add-edit-appointment/add-edit-appointment.component';

enum MobileCalendarEnum {
    classic = 'classic',
    modern = 'modern'
}

export interface IAppointmentPreferences {
    showAppointmentCancelled?: boolean;
    mobileCalendar?: MobileCalendarEnum;
    resources?: string[];
}

const AppointmentProvidersListQuery = require('graphql-tag/loader!./appointment-providers-list.query.gql');
const AppointmentResourcesListQuery = require('graphql-tag/loader!./appointment-resources-list.query.gql');
const SearchAppointmentsQuery = require('graphql-tag/loader!./search-appointments.query.gql');
const updateUserPreference = require('graphql-tag/loader!./update-user-preference.mutation.gql');

const colors: any = {
    red: {
        primary: '#ad2121',
        secondary: '#FAE3E3',
    },
    blue: {
        primary: '#2fb6fc',
        secondary: '#555',
    },
    yellow: {
        primary: '#e3bc08',
        secondary: '#FDF1BA',
    },
    white: {
        primary: '#FFF',
        secondary: '#FFF',
    },
};

interface ExtendedCalendarEvent extends CalendarEvent {
    id: string;
    fullName?: string;
    provider?: string;
    state?: string;
    name?: string;
}

@Activity(ViewAppointmentActivity)
@Component({
    selector: 'kpi-list-appointment',
    // changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './list-appointment.component.pug',
    styleUrls: ['./list-appointment.component.scss'],
    providers: [
        {
            provide: CalendarDateFormatter,
            useClass: CustomDateFormatter,
        },
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListAppointmentComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('eventInfoModal') eventInfoModal: ModalComponent;
    @ViewChild('resourcesPicker') resourcesPicker: SelectPickerComponent;

    loading: boolean;

    mobileCalendar = MobileCalendarEnum.modern;
    classicCalendarInitialized = false;

    resourcesList: SelectionItem[] = [];

    fg = new FormGroup({});

    options: string[] = ['MONTH', 'WEEK', 'DAY'];

    timeZones: any[] = [];

    modalHeader: string;
    appointmentModel: IAppointment;

    // refresh: Subject<any> = new Subject();

    events: ExtendedCalendarEvent[];
    eventsSubject = new BehaviorSubject<ExtendedCalendarEvent[]>([]);

    view = 'month';
    viewDate: Date = new Date();
    activeDayIsOpen = true;

    actions: CalendarEventAction[] = [];

    eventModalData: {
        action: string;
        event: any;
    };

    localTimeZone: string;
    timeZonesList: SelectionItem[] = [];

    // selectedProvider: string;
    selectedResource: string;

    subscriptions: Subscription[] = [];

    user: IUserInfo;
    apptCancelledPreference: boolean;
    preventEmitClick = false;

    private selectedResources: string;

    constructor(
        private _apollo: Apollo,
        private _route: Router,
        private _cdr: ChangeDetectorRef,
        private _store: Store,
        private _storeHelper: StoreHelper,
        private _userService: UserService,
        private _browser: BrowserService,
    ) {
        const that = this;
        this.subscriptions.push(
            this._userService.user$.distinctUntilChanged().subscribe((user: IUserInfo) => {
                that.user = user;
                if (user) {
                    // that._updateProviderStore(user);
                    that._updateResourceStore(user);
                    that._setAppointmentCancelled(user);
                }
            }),
        );
    }

    ngOnInit() {
        this.mobileCalendar = get(this._userService.user, 'preferences.mobileCalendar') || MobileCalendarEnum.modern;

        // if we are in mobile we do not need to continue here
        // we are only showing the sidebar calendar instead
        if (this.shouldDisplayModernCalendar) {
            return;
        }

        this.initializeClassicCalendarOnInit();
    }

    ngAfterViewInit() {
        // if we are in mobile we do not need to continue here
        // we are only showing the sidebar calendar instead
        if (this.shouldDisplayModernCalendar) {
            return;
        }

        this.initializeClassicCalendarAfterViewInit();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    get isMobile(): boolean {
        return this._browser.isMobile();
    }

    initializeClassicCalendarOnInit() {
        const that = this;

        this.localTimeZone = moment.tz.guess();
        this.timeZonesList = generateTimeZoneOptions();

        this.selectedResource = this._store.getState().selectedAppointmentsResource;

        this.subscriptions.push(
            this._store.changes$
                .map(c => c.selectedAppointmentsResource)
                .debounceTime(250)
                .subscribe(selectedResources => {
                    if (this.selectedResource === selectedResources) {
                        return;
                    }

                    this.selectedResource = selectedResources;

                    const updatedResourcesList = that.resourcesList.map(
                        p =>
                            new SelectionItem(
                                p.id,
                                p.title,
                                selectedResources &&
                                    cleanAppointmentsProviderId(selectedResources).includes(String(p.id)),
                            ),
                    );
                    that.resourcesList = updatedResourcesList;
                    that.selectedResource = selectedResources;
                    that._setResourceValue(that.selectedResource);

                    that._cdr.detectChanges();
                    that.fetchEvents();
                }),
        );

        this.fetchEvents();
        this.fetchResources();
    }

    initializeClassicCalendarAfterViewInit() {
        const that = this;

        this.fg.controls['cancelled'].setValue(this.apptCancelledPreference);

        this.subscriptions.push(
            this.fg.get('cancelled').valueChanges.subscribe(cancelled => {
                // check if cancelled is true or false
                if (!isBoolean(cancelled)) {
                    return;
                }
                // update store
                that._storeHelper.update('showAppointmentCancelled', cancelled);
                that.updateUserPreferences({ showAppointmentCancelled: cancelled });
                that.apptCancelledPreference = cancelled;
            }),
        );

        this.subscriptions.push(
            this.fg
                // .get('provider')
                .get('resource')
                .valueChanges.distinctUntilChanged()
                .subscribe(v => {
                    // that._storeHelper.update('selectedAppointmentsProvider', v);
                    that._storeHelper.update('selectedAppointmentsResource', v);
                    // that.updateProviderPreference(v);
                    const resources = (v || '').split('|');
                    that.updateUserPreferences({ resources });
                }),
        );

        this._cdr.detectChanges();
        this.classicCalendarInitialized = true;
    }

    fetchEvents() {
        const that = this;
        this.loading = true;

        this._setUserPreference();

        this.subscriptions.push(
            this._apollo
                .query({
                    query: SearchAppointmentsQuery,
                    variables: {
                        criteria: {
                            ...that.getAppointmentsDateRange(),
                            // provider: cleanAppointmentsProviderId(that.selectedProvider),
                            resource: cleanAppointmentsResourceId(that.selectedResource),
                            cancelled: this.apptCancelledPreference,
                        },
                    },
                    fetchPolicy: 'network-only',
                })
                .subscribe(result => {
                    that.events = (<any>result.data).searchAppointments.map(a => {
                        const timeZone = this.user.profile.timezone;

                        let from, to;

                        const fromStr = moment(a.from)
                            .tz(timeZone)
                            .format(AKPIDateFormatEnum.US_DATE_HOUR);
                        from = moment(fromStr, AKPIDateFormatEnum.US_DATE_HOUR).toDate();

                        const momentTo = moment(a.to).tz(timeZone);
                        if (momentTo.isValid()) {
                            const toStr = momentTo.format(AKPIDateFormatEnum.US_DATE_HOUR);
                            to = moment(toStr, AKPIDateFormatEnum.US_DATE_HOUR).toDate();
                        } else {
                            to = from;
                        }

                        const provider = a.provider || [];
                        const customer = a.customer || {};
                        const event = a.event || {};

                        const appointmentCalendar: ExtendedCalendarEvent = {
                            id: a._id,
                            start: from,
                            end: to,
                            title: a.reason || a.appointmentType,
                            color: { primary: event.color, secondary: event.color },
                            name: event.name || 'Not provided',
                            actions: this.actions,
                            fullName: customer.fullname,
                            provider: provider.map(p => p.name).join('; '),
                            state: a.state,
                        };
                        return appointmentCalendar;
                    });
                    // filter blanks
                    // .filter(appointment => appointment.title && appointment.title.length);
                    that.eventsSubject.next(that.events);

                    this.loading = false;
                }),
        );
    }

    // fetchProviders() {
    //     const that = this;

    //     this._setUserPreference();

    //     this.subscriptions.push(
    //         this._apollo
    //             .query({
    //                 query: AppointmentProvidersListQuery,
    //                 fetchPolicy: 'network-only',
    //             })
    //             .subscribe(result => {
    //                 that.providerList = (<any>result.data).appointmentProvidersList.map(
    //                     p =>
    //                         new SelectionItem(
    //                             p.externalId,
    //                             p.name,
    //                             that.selectedProvider &&
    //                                 cleanAppointmentsProviderId(that.selectedProvider).includes(String(p.externalId)),
    //                         ),
    //                 );
    //             }),
    //     );
    // }

    fetchResources() {
        const that = this;

        this._setUserPreference();

        this.subscriptions.push(
            this._apollo
                .query({
                    query: AppointmentResourcesListQuery,
                    fetchPolicy: 'network-only',
                })
                .subscribe(result => {
                    that.resourcesList = (<any>result.data).appointmentResourcesList.map(
                        p =>
                            new SelectionItem(
                                p.externalId,
                                p.name,
                                that.selectedResource &&
                                    cleanAppointmentsProviderId(that.selectedResource).includes(String(p.externalId)),
                            ),
                    );
                }),
        );
    }

    // updateApptPreference(preferences: IAppointmentPreferences): void {
    //     this.subscriptions.push(
    //         this._apollo
    //             .mutate({
    //                 mutation: updateUserPreference,
    //                 variables: {
    //                     id: this.user._id,
    //                     input: preferences,
    //                 },
    //                 refetchQueries: ['User'],
    //             })
    //             .subscribe(({ data }) => {}),
    //     );
    // }

    updateUserPreferences(preferences: IAppointmentPreferences): void {
        this.subscriptions.push(
            this._apollo
                .mutate({
                    mutation: updateUserPreference,
                    variables: {
                        id: this.user._id,
                        input: preferences,
                    },
                    refetchQueries: ['User'],
                })
                .subscribe(({ data }) => {}),
        );
    }

    // updateProviderPreference(provider: string): void {
    //     if (!this.user || !this.user._id) {
    //         return;
    //     }

    //     const that = this;
    //     let providers = [];

    //     if (provider) {
    //         providers = provider.split('|');
    //     }

    //     this.subscriptions.push(
    //         this._apollo
    //             .mutate({
    //                 mutation: updateUserPreference,
    //                 variables: {
    //                     id: this.user._id,
    //                     input: {
    //                         providers: providers,
    //                     },
    //                 },
    //                 refetchQueries: ['User'],
    //             })
    //             .subscribe(({ data }) => {}),
    //     );
    // }

    // updateResourcePreference(resource: string): void {
    //     if (!this.user || !this.user._id) {
    //         return;
    //     }

    //     const that = this;
    //     let resources = [];

    //     if (resource) {
    //         resources = resource.split('|');
    //     }

    //     this.subscriptions.push(
    //         this._apollo
    //             .mutate({
    //                 mutation: updateUserPreference,
    //                 variables: {
    //                     id: this.user._id,
    //                     input: { resources },
    //                 },
    //                 refetchQueries: ['User'],
    //             })
    //             .subscribe(({ data }) => {}),
    //     );
    // }

    get viewValue(): string {
        return this.view.toUpperCase();
    }

    getAppointmentsDateRange(): any {
        let start;
        let end;

        // lets take 1 day/week/month before, and after, for faster results in the view
        start = moment(this.viewDate)
            .subtract(1, <any>this.view)
            .startOf(<any>this.view)
            .toLocaleString();
        end = moment(this.viewDate)
            .add(1, <any>this.view)
            .endOf(<any>this.view)
            .toLocaleString();

        return { startDate: start, endDate: end };
    }

    onViewSelected(newView: string) {
        this.view = newView.toLocaleLowerCase();
        this.fetchEvents();
    }

    dayClicked({ date, events }: { date: Date; events: ExtendedCalendarEvent[] }): void {
        if (isSameMonth(date, this.viewDate)) {
            if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
                this.activeDayIsOpen = false;
            } else {
                this.activeDayIsOpen = true;
                this.viewDate = date;
            }
        }
    }

    statesColor(states) {
        switch (states) {
            case 'Pendient':
                return colors.red;
            case 'Cancel':
                return colors.blue;
            case 'Confirm':
                return colors.yellow;
            default:
                return colors.blue;
        }
    }

    handleEvent(action: string, event: CalendarEvent): void {
        this.eventModalData = { event, action };
        this.eventInfoModal.open('lg');
    }

    modalClose() {
        this.eventInfoModal.close();
    }

    get events$() {
        return this.eventsSubject.asObservable();
    }

    get nextCalendarVersion(): MobileCalendarEnum {
        return this.mobileCalendar === MobileCalendarEnum.classic
            ? MobileCalendarEnum.modern
            : MobileCalendarEnum.classic;
    }

    toggleCalendarVersion() {
        this.mobileCalendar = this.nextCalendarVersion;

        this.updateUserPreferences({ mobileCalendar: this.mobileCalendar });

        if (this.mobileCalendar === MobileCalendarEnum.classic
            && !this.classicCalendarInitialized) {
                setTimeout(() => {
                    this.initializeClassicCalendarOnInit();
                    this.initializeClassicCalendarAfterViewInit();
                }, 100);
        }
    }

    get shouldDisplayModernCalendar() {
        return this.isMobile && this.mobileCalendar === MobileCalendarEnum.modern;
    }

    // addEvent(): void {
    //   this.modalHeader = 'Add Appointment';
    //   this.appointmentModel = null;
    //   // this.addAppointmentComponent.show();
    // }

    // editEvent(event: ExtendedCalendarEvent) {
    //     this.modalHeader = 'Edit Appointment';
    //       this.appointmentModel = {
    //         _id: event.id,
    //         from: event.start,
    //       //   to: event.end,
    //         fullName: event.fullName,
    //         reason: event.title
    //       //   states: event.states
    //       };
    //       // this.addAppointmentComponent.show();
    // };

    // deleteEvent() {

    //   const that = this;
    //   this._apollo.mutate({
    //     mutation: DeleteAppointment,
    //     variables: {
    //       id: this.eventRemove.id
    //     }
    //   });
    //   this.removeEventModal.close();

    // };

    // cancelRemove(): void {
    //   this.removeEventModal.close();
    // }

    // private _setProviderValue(selectedProvider: string): void {
    //     if (this.fg && !isEmpty(this.fg.controls)) {
    //         if (this.fg.controls['provider'].value !== selectedProvider) {
    //             if (!selectedProvider) {
    //                 this.fg.controls['provider'].reset(selectedProvider);
    //             } else {
    //                 this.fg.controls['provider'].setValue(selectedProvider);
    //             }

    //             // clear all items from the select picker
    //             if (!selectedProvider) {
    //                 if (this.providerpicker && this.providerpicker.resetSelectedItems) {
    //                     this.providerpicker.resetSelectedItems();
    //                 }
    //             }
    //         }
    //     }
    // }


    private _setResourceValue(selectedResource: string): void {
        if (this.fg && !isEmpty(this.fg.controls)) {
            if (this.fg.controls['resource'].value !== selectedResource) {
                if (!selectedResource) {
                    this.fg.controls['resource'].reset(selectedResource);
                } else {
                    this.fg.controls['resource'].setValue(selectedResource);
                }

                // clear all items from the select picker
                if (!selectedResource) {
                    if (this.resourcesPicker && this.resourcesPicker.resetSelectedItems) {
                        this.resourcesPicker.resetSelectedItems();
                    }
                }
            }
        }
    }

    private _setUserPreference(): void {
        if (
            !this.user ||
            isEmpty(this.user.preferences) ||
            !isBoolean(this.user.preferences.showAppointmentCancelled)
        ) {
            this.apptCancelledPreference = false;
        }

        this.apptCancelledPreference = this.user.preferences.showAppointmentCancelled;
    }

    // private _updateProviderStore(user: IUserInfo): void {
    //     if (user.preferences && user.preferences.providers) {
    //         this._storeHelper.update('selectedAppointmentsProvider', user.preferences.providers);
    //     }
    // }

    private _updateResourceStore(user: IUserInfo): void {
        if (user.preferences && user.preferences.resources) {
            this._storeHelper.update('selectedAppointmentsResource', user.preferences.resources);
        }
    }

    // private _setTimeZone(user: IUserInfo): void {
    //   let timezone: string;

    //   if (this.fg && !isEmpty(this.fg.controls) && this.fg.controls['timezone']) {
    //     if (user && user.preferences.calendarTimeZone) {
    //       timezone = user.preferences.calendarTimeZone;
    //     } else if (user && user.profile && user.profile.timezone) {
    //       timezone = user.profile.timezone;
    //     } else {
    //       timezone = this.localTimeZone;
    //     }
    //   } else {
    //     timezone = this.localTimeZone;
    //   }

    //   this.fg.controls['timezone'].setValue(timezone);
    // }

    private _setAppointmentCancelled(user: IUserInfo): void {
        if (user.preferences && isBoolean(user.preferences.showAppointmentCancelled)) {
            if (this.fg && !isEmpty(this.fg.controls) && this.fg.controls['cancelled']) {
                this.fg.controls['cancelled'].setValue(user.preferences.showAppointmentCancelled);
            }
        }
    }

    //   private _updateCalendarTimeZone(timezoneChanges: Observable<any>): void {
    //     if (!timezoneChanges || !this.user || !this.user._id) {
    //       return;
    //     }

    //     const that = this;

    //     this.subscriptions.push(
    //       timezoneChanges
    //         .debounceTime(1000)
    //         .subscribe(timezone => {
    //             if (timezone) {
    //               that._apollo.mutate({
    //                 mutation: updateUserPreference,
    //                 variables: {
    //                   id: this.user._id,
    //                   input: {
    //                     calendarTimeZone: timezone
    //                   }
    //                 },
    //               }).subscribe(({ data }) => {});
    //             }
    //         })
    //     );
    //   }
    // }
}
