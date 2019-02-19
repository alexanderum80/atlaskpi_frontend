export interface IDashboard {
  _id?: string;
  name: string;
  description: string;
  charts: string[] | any[];
  widgets: string[] | any[];
  socialwidgets: string[] | any[];
  maps: string[] | any[];
  users: string[];
  owner?: string;
  visible?: boolean;
  order?: number;
  createdDate?: Date;
  updatedBy?: string;
  updatedDate?: Date;
}


export class Dashboard implements IDashboard {
  private __id: string;
  get _id(): string { return this.__id; }

  private _name: string;
  get name(): string { return this._name; }

  private _description: string;
  get description(): string { return this._description; }

  private _charts: string[];
  get charts(): string[] { return this._charts; }

  private _widgets: string[];
  get widgets(): string[] { return this._widgets; }

  private _socialwidgets: string[];
  get socialwidgets(): string[] { return this._socialwidgets; }

  private _maps: string[];
  get maps(): string[] { return this._maps; }

  private _users: string[];
  get users(): string[] { return this._users; }

  private _owner: string;
  get owner(): string { return this._owner; }

  private _visible: boolean;
  get visible(): boolean { return this._visible; }

  private _order: number;
  get order(): number { return this._order; }

  private _createdDate: Date;
  get createdDate(): Date { return this._createdDate; }

  private _updatedBy: string;
  get updatedBy(): string { return this._updatedBy; }

  private _updatedDate: Date;
  get updatedDate(): Date { return this._updatedDate; }


  static Create(id: string, name: string, description: string, charts: string[], widgets: string[],
                socialwidgets: string[], maps: string[] , owner: string,
                users: string[], visible?: boolean, order?: number, createdDate?: Date, updatedBy?: string, updatedDate?: Date):
    IDashboard {
      const instance = new Dashboard(id, name, description, charts, widgets, socialwidgets, maps,
                                     owner,
                                     users, visible, order, createdDate, updatedBy, updatedDate);
      return instance.name ? instance : null;
  }

  private constructor(id: string, name: string, description: string, charts: string[], widgets: string[],
                      socialwidgets: string[], maps: string[], owner: string,
                      users: string[], visible?: boolean, order?: number, createdDate?: Date, updatedBy?: string, updatedDate?: Date ) {
      if (!name || !description) {
          return;
      }
      this.__id = id;
      this._name = name;
      this._description = description;
      this._charts = charts;
      this._widgets = widgets;
      this._socialwidgets = socialwidgets;
      this._maps = maps;
      this._users = users;
      this._owner = owner;
      this._visible = visible;
      this._order = order;
      this._createdDate = createdDate;
      this._updatedBy = updatedBy;
      this._updatedDate = updatedDate;
  }
}
