import { KpiFilterListComponent } from './ui/kpi-filters/filter-list/filter-list.component';
import { NgxResizeWatcherDirective } from './directives/ngx-resize-watcher.directive';
import { BrowserService } from './services/browser.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayComponent } from './ui/overlay/overlay.component';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';

// components
import {
    BackgroundComponent,
    IndustryPickerComponent,
    TimezonePickerComponent,
    LanguagePickerComponent,
    WeekDayPickerComponent,
    CurrencyPickerComponent,
    TimeFormatPickerComponent,
    KpiDaterangePickerComponent,
    KpiFrequencyPickerComponent,
    KpiGroupingPickerComponent,
    FilterFormComponent,
} from './ui';

import {
    LocalStorageService,
    AuthenticationService,
    AuthGuard,
    CurrenciesService,
    IndustriesService,
    LanguageService,
    NativeChannelService,
    Store,
    StoreHelper,
    TimezoneService,
    UserService,
    PaginationService,
    FormBuilderTypeSafe,
    DateService,
    AgGridService,
} from './services';

import { CollapsableComponent } from './ui/collapsable/collapsable.component';
import { AddItemComponent } from './ui/add-item/add-item.component';
import { SelectableItemFrameComponent } from './ui/selectable-item-frame/selectable-item-frame.component';
import { ApolloService } from './services/apollo.service';
import { SelectPickerService } from './services/select-picker.service';
import { SpinnerComponent } from './ui/spinner/spinner.component';
import { ListItemStandardComponent } from './ui/lists/list-item-standard/list-item-standard.component';
import { ItemListComponent } from './ui/lists/item-list/item-list.component';
import { ApiService } from './services/api.service';
import { MomentFormatPipe } from './pipes/moment-format.pipe';
import { TagsComponent } from './ui/tags/tags.component';
import { ListItemTabularComponent } from './ui/lists/list-item-tabular/list-item-tabular.component';
import { FileUploadClientService } from './services/upload.service';
import { FileInputComponent } from './ui/file-input/file-input.component';
import { RemoveConfirmationComponent } from './ui/remove-confirmation/remove-confirmation.component';
import { ErrorComponent } from './ui/error/error.component';
import { IsInViewportDirective } from './directives/is-in-viewport.directive';
import { NotificationService } from './services/notification.service';
import { ChooseColorsComponent } from './ui/choose-colors/choose-colors.component';
import { TooltipDirective } from './directives/tooltip.directive';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialFormsModule,
        MaterialUserInterfaceModule,
        TagInputModule,
        BrowserAnimationsModule,
        HttpClientModule
    ],
    declarations: [
        BackgroundComponent,
        IndustryPickerComponent,
        TimezonePickerComponent,
        LanguagePickerComponent,
        WeekDayPickerComponent,
        CurrencyPickerComponent,
        TimeFormatPickerComponent,
        OverlayComponent,
        KpiDaterangePickerComponent,
        KpiFrequencyPickerComponent,
        KpiGroupingPickerComponent,
        CollapsableComponent,
        AddItemComponent,
        SelectableItemFrameComponent,
        SpinnerComponent,
        ListItemStandardComponent,
        ItemListComponent,
        ChooseColorsComponent,
        KpiFilterListComponent,
        FilterFormComponent,
        // pipes
        MomentFormatPipe,
        NgxResizeWatcherDirective,
        TagsComponent,
        ListItemTabularComponent,
        FileInputComponent,
        RemoveConfirmationComponent,
        ErrorComponent,
        // directives
        IsInViewportDirective,
        TooltipDirective
    ],
    exports: [
        BackgroundComponent,
        IndustryPickerComponent,
        TimezonePickerComponent,
        LanguagePickerComponent,
        WeekDayPickerComponent,
        CurrencyPickerComponent,
        TimeFormatPickerComponent,
        OverlayComponent,
        KpiDaterangePickerComponent,
        KpiFrequencyPickerComponent,
        KpiGroupingPickerComponent,
        CollapsableComponent,
        AddItemComponent,
        SelectableItemFrameComponent,
        SpinnerComponent,
        ListItemStandardComponent,
        ItemListComponent,
        TagsComponent,
        FileInputComponent,
        ChooseColorsComponent,
        KpiFilterListComponent,
        ListItemTabularComponent,
        RemoveConfirmationComponent,
        ErrorComponent,
        // pipes
        MomentFormatPipe,
        // directives
        IsInViewportDirective,
        TooltipDirective
    ],
    providers: [
        ApiService,
        LocalStorageService,
        AuthenticationService,
        AuthGuard,
        NativeChannelService,
        IndustriesService,
        TimezoneService,
        LanguageService,
        CurrenciesService,
        StoreHelper,
        Store,
        UserService,
        BrowserService,
        PaginationService,
        ApolloService,
        SelectPickerService,
        FileUploadClientService,
        FormBuilderTypeSafe,
        DateService,
        NotificationService,
        AgGridService
    ],
})
export class SharedModule { }
