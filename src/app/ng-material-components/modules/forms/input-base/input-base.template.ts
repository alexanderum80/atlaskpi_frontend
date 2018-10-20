export const inputBaseTemplate = `
    <div
        class="input-group m-b-15 w-100"
        [class.fg-float]="floatingLabel"
        [class.fc-alt]="alt"
        [ngClass]="{ 'has-error': !control.valid && (fg.submitted || control.dirty)}">
            <label *ngIf="label && !floatingLabel">
                <span class="c-red">{{requiredSymbol}}</span>{{label}}
            </label>
            <span class="input-group-addon" *ngIf="leftIcon">
                <i class="zmdi zmdi-{{leftIcon}}"></i>
            </span>
            <div class="fg-line" [class.disabled]="disabled" [class.fg-toggled]="toggled">
            <input class="form-control" #i  [type]="inputType"
                placeholder="{{placeholder}}"
                [formControl]="control"
                [disabled]="disabled"
                (focus)="onFocus(i)"
                (blur)="onBlur(i)" autocapitalize="none" autocorrect="off"/>
            <label class="fg-label" *ngIf="label && floatingLabel">
                <span class="c-red">{{requiredSymbol}}</span>{{label}}
            </label>
        </div>
        <span class="input-group-addon last" *ngIf="rightIcon">
            <i class="zmdi zmdi-{{rightIcon}}"></i>
        </span>
        <div *ngIf="!control.valid && (control.dirty || fg.submitted)">
            <small class="help-block animated fadeInDown" *ngFor="let v of validations"
                [class.hidden]="!control.errors[v.type]">{{v.message}}</small>
        </div>
    </div>
`