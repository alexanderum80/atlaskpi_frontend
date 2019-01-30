import { Router } from '@angular/router';
import { Injectable, NgZone } from '@angular/core';

function getWindow (): any {
    return window;
}

@Injectable()
export class WindowService {

    constructor(
        private _router: Router,
        private _zone: NgZone,
    ) {

        // add navigation method to accesable directly from the window object
        getWindow().atlasKpi = {
            navigate: function(url: string) {
                _zone.run(() => {
                    _router.navigate([`${url}`]);
                });
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
