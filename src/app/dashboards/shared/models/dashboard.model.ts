export interface IDashboard {
  _id?: string;
  name: string;
  description: string;
  charts: string[] | any[];
  widgets: string[] | any[];
  users: string[];
  owner?: string;
  visible?: boolean;
}


export class Dashboard implements IDashboard {
  private __id: string;
  get _id(): string{ return this.__id; }

  private _name: string;
  get name(): string{ return this._name; }

  private _description: string;
  get description(): string{ return this._description; }

  private _charts: string[];
  get charts(): string[] { return this._charts; }

  private _widgets: string[];
  get widgets(): string[] { return this._widgets; }

  private _users: string[];
  get users(): string[] { return this._users; }

  private _owner: string;
  get owner(): string { return this._owner; }

  private _visible: boolean;
  get visible(): boolean { return this._visible; }


  static Create(id: string, name: string, description: string, charts: string[], widgets: string[],
                owner: string,
                users: string[], visible?: boolean):
    IDashboard {
      const instance = new Dashboard(id, name, description, charts, widgets,
                                     owner,
                                     users, visible);
      return instance.name ? instance : null;
  }

  private constructor(id: string, name: string, description: string, charts: string[], widgets: string[],
                      owner: string,
                      users: string[], visible?: boolean) {
      if (!name || !description) {
          return;
      }
      this.__id = id;
      this._name = name;
      this._description = description;
      this._charts = charts;
      this._widgets = widgets;
      this._users = users;
      this._owner = owner;
      this._visible = visible;
  }
}
