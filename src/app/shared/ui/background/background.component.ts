import { Component, Input } from '@angular/core';

@Component({
  selector: 'kpi-background',
  styles: [
      `img.bg {
        /* Set up positioning */
        position: fixed;
        top: 0;
        left: 0;
        object-fit: cover;
        width: 100%;
        min-height: 100%;
      }

    @media screen 
        and (min-device-width: 1200px) 
        and (max-device-width: 1600px) 
        and (-webkit-min-device-pixel-ratio: 1) { 
            img.bg {
                width: 100%;
            }
    }


      @media screen and (max-width: 420px) {
        /* Specific to this particular image */
        img.bg {
          
        }
      }

      @media screen and (min-width: 421px) {
        /* Specific to this particular image */
        
      }`
  ],
  template: `<img class="bg animated fadeIn" src="{{image}}" [ngStyle]="setStyles()"/>`,
})
export class BackgroundComponent {
    @Input() image: string;
    @Input() blur: number;

    setStyles() {
      if (!this.blur || this.blur < 1) {
        return null;
      }

      const blurValue = `blur(${this.blur}px)`;

      return {
        '-webkit-filter': blurValue,
        '-moz-filter': blurValue,
        '-o-filter': blurValue,
        '-ms-filter': blurValue,
        'filter': blurValue,
      };

    }
}
