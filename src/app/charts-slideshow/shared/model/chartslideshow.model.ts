export interface IChartSlideshow {
    _id: string;
    name: string;
    description: string;
    charts: string[];
}

export class ChartSlideshow implements IChartSlideshow {

    private __id: string;
    get _id(): string{ return this.__id; }

    private _name: string;
    get name(): string {return this._name; }

    private _description: string;
    get description(): string {return this._description; }

    private _charts: string[];
    get charts(): string[] {return this._charts; }

    static Create(id: string, name: string, description: string, charts: string[]): IChartSlideshow {

        const instance = new ChartSlideshow(id, name, description, charts);
        return instance.name ? instance : null;
    }

    private constructor(id: string, name: string, description: string, charts: string[]) {

        if (!name || !description ) {
            return;
        }

        this.__id = id;
        this._name = name;
        this._description = description;
        this._charts = charts;
    }

}
