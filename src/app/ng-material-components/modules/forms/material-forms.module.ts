import { ScrollEventModule } from 'ngx-scroll-event';

import { MaskedInputDirective } from './mask/masked-input.directive';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CheckboxComponent } from './checkbox/checkbox.component';
import { EmailComponent } from './email/email.component';
import { NumberComponent } from './number/number.component';
import { PasswordComponent } from './password/password.component';
import { PhoneComponent } from './phone/phone.component';
import { RadioGroupComponent } from './radio/radio-group.component';
import { RadioGroupService } from './radio/radio-group.service';
import { RadioComponent } from './radio/radio.component';
import { SelectPickerComponent } from './select-picker/select-picker.component';
import { TextAreaComponent } from './text-area/text-area.component';
import { TextBoxComponent } from './text-box/text-box.component';
import { ToggleComponent } from './toggle/toggle.component';
import { DpDatePickerModule } from './date-picker/date-picker.module';


@NgModule({
    declarations: [
        CheckboxComponent,
        EmailComponent,
        NumberComponent,
        PasswordComponent,
        PhoneComponent,
        RadioGroupComponent,
        RadioComponent,
        SelectPickerComponent,
        TextAreaComponent,
        TextBoxComponent,
        ToggleComponent,
        MaskedInputDirective
    ],
    exports: [
        CheckboxComponent,
        EmailComponent,
        MaskedInputDirective,
        NumberComponent,
        PasswordComponent,
        PhoneComponent,
        RadioGroupComponent,
        RadioComponent,
        SelectPickerComponent,
        TextAreaComponent,
        TextBoxComponent,
        ToggleComponent,
        DpDatePickerModule
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollEventModule
    ],
    // providers: [
    //     RadioGroupService,
    // ]
})
export class MaterialFormsModule {
    /**
     * Use in AppModule: new instance of SumService.
     */
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: MaterialFormsModule,
            // providers: [RadioGroupService]
        };
    }

    /**
     * Use in features modules with lazy loading: new instance of SumService.
     */
    public static forChild(): ModuleWithProviders {
        return {
            ngModule: MaterialFormsModule,
            // providers: [RadioGroupService]
        };
    }
}
