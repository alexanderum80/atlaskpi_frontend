import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { clone, flatten, uniq } from 'lodash';

import { SelectionItem } from '../../../../ng-material-components/index';
import { AggregateFunctions } from '../../../../shared/domain/kpis/aggregates';
import { IDataSource } from '../../../../shared/domain/kpis/data-source';
import { IKPI } from '../../../../shared/domain/kpis/kpi';
import { ArithmeticOperators } from '../../../../shared/domain/kpis/operators';

export interface ISuggestion {
    id: string;
    title: string;
    subtitle ? : string;
    content ? : string;
    selected: boolean;
}

export interface ISuggestionGroup {
    name: string;
    allSuggestions: ISuggestion[];
    suggestions: ISuggestion[];
}

export interface IExpressionContext {
    selection: string;
    query: string;
    data: string;
    suggestionGroups: ISuggestionGroup[];
}

export interface ISuggestionContext {
    suggestion: ISuggestion;
    prev: ISuggestion;
    next: ISuggestion;
}

const DeleteKeys = {
    Backspace: 'Backspace',
    Delete: 'Delete'
};

const ControlKeys = {
    Shift: 'Shift',
    Control: 'Control',
    Alt: 'Alt',
    Meta: 'Meta',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight'
};

const SelectionKeys = {
    Enter: 'Enter',
    Tab: 'Tab',
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown'
};


@Injectable()
export class ExpressionParserViewModel {

    showSuggestions = false;
    suggestionGroups: ISuggestionGroup[];

    private _selectionKeyList = Object.keys(SelectionKeys);
    private _autoCompletionSuffixs = ['@', '(', ...ArithmeticOperators.map(o => o.symbol)];
    private _suggestionTriggers = [...this._autoCompletionSuffixs, ')'];
    private _kpis: IKPI[];
    private _dataSources: IDataSource[];
    private _dataSourcePaths: string[];
    private _ele: HTMLTextAreaElement;
    private _expression: FormControl;
    private _contextDelimiters = [' ', '(', '@', ...ArithmeticOperators.map(o => o.symbol)];
    private _selectedSuggestion: ISuggestion;


    get aggregates(): SelectionItem[] {
        return AggregateFunctions;
    }

    setNativeElement(ele: HTMLTextAreaElement, expression: FormControl) {
        this._ele = ele;
        this._expression = expression;
    }

    updateKpis(kpis: IKPI[]) {
        if (kpis !== this._kpis) {
            this._kpis = kpis;
        }
    }

    updateDataSources(dataSources: IDataSource[]) {
        const that = this;

        if (dataSources !== this._dataSources) {
            this._dataSources = dataSources;
            // prepare data source paths
            that._dataSourcePaths = [];

            dataSources.forEach(ds => {
                that._dataSourcePaths.push(ds.name);

                ds.fields.forEach(f => {
                    that._dataSourcePaths.push(`${ds.name}.${f.path}`);
                });
            });
        }
    }

    processKeyDownEvent(event: KeyboardEvent) {
        // console.log(`code: ${event.code} and key: ${event.key}`);
        let suggestionsUpdated = false;

        // do nothing for certain keys
        if (Object.keys(ControlKeys).indexOf(event.key) !== -1 || Object.keys(DeleteKeys).indexOf(event.code) !== -1) {
            return;
        }

        // when user press enter just use the selected element
        if (this._selectionKeyList.indexOf(event.code) !== -1) {
            this._processSelectionKeys(event);
            return;
        }

        // in case the user start typing without openning the suggestions
        if (!this.suggestionGroups) {
            this.suggestionGroups = this._getDefaultSuggestions();
            this.showSuggestions = true;
        }

        // process suggestion triggers via KEY property
        if (this._suggestionTriggers.indexOf(event.key) !== -1) {
            switch (event.key) {
                case '@':
                    this.suggestionGroups = [this._getKpiSuggestions()];
                    suggestionsUpdated = true;
                    break;
                case '(':
                case ')':
                case '+':
                case '-':
                case '*':
                case '/':
                    this.suggestionGroups = this._getDefaultSuggestions();
                    suggestionsUpdated = true;
                    break;
                    // default:
                    //     this.suggestionGroups = this._getDefaultSuggestions();
                    //     break;
            }
        }

        // process show and hide suggestions via code
        switch (event.code) {
            case 'Space':
                if (event.ctrlKey) {
                    this.suggestionGroups = this._getDefaultSuggestions();
                    suggestionsUpdated = true;
                }
                break;
            case 'Escape':
                suggestionsUpdated = false;
                return this.showSuggestions = false;
        }

        const context = this._getExpressionContext(this._ele, event.key);
        console.log(JSON.stringify(context));

        if (this.suggestionGroups.length > 0) {
            this.showSuggestions = true;
        }

        if (context && context.suggestionGroups) {
            this.suggestionGroups = context.suggestionGroups;
        }
    }

