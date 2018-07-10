import { CommonService } from '../../shared/services/common.service';
import { ViewSecurityLogActivity } from '../../shared/authorization/activities/security-log/security-log.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { FormControl, FormGroup } from '@angular/forms';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    Apollo
} from 'apollo-angular';
import {
    IUserslogs
} from './shared/users-log.interface';
import {
    Subscription
} from 'rxjs/Subscription';


const usersLog = require('./graphql/users-log/userslogquery.gql');

@Activity(ViewSecurityLogActivity)
@Component({
    selector: 'kpi-users-log',
    templateUrl: './users-log.component.pug',
    styleUrls: ['./users-log.component.scss']
})
export class UsersLogComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('tableContainer') tableContainer: ElementRef;
    @ViewChild('auditTable') auditTable: any;

    allLogs: IUserslogs[];
    userLogs: IUserslogs[];
    loading = true;
    tableHeight;
    fg: FormGroup;
    searchString: string;

    private _subscription: Subscription[] = [];

    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this._setTableHeight();
    }

    constructor(private _apollo: Apollo) {
        const that = this;

        this._subscription.push(this._apollo.query({
            query: usersLog
        }).subscribe(response => {
            that.allLogs = ( < any > response.data).accessLogs;
            that.loading = response.loading;
            that._filterResult(that.searchString);
        }));

    }

    ngOnInit() {
        const that = this;

        this.fg = new FormGroup({
            search: new FormControl('')
        });

        this._subscription.push(this.fg.valueChanges
            .debounceTime(500)
            .subscribe(changes => {
                if (that.searchString !== changes.search) {
                    that.searchString = changes.search.toLowerCase();
                    that._filterResult(that.searchString);
                }
            }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    ngAfterViewInit() {
        this._setTableHeight();
    }

    onDetailToggle(event) {
        // console.log('Detail Toggled', event);
    }

    toggleExpandRow(row) {
        this.auditTable.rowDetail.toggleExpandRow(row);
    }

    private _setTableHeight() {
        if (this.tableContainer) {
            this.tableHeight = this.tableContainer.nativeElement.offsetHeight - 70;
        }
    }

    private _filterResult(search: string) {
        this.userLogs = search && search !== '' ?
            this.allLogs.filter(l =>
                l.event.toLowerCase().indexOf(this.searchString) !== -1
                || l.accessBy.toLowerCase().indexOf(this.searchString) !== -1
            )
            : this.allLogs;
    }
}