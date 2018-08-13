import { HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
// import { HttpBatchLinkModule, HttpBatchLink } from 'apollo-angular-link-http-batch';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink, concat, from } from 'apollo-link';
// import { onError } from 'apollo-link-error';

import { environment } from '../environments/environment';
import { ActivitiesModule } from './activities/activities.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppointmentsModule } from './appointments/appointments.module';
import { BusinessUnitsModule } from './business-units/business-units.module';
import { ChartsSlideshowModule } from './charts-slideshow/charts-slideshow.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { DepartmentsModule } from './departments/departments.module';
import { EmployeesModule } from './employees/employees.module';
import { LoadingProfileComponent } from './loading-profile/loading-profile.component';
import { LocationsModule } from './locations/locations.module';
import { MilestonesModule } from './milestones/milestones.module';
import { NavigationModule } from './navigation/navigation.module';
import { MaterialFormsModule, MaterialUserInterfaceModule } from './ng-material-components';
import { NotificationsModule } from './notifications/notifications.module';
import { PlaygroundModule } from './playground/playground.module';
import { SharedModule } from './shared';
import { IUserToken } from './shared/models/user-token';
import { VersionService } from './shared/services/version.service';
import { WindowService } from './shared/services/window.service';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { UsersModule } from './users/users.module';
import { WidgetsModule } from './widgets/widgets.module';
import { Widgets2Module } from './widgets2/widgets2.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TargetsModule } from './targets/targets.module';
import { FormTargetsComponent } from './targets/form-targets/form-targets.component';

@NgModule({
    declarations: [
        AppComponent,
        UnauthorizedComponent,
        LoadingProfileComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AppRoutingModule,
        SharedModule,
        MaterialFormsModule.forRoot(),
        MaterialUserInterfaceModule.forRoot(),
        // Apollo
        HttpClientModule, // provides HttpClient for HttpLink
        ApolloModule,
        HttpLinkModule,
        // HttpBatchLinkModule,

        // App Modules
        NavigationModule,
        DashboardsModule,
        ChartsSlideshowModule, // Add by Delvis
        // AccountModule,
        UsersModule,
        BusinessUnitsModule,
        NotificationsModule,
        MilestonesModule,
        AppointmentsModule,
        WidgetsModule,
        PlaygroundModule,
        Widgets2Module,
        DepartmentsModule,
        EmployeesModule,
        LocationsModule,
        ActivitiesModule,
        ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
        // for upload image
        // SimpleImageUploadModule

        TargetsModule
    ],
    providers: [
        WindowService,
        VersionService,
        Location,
        {
            provide: LocationStrategy,
            useClass: HashLocationStrategy
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {

    constructor(
        apollo: Apollo,
        httpLink: HttpLink,
        // batchLink: HttpBatchLink
    ) {

        const cache = new InMemoryCache({
            dataIdFromObject: o => {
                if (( < any > o)._id && ( < any > o).__typename) {
                    return ( < any > o).__typename + ( < any > o)._id;
                }
                return null;
            },
        });

        const appLink = httpLink.create({
            uri: environment.graphQlServer
        });

        // const appLink = batchLink.create({
        //     uri: environment.graphQlServer,
        //     batchMax: 6,
        //     batchInterval: 20
        // });

        const authMiddleware = this._getAuthMiddleWare();

        apollo.create({
            // link: from([authMiddleware, this._getErrorLink(), appLink]),
            link: from([authMiddleware, appLink]),
            cache
        });
    }

    // private _getErrorLink(): ApolloLink {

    //     return onError(({
    //         graphQLErrors,
    //         networkError,
    //         response,
    //         operation
    //     }) => {
    //         if (graphQLErrors) {
    //             graphQLErrors.map(({
    //                     message,
    //                     locations,
    //                     path
    //                 }) =>
    //                 console.log(
    //                     `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
    //                 ),
    //             );
    //         }

    //         if (networkError) {
    //             console.log(`[Network error]: ${networkError}`);
    //             const err = networkError as any;

    //             if ( err.status === 401) {
    //                 console.log('HTTP Error 401 Unauthorized');
    //                 // delete the invalid token from localstorage
    //                 localStorage.removeItem(environment.BEARER_KEY);
    //                 window.location.href = '/';
    //             }
    //         }
    //     });
    // }

    private _getAuthMiddleWare(): ApolloLink {
        return new ApolloLink((operation, forward) => {
            const jsonToken: IUserToken =
                JSON.parse(localStorage.getItem(environment.BEARER_KEY))
                || { access_token: '' };

            const headers = new HttpHeaders()
                .set('x-hostname', window.location.hostname)
                .set('x-access-token', jsonToken.access_token);

            operation.setContext({
                headers: headers
            });

            return forward(operation);
        });
    }
}
