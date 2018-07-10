import { IResultDetails } from './result-details';

export interface IResultGroup {
    name: string;
    icon: string;
    color: string;
    order: number;
    enabled: boolean;
    uriFormat: string;
    results: IResultDetails[];
}
