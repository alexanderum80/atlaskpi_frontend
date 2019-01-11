import { UserService } from './../../shared/services/user.service';
import SweetAlert from 'sweetalert2';
import { BrowserService } from 'src/app/shared/services/browser.service';
import { ApolloService } from './../../shared/services/apollo.service';
import { CustomListFormViewModel } from './custom-list.viewmodel';
import { IItemListActivityName } from './../../shared/interfaces/item-list-activity-names.interface';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

const customListQuery = require('graphql-tag/loader!../shared/graphql/get-custom-list.gql');
const customListByNameQuery = require('graphql-tag/loader!../shared/graphql/custom-list-by-name.gql');
const addCustomListMutation = require('graphql-tag/loader!../shared/graphql/add-custom-list.gql');
const updateCustomListMutation = require('graphql-tag/loader!../shared/graphql/update-custom-list.gql');

const ViewsMap = {
  Summary: 'summary',
  Details: 'details'
};

@Component({
  selector: 'kpi-custom-list',
  templateUrl: './custom-list.component.pug',
  styleUrls: ['./custom-list.component.scss']
})
export class CustomListComponent implements OnInit {
  private _currentUser: string;

  actionActivityNames: IItemListActivityName;

  isLoading = true;
  isMobile: boolean;

  flipped = false;
  private _activeView = ViewsMap.Summary;

  constructor(
    public vm: CustomListFormViewModel,
    private _apolloService: ApolloService,
    private _browser: BrowserService,
    private _userSvc: UserService,
    private _router: Router
  ) {
    this.isMobile = _browser.isMobile();
  }

  async ngOnInit() {
    if (!this.vm.dataEntryPermission()) {
      this._router.navigateByUrl('/unauthorized');
    } else {
      this.currentUser();
      this.vm.initialize(this.vm.defaultCustomListModel);
      await this._getCustomList();
      this._subscribeToFormChange();
      this.isLoading = false;
      this.flipped = false;
    }
  }

  currentUser(): any {
    this._userSvc.user$.subscribe(user => {
      if (user) {
        this._currentUser = user._id;
      }
    });
  }

  get selectedCustomList() {
    return this.vm.customList[this.vm.selectedCustomListIndex];
  }

  private _subscribeToFormChange() {
    this.vm.fg.valueChanges.subscribe(fg => {
      if (this.vm.customList.length - 1 >= this.vm.selectedCustomListIndex) {
        this.vm.customList[this.vm.selectedCustomListIndex].name = fg.name;
      }
    });
  }

  private async _getCustomList() {
    this.vm.customList = [];
    await this._apolloService.networkQuery < any[] > (customListQuery).then(data => {
        if (!data.customList.length) {
          this.vm.customList.push(this.vm.defaultCustomListModel);
        }
        data.customList.forEach(element => {
          this.vm.customList.push({
            _id: element._id,
            name: element.name,
            dataType: element.dataType,
            listValue: element.listValue
          });
        });
        this.updateSelectedCustomListIndex(0);
    });
  }

  isFormValid() {
    return this.vm.fg.valid && this.vm.customListModel.controls.length > 1;
  }

  onAddCustomList() {
    this.vm.defaultCustomListModel.name = '';
    this.vm.customList.push(this.vm.defaultCustomListModel);
    const lastCustomListIndex = this.vm.customList.length - 1;
    this.updateSelectedCustomListIndex(lastCustomListIndex);
  }

  updateSelectedCustomListIndex(customListIndex) {
    this.vm.selectedCustomListIndex = customListIndex;
    this.flipped = true;
  }

  backToListClicked() {
    this.flipped = false;
  }

  toggle(view) {
      if (this._activeView === view) {
          return;
      }

      if (view === ViewsMap.Summary) {
          this._switchView(ViewsMap.Summary, ViewsMap.Details);
      } else {
          this._switchView(ViewsMap.Details, ViewsMap.Summary);
      }
  }

  private _switchView(frontView, backView) {
      const that = this;
      const suffix = 'Position';

      this._activeView = frontView;

      that[backView + suffix] = 'behind';

      setTimeout(() => {
          that[frontView + suffix] = 'front';
          that[backView + suffix] = 'back';
      }, 350);
  }

  save() {
    const payload = this.vm.payload;
    payload['users'] = [this._currentUser];

    const mutation = payload._id ? updateCustomListMutation : addCustomListMutation;

    this._apolloService.networkQuery<any>(customListByNameQuery, { name: payload.name }).then(list => {
      const listResult = list.customListByName;
      if ((listResult && !payload._id) || (listResult && payload._id && listResult._id !== payload._id)) {
        return SweetAlert({
          title: 'List name exists!',
          text: `Already exists list with name: '${payload.name}'. Please change the list name.`,
          type: 'error',
          showConfirmButton: true,
          confirmButtonText: 'Ok'
        });
      }
      this._apolloService.mutation<any> (mutation, { input: payload })
      .then(res => {
        let resultSuccess = false;
        if (!payload._id) {
          resultSuccess = res.data.addCustomList.success;
        } else {
          resultSuccess = res.data.updateCustomList.success;
        }
        if (resultSuccess) {
          SweetAlert({
            type: 'info',
            title: 'All changes have been saved successfully',
            showConfirmButton: true,
            confirmButtonText: 'OK'});
        }
        this._getCustomList();
      });
    });
  }

  async cancel() {
    this.isLoading = true;
    await this._getCustomList();
    this.updateSelectedCustomListIndex(0);
    this.isLoading = false;
    this.flipped = false;
  }
}

