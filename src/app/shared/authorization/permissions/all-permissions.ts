import { AppointmentPermissions } from './appointment.permissions';
import { ChartPermissions } from './chart.permissions';
import { KpiPermissions } from './kpi.permissions';
import { ConnectorPermissions } from './connector.permissions';
import { WidgetPermissions } from './widget.permissions';
import { EmployeePermissions } from './employee.permissions';
import { BusinessUnitPermissions } from './business-unit.permissions';
import { DepartmentPermissions } from './department.permissions';
import { LocationPermissions } from './location.permissions';
import { SlideshowPermissions } from './slideshow.permissions';
import { SubjectEnum } from './all-permission-subjects';
import { UserAccessLevelPermissions } from './users.permissions';
import { SecurityLogPermissions } from './security-log.permissions';
import { DashboardPermissions } from './dashboard.permissions';
import { RolePermissions } from './role.permissions';
import { UserPermissions } from './user.permissions';
import { TargetPermissions } from './target.permissions';
import { MilestonePermissions } from './milestone.permissions';
import { ActivityPermissions } from './activity-feed.permissions';
import {SmartBarPermissions} from './smart-bar.permission';

export const AllPermissions = [
    ...ActivityPermissions,
    ...AppointmentPermissions,
    ...ChartPermissions,
    ...DashboardPermissions,
    ...KpiPermissions,
    ...ConnectorPermissions,
    ...WidgetPermissions,
    ...EmployeePermissions,
    ...BusinessUnitPermissions,
    ...DepartmentPermissions,
    ...LocationPermissions,
    ...SlideshowPermissions,
    ...SmartBarPermissions,
    ...SecurityLogPermissions,
    ...UserAccessLevelPermissions,
    ...RolePermissions,
    ...UserPermissions,
    ...TargetPermissions,
    ...MilestonePermissions
];

export function getPermissions(subject: SubjectEnum, actions: string[]) {
    return AllPermissions.filter(p => {
        return p.subject === subject && actions.indexOf(p.action) !== -1;
    });
}
