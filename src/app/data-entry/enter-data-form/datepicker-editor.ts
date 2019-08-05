import * as moment from 'moment';

export function getDatePicker(){

    // function to act as a class
    function Datepicker() {}

    // gets called once before the renderer is used
    Datepicker.prototype.init = function(params) {
        let dateRaw = params.value;
        let dateVal;
        // create the cell
        this.eInput = document.createElement('input');
        this.eInput.setAttribute("type", "date");
        
        //- ag grid classes to center the input vertically
        this.eInput.setAttribute("class", "ag-input-text-wrapper ag-cell-edit-input");


        if(params.value != ""){    
            let userOffset= dateRaw.getTimezoneOffset()*60000;
            dateVal =  moment( dateRaw.getTime() + userOffset).format('YYYY-MM-DD');
            this.eInput.value = dateVal;
            //this.eInput.value = moment(dateRaw).format('YYYY-MM-DD');;
        }
        else{
            //current date if the input is empty 
            dateVal = moment().format('YYYY-MM-DD');
            this.eInput.value = dateVal;
        }

        // https://jqueryui.com/datepicker/
        // $(this.eInput).datepicker({
        //     dateFormat: 'dd/mm/yy'
        // });
    };

    // gets called once when grid ready to insert the element
    Datepicker.prototype.getGui = function() {
        return this.eInput;
    };

    // focus and select can be done after the gui is attached
    Datepicker.prototype.afterGuiAttached = function() {
        this.eInput.focus();
        this.eInput.select();
    };

    // returns the new value after editing
    Datepicker.prototype.getValue = function() {
        return this.eInput.value;
    };

    // any cleanup we need to be done here
    Datepicker.prototype.destroy = function() {
        // but this example is simple, no cleanup, we could
        // even leave this method out as it's optional
    };

    // if true, then this editor will appear in a popup
    Datepicker.prototype.isPopup = function() {
        // and we could leave this method out also, false is the default
        return false;
    };

    return Datepicker;

} 