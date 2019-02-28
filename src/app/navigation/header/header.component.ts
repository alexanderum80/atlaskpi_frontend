import 'rxjs/add/observable/combineLatest';

import { Component, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { isBoolean, isEmpty, isNull } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import SweetAlert from 'sweetalert2';

import { MenuItem } from '../../ng-material-components';
import { ViewAppointmentActivity } from '../../shared/authorization/activities/appointments/view-appointment.activity';
import { ActivityFeedActivity } from '../../shared/authorization/activities/feed/activity-feed.activity';
import { ViewKpiActivity } from '../../shared/authorization/activities/kpis/view-kpi.activity';
import { ViewSmartBarActivity } from '../../shared/authorization/activities/smart-bar/view-smartbar.activity';
import { objectWithoutProperties } from '../../shared/helpers/object.helpers';
import { IUserInfo } from '../../shared/models';
import { IUserPreference } from '../../shared/models/user';
import { IVersion } from '../../shared/models/version';
import { AuthenticationService, Store, StoreHelper, UserService } from '../../shared/services';
import { ApolloService } from '../../shared/services/apollo.service';
import { CommonService } from '../../shared/services/common.service';
import { VersionService } from '../../shared/services/version.service';
import { UserAgreementService } from '../../users/user-agreement/user-agreement.service';
import { UserProfileComponent } from '../../users/user-profile/user-profile.component';
import { IHelpCenter, IHelpCenterDataResponse } from '../help-center/help-center.component';
import { HelpCenterService } from '../help-center/help-center.service';
import { HeaderViewModel } from './header.viewmodel';
import { BrowserService } from 'src/app/shared/services/browser.service';

const helpCenterQueryGql = require('graphql-tag/loader!./help-center.query.gql');
const updateUserPreference = require('graphql-tag/loader!./update-user-preference.mutation.gql');
const updateUserInfo = require('graphql-tag/loader!./current-user.gql');
const visibleToRoles = ['owner', 'admin', 'semi-admin'];

@Component({
    selector: 'kpi-header',
    templateUrl: './header.component.pug',
    styleUrls: ['./header.component.scss'],
    providers: [
        HeaderViewModel, ActivityFeedActivity, ViewAppointmentActivity,
        CommonService, HelpCenterService, ViewSmartBarActivity, ViewKpiActivity
    ]
})
export class HeaderComponent implements OnInit, OnDestroy {
    @Input() sideBarOpen = true;
    @Input() showHelpCenter = false;
    @ViewChild(UserProfileComponent) editUserProfileModal: UserProfileComponent;
    fg = new FormGroup({});
    showSidebarCalendar = false;
    showSidebarActivities = false;
    avatarAddress = '';
    logoPath: string;

    actionItems: MenuItem[] = [
        {
            id: '3',
            icon: 'more-vert',
            children: [
                {
                    id: 'search',
                    title: 'Search',
                    icon: 'search'
                },
                {
                    id: 'notifications',
                    title: 'Notifications',
                    icon: 'notifications-none',
                },
                {
                    id: 'dark',
                    title: 'Dark Theme',
                    icon: 'invert-colors'
                },
                {
                    id: 'light',
                    title: 'Light Theme',
                    icon: 'invert-colors'
                },
                {
                    id: 'calendar',
                    title: 'Sidebar Calendar',
                    icon: 'calendar'
                },
                {
                    id: 'helpCenter',
                    title: 'Help Center',
                    icon: 'pin-help'
                },
                {
                    id: 'activities',
                    title: 'Activity Feed',
                    icon: 'comment-list'
                },
                {
                    id: 'logout',
                    title: 'Sign Out',
                    icon: 'close'
                },
            ]
        },
    ];

    currentUser: IUserInfo;
    newVersion: IVersion;
    // showHelpCenter = false;
    showActivityIcon = false;
    value = false;
    showSearchPage = false;

    showSlide = false;

    private _subscription: Subscription[] = [];

    constructor(private _authService: AuthenticationService,
        private _userService: UserService,
        private _store: Store,
        private _storeHelper: StoreHelper,
        private _versionSvc: VersionService,
        private _commonService: CommonService,
        private renderer: Renderer2,
        private _apollo: Apollo,
        private _helpCtrService: HelpCenterService,
        private _userAgreeSvc: UserAgreementService,
        public vm: HeaderViewModel,
        public activityFeedActivity: ActivityFeedActivity,
        public viewAppointMentActivity: ViewAppointmentActivity,
        public viewKpiActivity: ViewKpiActivity,
        public viewSmartBarActivity: ViewSmartBarActivity,
        private _router: Router,
        private _browser: BrowserService,
        // yojanier
        private _apolloService: ApolloService,
    ) {
            this.vm.addActivities([
                this.activityFeedActivity, this.viewAppointMentActivity,
                this.viewSmartBarActivity
            ]);
            const that = this;

            this._subscription.push(this._userService.user$.subscribe((user) => {
                that.currentUser = user;
                that.avatarAddress = user ? user.profilePictureUrl : '';
            }));
            // may not have user by the time user has agreed
            this._subscription.push(
                Observable.combineLatest(
                    this._userAgreeSvc.ownerAgreed$,
                    this._userService.user$
                )
                .pipe(take(3))
                .subscribe(values => {
                    // array: [value from ownerAgreed$, value from user$]
                    const ownerAgreed: boolean = values[0];
                    const user: IUserInfo = values[1];

                    if (isBoolean(ownerAgreed) && user) {
                        that._showHelpCenter(ownerAgreed);
                    }
                })
            );

            this._subscription.push( 
                this._store.changes$.subscribe(
                (state) => this.changeLogo(state)
            ));
        }

    ngOnInit() {
        const that = this;

        this._subscription.push(this._versionSvc.newVersionAvailable$.subscribe(v => {
            that.newVersion = v;
        }));

        this._apolloService.networkQuery < IUserInfo > (updateUserInfo).then(d => {
            that.currentUser = d.User;

            if (!this.currentUser.preferences.theme) {
                this._subscription.push(this.fg.valueChanges.subscribe(values => {
                    const themeName = values.theme ? 'dark' : 'light';
                    that._setTheme(themeName, true);
                }));
            }else{
                const themeNames = this.currentUser.preferences.theme === 'dark' ? 'dark' : 'light'; 
                that._setTheme(themeNames, true);
            }
        });
        // query help center videos
        this._subscription.push(this._apollo.query<IHelpCenterDataResponse>({
            query: helpCenterQueryGql,
            fetchPolicy: 'network-only'
        })
        .subscribe(({ data }) => {
            if (!data || !data.helpCenter) { return; }
            const response: IHelpCenter[] = data.helpCenter;

            if (!response || !response.length) { return; }
            that._helpCtrService.setVideoItems(response);
        }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    logout() {
        this._authService.logout();
    }

    smartBarPermission(): boolean {
        return this.vm.authorizedTo('ViewSmartBarActivity');
    }

    asdas() {
        const that = this;
        this._subscription.push(this._userService.user$
            .distinctUntilChanged()
            .subscribe((user: IUserInfo) => {
                that.currentUser = user;
        }))
    }

    get fullname(): string {
        if (!this.currentUser) {
            return null;
        }

        if (this.currentUser.profile && (this.currentUser.profile.firstName || this.currentUser.profile.lastName)) {
            return `${this.currentUser.profile.firstName} ${this.currentUser.profile.lastName}`;
        }

        return this.currentUser.username;
    }

    get currentUserId(): string {
        // currentUser._id
        if (!this.currentUser) {
            return '';
        }

        return this.currentUser._id || '';
    }

    get initials(): string {
        if (!this.fullname) {
            return null;
        }
        const chunks = this.fullname.split(' ');
        if (!chunks) {
            return this.fullname.substr(0, 1).toUpperCase();
        }
        return chunks.map(c => {
            return c.substr(0, 1).toUpperCase();
        }).join('');
    }

    toggleSidebar() {
        this._storeHelper.update('sideBarOpen', !this._store.getState().sideBarOpen);
    }

    onSearchClosed() {
        this.showSearchPage = false;
    }

    actionClicked(action) {
        switch (action.id) {
            case 'search':
                this.showSearchPage = this.smartBarPermission();
                break;
            case 'logout':
                this.logout();
                break;
            case 'light':
                this._setTheme('light');
                break;
            case 'dark':
                this._setTheme('dark');
                break;
            case 'calendar':
                this.toggleSidebarCalendar();
                break;
            case 'activities':
                this.toggleSidebarActivities();
                break;
            case 'helpCenter':
                this.toggleHelpCenter();
                break;
            case 'notifications':
                this._router.navigate(['/notifications']);
                break;
        }
    }

    private _showHelpCenter(agreed: boolean): void {
        if (this.currentUser) {
            const that = this;

            // when ownered agreed, and when helpCenter not false, show helpCenter
            if (agreed && (this.currentUser.preferences.helpCenter || isNull(this.currentUser.preferences.helpCenter))) {
                // use timeout to wait for user agreement to close
                setTimeout(() => {
                    that.showHelpCenter = true;
                    that._updateUserHelpCenterPreference(this.currentUser._id, this.currentUser.preferences);
                }, 500);
            }
        }
    }

    private _updateUserHelpCenterPreference(id: string, preference: IUserPreference): void {
        // do nothing if no id or prefences is empty object
        if (!id || isEmpty(preference)) {
            return;
        }

        const payload: IUserPreference = {
            helpCenter: false
        };

        if (preference.chart) {
            const chart: any = objectWithoutProperties(preference.chart, ['__typename']);
            payload.chart = chart;
        }

        const that = this;
        this._subscription.push(this._apollo.mutate({
            mutation: updateUserPreference,
            variables: {
                id: id,
                input: payload
            }
        }).subscribe(({ data }: any) => {
            if (!data) { return; }
            const response = data.updateUserPreference;

            if (!response.success || !response.entity.preferences) { return; }
            // in case preferences is null or undefined
            if (!that.currentUser.preferences) {
                that.currentUser.preferences = {};
            }

            const preferences: IUserPreference = objectWithoutProperties(response.entity.preferences, ['__typename']) as IUserPreference;
            that.currentUser.preferences.helpCenter = preferences.helpCenter;
        }));
    }

    public toggleSidebarCalendar() {
        if (!this.vm.authorizedTo('ViewAppointmentActivity')) {
            SweetAlert({
                title: 'Authorization',
                text: 'Not authrorized to view appointments',
                type: 'warning'
            });
            return;
        }
        this.showSidebarCalendar = !this.showSidebarCalendar;
    }

    public toggleHelpCenter() {
        this.showHelpCenter = this.showHelpCenter ? false : true;
    }

    onHelpCenterClosed() {
        this.showHelpCenter = false;
    }

    public toggleSidebarActivities() {
        if (!this.vm.authorizedTo('ActivityFeedActivity')) {
            SweetAlert({
                title: 'Authorization',
                text: 'Not authorized to view activity feed',
                type: 'warning'
            });
            return;
        }
        this.showSidebarActivities = !this.showSidebarActivities;
    }

    toggleProfileDetails() {
        this.showSlide = !this.showSlide;
    }
    private _updateUserThemePreference(id: string, themePreference: string) {
        if (!id || isEmpty(themePreference)) {
            return;
        }
        const payload: IUserPreference = {
            theme: themePreference
        };

        const that = this;
        this._subscription.push(this._apollo.mutate({
            mutation: updateUserPreference,
            variables: {
                id: id,
                input: payload
            }
        }).subscribe(({ data }: any) => {
            if (!data) { return; }
            const response = data.updateUserPreference;

            if (!response.success || !response.entity.preferences) { return; }
            // in case preferences is null or undefined
            if (!that.currentUser.preferences) {
                that.currentUser.preferences = {};
            }
        }));
    }

    private _setTheme(themeName: 'light' | 'dark', onInit?: boolean) {
        if (themeName === 'light') {
            this.renderer.removeClass(document.body, 'dark');
            this.renderer.addClass(document.body, 'light');
        } else {
            this.renderer.removeClass(document.body, 'light');
            this.renderer.addClass(document.body, 'dark');
        }

        this._storeHelper.update('theme', themeName);

        if (!this.currentUser.preferences || !this.currentUser.preferences.theme || onInit) { 
            return; 
        }
        
        this._updateUserThemePreference(this.currentUser._id, themeName);

    }

    changeLogo(state){
        if (state.theme === 'dark') {
            this.logoPath = 'white-logo.png';
        } else {
            this.logoPath = 'logo.png';
        }
    }

    onClickLogo(){
        if(this._browser.isMobile()){
            this._router.navigate(['mobile-menu']);
        }
        else{
            this._router.navigate(['dashboards'])
        }
    }
}
