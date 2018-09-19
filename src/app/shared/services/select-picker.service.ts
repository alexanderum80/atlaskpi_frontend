import {
    ApolloService
} from './apollo.service';
import {
    Injectable
} from '@angular/core';
import gql from 'graphql-tag';
import {
    SelectionItem
} from '../../ng-material-components';
import {
    ICountry,
    IState
} from '../models';


const countriesQuery = gql `
query Countries {
    countries {
        _id
        name
        continent
    }
}`;

const statesForCountryQuery = gql `
query StatesForCountry($code: String!) {
    statesFor(country: $code) {
        _id
        country
        name
        code
    }
}`;

const departmentsQuery = gql `
query Departments {
    departments {
        _id
        name
        }
}`;

const businessUnitsQuery = gql `
query BusinessUnits {
    businessUnits {
        _id
        name
    }
}`;

const locationsQuery = gql `
query Locations {
    locations {
        _id
        name
    }
}`;

@Injectable()
export class SelectPickerService {

    constructor(private _apolloService: ApolloService) {}

    getCountries(): Promise < SelectionItem[] > {
        return this._getData(countriesQuery, 'countries', { id: '_id', title: 'name' });
    }

    getStatesFor(country: string): Promise < SelectionItem[] > {
        if (!country) {
            return Promise.resolve([]);
        }

        return this._getData(statesForCountryQuery, 'statesFor', { id: 'code', title: 'name' }, { code: country });
    }

    getDepartments(): Promise<SelectionItem[]> {
        return this._getData(departmentsQuery, 'departments', { id: '_id', title: 'name' });
    }

    getBusinessUnits(): Promise<SelectionItem[]> {
        return this._getData(businessUnitsQuery, 'businessUnits', { id: '_id', title: 'name' });
    }

    getLocations(): Promise<SelectionItem[]> {
        return this._getData(locationsQuery, 'locations', { id: '_id', title: 'name' });
    }

    private _getData<T>(query, resPath, mappingInfo: { id: string, title: string }, variables?: any): Promise<SelectionItem[]> {
        return this._apolloService.networkQuery < T > (query, variables)
        .then(res => {
            return res[resPath].map(c => {
                return {
                    id: c[mappingInfo.id],
                    title: c[mappingInfo.title]
                };
            });
        });
    }

}
