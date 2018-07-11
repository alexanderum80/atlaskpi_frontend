import { SelectPickerComponent } from '../../ng-material-components/modules/forms/select-picker/select-picker.component';
import { IUserInfo } from '../../shared/models/index';
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
import { cleanAppointemntsProviderId } from './../../shared/helpers/appointments.helper';
import { Store } from './../../shared/services/store.service';
import { CustomDateFormatter } from './custom-date-formatter.provider';
import { generateTimeZoneOptions } from '../../shared/helpers/timezone.helper';

// import { AddEditAppointmentComponent } from '../add-edit-appointment/add-edit-appointment.component';

const Appointments = require('graphql-tag/loader!./appointments.gql');
const DeleteAppointment = require('graphql-tag/loader!./delete-appointment.gql');
const AppointmentProvidersListQuery = require('graphql-tag/loader!./appointment-providers-list.query.gql');
const SearchAppointmentsQuery = require('graphql-tag/loader!./search-appointments.query.gql');
const updateUserPreference = require('graphql-tag/loader!./update-user-preference.mutation.gql');

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#2fb6fc',
    secondary: '#555'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  },
  white: {
    primary: '#FFF',
    secondary: '#FFF'
  }
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
      useClass: CustomDateFormatter
    }
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListAppointmentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('eventInfoModal') eventInfoModal: ModalComponent;
  @ViewChild('providerpicker') providerpicker: SelectPickerComponent;
  // @ViewChild(AddEditAppointmentComponent) addAppointmentComponent: AddEditAppointmentComponent;
  // @ViewChild('removeEventModal') removeEventModal: ModalComponent;
  // @ViewChild('addAppointmentModal') addAppointmentModal: ModalComponent;

  providerList: SelectionItem[] = [];

  fg = new FormGroup({});

  options: string[] = [ 'MONTH', 'WEEK', 'DAY' ];

  timeZones: any[] = [];

  modalHeader: string;
  appointmentModel: IAppointment;

  // refresh: Subject<any> = new Subject();

  events: ExtendedCalendarEvent[];
  eventsSubject = new BehaviorSubject<ExtendedCalendarEvent[]>([]);

  // eventRemove: ExtendedCalendarEvent;
  // eventEdit: ExtendedCalendarEvent;
  // appointmentRemove: IAppointment;
  view = 'month';
  viewDate: Date = new Date();
  activeDayIsOpen = true;

  actions: CalendarEventAction[] = [
    // {
    //   label: '<i class="zmdi zmdi-edit"></i>',
    //   onClick: ({ event }: { event: ExtendedCalendarEvent }): void => {
    //   // this.editEvent(event);
    //   }
    // },
    // {
    //   label: '<i class="zmdi zmdi-delete c-red flex-nogrow" >',
    //   onClick: ({ event }: { event: ExtendedCalendarEvent }): void => {
    //     this.eventRemove = event;
    //     this.removeEventModal.open();

    //   }
    // }
  ];

  eventModalData: {
    action: string;
    event: any;
  };

  localTimeZone: string;
  timeZonesList: SelectionItem[] = [];
  selectedProvider: string;

  subscriptions: Subscription[] = [];

  user: IUserInfo;
  apptCancelledPreference: boolean;
  preventEmitClick = false;

  constructor(private _apollo: Apollo,
              private _route: Router,
              private _cdr: ChangeDetectorRef,
              private _store: Store,
              private _storeHelper: StoreHelper,
              private _userService: UserService
             ) {
    const that = this;
    this.subscriptions.push(
      this._userService.user$
      .distinctUntilChanged()
      .subscribe((user: IUserInfo) => {
        that.user = user;
        if (user) {
          that._updateProviderStore(user);
          that._setAppointmentCancelled(user);
        }
      }));
  }

  ngOnInit() {
    const that = this;

    this.localTimeZone = moment.tz.guess();
    this.timeZonesList = generateTimeZoneOptions();

    this.selectedProvider = this._store.getState().selectedAppointmentsProvider;
    this.subscriptions.push(
      this._store.changes$
           .map(c => c.selectedAppointmentsProvider)
           .debounceTime(250)
           .subscribe(selectedProviders => {
              const updatedProviderList = that.providerList.map(p =>
              new SelectionItem(  p.id,
                        p.title,
                        selectedProviders && cleanAppointemntsProviderId(selectedProviders).includes(String(p.id)))
              );
              that.providerList = updatedProviderList;
              that.selectedProvider = selectedProviders;
              that._setProviderValue(that.selectedProvider);
              that._cdr.detectChanges();
              that.fetchEvents();
            }));

    this.fetchEvents();
    this.fetchProviders();
  }

  ngAfterViewInit() {
    const that = this;

    this.fg.controls['cancelled'].setValue(this.apptCancelledPreference);

    this.subscriptions.push(this.fg.get('cancelled').valueChanges.subscribe(cancelled => {
      // check if cancelled is true or false
      if (!isBoolean(cancelled)) {
        return;
      }
      // update store
      that._storeHelper.update('showAppointmentCancelled', cancelled);
      that.updateApptPreference(cancelled);
      that.apptCancelledPreference = cancelled;
    }));

    this.subscriptions.push(this.fg.get('provider').valueChanges
      .distinctUntilChanged()
      .subscribe(v => {
        that._storeHelper.update('selectedAppointmentsProvider', v);
        that.updateProviderPreference(v);
      }));

    this._cdr.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  fetchEvents() {
    const that = this;
    this._setUserPreference();

    this.subscriptions.push(
      this._apollo.query({
            query: SearchAppointmentsQuery,
            variables: {
              criteria: {
                ... that.getAppointmentsDateRange(),
                provider: cleanAppointemntsProviderId(that.selectedProvider),
                cancelled: this.apptCancelledPreference
              }
            },
            fetchPolicy: 'network-only'
          })
          .subscribe(result => {
          that.events = (<any>result.data).searchAppointments.map(a => {
            const timeZone = this.user.profile.timezone;
            const offset = moment.tz(timeZone).utcOffset() - moment.tz(this.localTimeZone).utcOffset();

            // fix end date if it is not valid
            const momentTo = moment(a.to);
            const endDate = momentTo.isValid() ? a.to : a.from;

            const provider = a.provider || [];
            const customer = a.customer || {};
            const event = a.event || {};

            const appointmentCalendar: ExtendedCalendarEvent = {
                id: a._id,
                start: moment(a.from).add(offset, 'minutes').toDate(),
                end:  moment(endDate).add(offset, 'minutes').toDate(),
                title: a.reason || a.appointmentType,
                color: { primary: event.color, secondary: event.color },
                name: event.name || 'Not provided',
                actions: this.actions,
                fullName: customer.fullname,
                provider: provider.map(p => p.name).join('; '),
                state: a.state
              };
            return appointmentCalendar;
          });
          // filter blanks
          // .filter(appointment => appointment.title && appointment.title.length);
          that.eventsSubject.next(that.events);
      })
    );

  }

  fetchProviders() {
    const that = this;

    this._setUserPreference();

    this.subscriptions.push(
      this._apollo.query({
            query: AppointmentProvidersListQuery,
            fetchPolicy: 'network-only'
      })
      .subscribe(result => {
        that.providerList = (<any>result.data).appointmentProvidersList.map(p =>
          new SelectionItem(p.externalId, p.name,
                            that.selectedProvider && cleanAppointemntsProviderId(that.selectedProvider).includes(String(p.externalId)))
        );
      })
    );
  }

  updateApptPreference(cancelled: boolean): void {
    const payload = {
      showAppointmentCancelled: cancelled
    };

    this.subscriptions.push(
      this._apollo.mutate({
        mutation: updateUserPreference,
        variables: {
          id: this.user._id,
          input: payload
        },
        refetchQueries: ['User']
      }).subscribe(({ data}) => { })
    );
  }

  updateProviderPreference(provider: string): void {
    if (!this.user || !this.user._id) {
      return;
    }

    const that = this;
    let providers = [];

    if (provider) {
      providers = provider.split('|');
    }

    this.subscriptions.push(
      this._apollo.mutate({
        mutation: updateUserPreference,
        variables: {
          id: this.user._id,
          input: {
            providers: providers
          }
        },
        refetchQueries: ['User']
      }).subscribe(( { data } ) => {})
    );
  }

  get viewValue(): string {
      return this.view.toUpperCase();
  }

  getAppointmentsDateRange(): any {
    let start;
    let end;

    // lets take 1 day/week/month before, and after, for faster results in the view
    start = moment(this.viewDate).subtract(1, <any>this.view).startOf(<any>this.view).toLocaleString();
    end = moment(this.viewDate).add(1, <any>this.view).endOf(<any>this.view).toLocaleString();

    return { startDate: start, endDate: end };
  }

  onViewSelected(newView: string) {
    this.view = newView.toLocaleLowerCase();
    this.fetchEvents();
  }

  dayClicked({ date, events }: { date: Date; events: ExtendedCalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
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
      default :
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

  private _setUserPreference(): void {
    if (!this.user ||
        isEmpty(this.user.preferences) ||
        !isBoolean(this.user.preferences.showAppointmentCancelled)) {
      this.apptCancelledPreference = false;
    }

    this.apptCancelledPreference =  this.user.preferences.showAppointmentCancelled;
  }

  private _updateProviderStore(user: IUserInfo): void {
    if (user.preferences && user.preferences.providers) {
      this._storeHelper.update('selectedAppointmentsProvider', user.preferences.providers);
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