    processKeyUpEvent(event: KeyboardEvent) {
        // only respond to Backspace and delete here for filtering
        if (Object.keys(DeleteKeys).indexOf(event.code) === -1) {
            return;
        }

        // const selection = this._getSelection(this._ele);
        const context = this._getExpressionContext(this._ele);

        if (context && context.suggestionGroups) {
            this.suggestionGroups = context.suggestionGroups;
        }
    }

    processSelectedSuggestion(suggestion: ISuggestion) {
        const context = this._getExpressionContext(this._ele);
        let autocompleteText = suggestion ? suggestion.title : '';
        this.showSuggestions = false;

        // in case we have a context I need to update the text to autocomplete
        if (context && context.query) {
            autocompleteText = autocompleteText.indexOf(context.query) !== -1
                ? autocompleteText.substr(context.query.length)
                : autocompleteText;
        }

        this.insertAtCursor(this._ele, autocompleteText);
        this._expression.setValue(this._ele.value);
    }

    updateSelectedSuggestion(suggestion: ISuggestion) {
        const that = this;
        if (!suggestion) {
            return;
        }

        this.suggestionGroups.forEach(g => {
            g.suggestions.forEach(s => {
                s.selected = s.id === suggestion.id;

                if (s.selected) {
                    that._selectedSuggestion = s;
                }
            });
        });
    }

    private _processSelectionKeys(event: KeyboardEvent) {
        event.preventDefault();

        switch (event.code) {
            case SelectionKeys.Enter:
            case SelectionKeys.Tab:
                this.processSelectedSuggestion(this._selectedSuggestion);
                this.showSuggestions = false;
                break;
            default:
                this._moveSelection(event.code);
                break;
        }
    }

    private _moveSelection(code: string) {
        if (!this.suggestionGroups || this.suggestionGroups.length === 0) {
            return;
        }

        const context = this._getSelectedSuggestionContext();

        if (SelectionKeys.ArrowDown === code) {
            // move down
            if (!this._selectedSuggestion) {
                this.updateSelectedSuggestion(context.suggestion);
            } else {
                this.updateSelectedSuggestion(context.next);
            }
        } else if (SelectionKeys.ArrowUp === code) {
            // move up
            if (!this._selectedSuggestion) {
                this.updateSelectedSuggestion(context.suggestion);
            } else {
                this.updateSelectedSuggestion(context.prev);
            }
        }
    }

    private _getSelectedSuggestionContext(): ISuggestionContext {
        const that = this;

        // I could simplify a lot this by flatten the list of suggestions
        const suggestions = flatten(this.suggestionGroups.map(g => g.suggestions));

        if (suggestions && suggestions.length > 0) {
            for (let i = 0; i < suggestions.length; i++) {
                if (suggestions[i].selected) {
                    return this._createSuggestionContext(i, suggestions);
                }
            }

            return this._createSuggestionContext(0, suggestions);
        }

        return null;
    }

    private _createSuggestionContext(index: number, suggestions: ISuggestion[]): ISuggestionContext {
        const context = {
            suggestion: null,
            prev: null,
            next: null
        };

        context.suggestion = suggestions[index];

        if (suggestions.length === 1) {
            context.next = context.suggestion;
            context.prev = context.suggestion;
            return context;
        }

        // if at the begginning
        if (index === 0) {
            context.next = suggestions[index + 1];
            context.prev = suggestions[suggestions.length - 1];
            return context;
        }

        // if at the end
        if (index === suggestions.length - 1) {
            context.next = suggestions[0];
            context.prev = suggestions[index - 1];
            return context;
        }

        context.next = suggestions[index + 1];
        context.prev = suggestions[index - 1];

        return context;
    }

    private _getAggregateSuggestions(): ISuggestionGroup {
        const allSuggestions = AggregateFunctions.map(a => ({
            id: a.id.toString(),
            title: a.title,
            selected: false
        }));

        return {
            name: 'Aggregates',
            allSuggestions: allSuggestions,
            suggestions: clone(allSuggestions)
        };

    }

    private _getKpiSuggestions(): ISuggestionGroup {
        const allSuggestions = this._kpis.map(k => ({
            id: k._id,
            title: `{${k.name}}`,
            subtitle: k.description,
            selected: false
        }));

        return {
            name: 'KPIs',
            allSuggestions: allSuggestions,
            suggestions: clone(allSuggestions)
        };

    }

    private _getDataSourceSuggestions(): ISuggestionGroup {
        const allSuggestions = this._dataSources.map(k => ({
            id: k.name,
            title: k.name,
            subtitle: k.name,
            selected: false
        }));

        return {
            name: 'Data Sources',
            allSuggestions: allSuggestions,
            suggestions: clone(allSuggestions)
        };
    }

    private _getDefaultSuggestions(): ISuggestionGroup[] {
        return [
            this._getKpiSuggestions()
        ];
    }

    // private _filterCompletions(context: IExpressionContext) {
    //     if (!context || !context.data || !this.suggestionGroups) {
    //         return;
    //     }

