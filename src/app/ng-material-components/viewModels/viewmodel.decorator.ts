// import { FormGroup } from '@angular/forms';

// export interface ViewModelDecoratorConfig {
//     model: any;
// }

// export function ViewModel(config: ViewModelDecoratorConfig) {
//     console.log('View Model Decorator');

//     return function(target) {
//         if (!target.prototype.__metadata__) {
//             target.prototype.__metadata__ = {};
//         }

//         target.prototype.__metadata__.model = config;
//         target.prototype.__metadata__.fg = new FormGroup({});

//         console.log('Our decorate class', target.prototype.__metadata__);
//     };
// }

// function addForControls(metadata) {
//     // Object.keys(metadata.)
// }
