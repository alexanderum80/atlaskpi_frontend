import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

function getWindow (): any {
    return window;
}

@Injectable()
export class WindowService {

    constructor(private _router: Router) {

        // add navigation method to accesable directly from the window object
        getWindow().atlasKpi = {
            navigate: function(url: string) {
                _router.navigateByUrl(url);
            }
        };

    }

    get nativeWindow (): Window {
        return getWindow();
    }

    get atlasInterop(): any {
        return getWindow().atlasKpi;
    }

}