    //     const dataTokens = context.data.split('.');
    //     const query = dataTokens[dataTokens.length - 1];

    //     this.suggestionGroups = this._getFilteredSelectionGroup(query);
    // }

    private _getExpressionContext(field: HTMLTextAreaElement, key?: string): IExpressionContext {
        const selection = this._getSelection(field, key);
        let suggestionGroups: ISuggestionGroup[];

        /**
         *  once I have the previos text I need to analize the context ex:
         *  SUM(sales.) -> in this case I need to search for the context path so I need to search backward until 
         *  I find a space or ( or arithmetic operation
         **/

        let data: string;
        let query: string;

        if (key !== '@' && this._autoCompletionSuffixs.indexOf(key) !== -1) {
            return {
                selection: null,
                query: null,
                data: null,
                suggestionGroups: this._getDefaultSuggestions()
            };
        }

        if (selection.length <= 1) {
            return {
                selection: selection,
                query: selection,
                data: selection,
                suggestionGroups: this._getFilteredSelectionGroup(selection)
            };
        }

        // in the case where a selection wih a mouse comes after a prefix I need to change the start point
        const selectionStartingPoint = key !== undefined && key !== '' ?
            selection.length - 1 : selection.length;

        for (let i = selectionStartingPoint; i--; i >= 0) {
            // check for arithmetic operator
            const delimiter = this._contextDelimiters.find(d => d === selection[i]);

            if (delimiter) {
                data = selection.substr(i + 1).trim();
                // clean data
                if (this._contextDelimiters.indexOf(data[0]) !== -1) {
                    data = data.length > 1 ? data.substr(1) : ' ';
                }

                break;
            }
        }

        if (data) {

            // once the data its found I need to filter suggestions by:
            // kpi names (should contain an @)
            // field paths (should not contain an @)
            const contextTokens = data.split('.');

            if (data.indexOf('@') !== -1) {
                query = data.replace('@', '');
            } else {
                query = contextTokens[contextTokens.length - 1].trim();
            }

            // we could have a few different contexts example:
            // - kpi name: @revenue
            // - data source: sales, sales.amount, sales.location.city

            // search context in kpis (only if we have a single token meaning, there no .s, ex: sales.amount)
            if (contextTokens.length === 1) {
                const kpi = this._kpis.find(k => k.name === data);
            }

            // search context in datasources to offer user for new field suggestions
            const dataEndsWithDot = data.endsWith('.');
            if (query && query.trim() && this._autoCompletionSuffixs.indexOf(key) === -1) {
                suggestionGroups = this._getFilteredSelectionGroup(query);
            }
        }

        return {
            selection,
            query,
            data,
            suggestionGroups
        };
    }

    private _getFilteredSelectionGroup(query: string): ISuggestionGroup[] {
        if (!this.suggestionGroups) {
            return null;
        }

        const suggestionGroups = clone(this.suggestionGroups);
        suggestionGroups.forEach(g => {
            g.suggestions = g.allSuggestions.filter(s => s.title.toLowerCase().indexOf(query.toLowerCase()) === 0);
        });

        return suggestionGroups;
    }

    private _getSelection(field: HTMLTextAreaElement, key?: string): string {
        let startPos = 0;
        let endPos = 0;
        const doc = document as any;


        if (doc.selection) {
            field.focus();
            // in effect we are creating a text range with zero
            // length at the cursor location and replacing it
            // with myValue
            const sel = doc.selection.createRange();
            // TODO: Finish this section
            // Mozilla/Firefox/Netscape 7+ support
        } else if (field.selectionStart || field.selectionStart === 0) {
            field.focus();
            startPos = field.selectionStart;
            endPos = field.selectionEnd;
            // field.value = field.value.substring(0, startPos) + myValue + field.value.substring(endPos, field.value.length);
            // field.setSelectionRange(endPos + myValue.length, endPos + myValue.length);
        }

        let selection = field.value.substring(0, endPos);

        if (key && key !== '.' && this._contextDelimiters.indexOf(key) === -1) {
            selection += key;
        }

        return selection;
    }

    private insertAtCursor(field, myValue) {
        const doc = document as any;

        field.focus();

        // IE support
        if (doc.selection) {
            // in effect we are creating a text range with zero
            // length at the cursor location and replacing it
            // with myValue
            const sel = doc.selection.createRange();
            sel.text = myValue;
            // Mozilla/Firefox/Netscape 7+ support
        } else if (field.selectionStart || field.selectionStart === '0') {
            // Here we get the start and end points of the
            // selection. Then we create substrings up to the
            // start of the selection and from the end point
            // of the selection to the end of the field value.
            // Then we concatenate the first substring, myValue,
            // and the second substring to get the new value.
            const startPos = field.selectionStart;
            const endPos = field.selectionEnd;
            field.value = field.value.substring(0, startPos) + myValue + field.value.substring(endPos, field.value.length);
            field.setSelectionRange(endPos + myValue.length, endPos + myValue.length);
        } else {
            field.value += myValue;
        }
    }
}
