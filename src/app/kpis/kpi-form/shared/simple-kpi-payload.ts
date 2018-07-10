import { IKPI } from '../../../shared/domain/kpis/kpi';

export interface IKPIPayload {
    id?: string;
    input: IKPI;
}
