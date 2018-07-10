import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { groupBy, includes } from 'lodash';

interface Itypography {
    enable: boolean;
    black: boolean;
    cursive: boolean;
    under: boolean;
    size: string;
    color: string;
}

const defaultType = {
    enable: false,
    black: true,
    cursive: false,
    under: false,
    size: '12',
    color: '#000000'
};

@Injectable()
export class CustomFormat {
    enableCustom: boolean;
    xValue: Itypography;
    serieValue: Itypography;
    totalValue: Itypography;
    yValueColor: string;

    decimals: number;
    altas_definition_id: string;

    shared: boolean;
    crosshairs: boolean;

    suffix: string;
    prefix: string;


    constructor() {
        this.enableCustom = false;
        this.xValue = {
            enable: false,
            black: true,
            cursive: false,
            under: false,
            size: '12',
            color: '#000000'
        };
        this.serieValue = {
            enable: false,
            black: true,
            cursive: false,
            under: false,
            size: '12',
            color: '#000000'
        };
        this.totalValue = {
            enable: false,
            black: true,
            cursive: false,
            under: false,
            size: '12',
            color: '#000000'
        };
        this.yValueColor = '#000000';

        this.decimals = 2;
        this.altas_definition_id = 'simple';

        this.shared = false;
        this.crosshairs = false;

        this.suffix = '';
        this.prefix = '';

    }

}

