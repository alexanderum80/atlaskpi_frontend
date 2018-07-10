import { Store, StoreHelper } from '../services';
import { HeaderAction } from './header-action';
import { IAppEvent } from './app-event';

export class TopLevelComponent {

    empty = false;
    loading = false;

    private _headerActionCallback: Function;
    private _headerActions: HeaderAction[];

    constructor(public store: Store, public storeHelper: StoreHelper) {
    }

    set headerTitle(header: string) {
        setTimeout(() => this.store.pushAppEvent({ type: 'title', data: header }), 0);
    }

    set headerActions(headerActions: HeaderAction[]) {
        if (!headerActions) {
            headerActions = [];
        }

        this._headerActions = headerActions;
        this.storeHelper.update('headerActions', headerActions);
    }

    subscribeToHeaderActions(headerActionCallback: (headerAction: HeaderAction) => void) {
        if (!headerActionCallback) {
            return;
        }

        this._headerActionCallback = headerActionCallback;
        this.store.appEvents$.subscribe((appEvent: IAppEvent) => this._processAppEvent(appEvent));
    }

    private _processAppEvent(appEvent: IAppEvent) {
      if (appEvent.type === 'action') {
          const action = this._headerActions.find(a => a.id === appEvent.data.id);

          if (action) {
              this._headerActionCallback(action);
          }
      }
  }
}
