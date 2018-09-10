//  Angular Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

// App Code
import { KpisRoutingModule } from './kpis-routing.module';

import { KpisComponent } from './kpis.component';
import { ListKpisComponent } from './list-kpis/list-kpis.component';
import { AddKpiComponent } from './add-kpi/add-kpi.component';
import { EditKpiComponent } from './edit-kpi/edit-kpi.component';
import { SimpleKpiFormComponent } from './kpi-form/simple/simple-kpi-form.component';
import { ComplexKpiFormComponent } from './kpi-form/complex/complex-kpi-form.component';
import { SharedModule } from '../shared/index';
import { KpiFilterListComponent } from './kpi-form/filters/filter-list/filter-list.component';
import { FilterFormComponent } from './kpi-form/filters/filter-form/filter-form.component';
import { ExpressionParserComponent } from './kpi-form/complex/expression-parser/expression-parser.component';
import { ExternalSourceKpiFormComponent } from './kpi-form/external-source/external-source-kpi-form.component';
import { CloneKpiComponent } from './clone-kpi/clone-kpi.component';
import { WidgetsModule } from '../widgets/widgets.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    NgxDatatableModule,
    KpisRoutingModule,
    SharedModule,
    WidgetsModule

  ],
  declarations: [
     KpisComponent,
     ListKpisComponent,
     AddKpiComponent,
     EditKpiComponent,
     SimpleKpiFormComponent,
     ComplexKpiFormComponent,
     KpiFilterListComponent,
     FilterFormComponent,
     ExpressionParserComponent,
     ExternalSourceKpiFormComponent,
     CloneKpiComponent
  ]
})
export class KpisModule { }
