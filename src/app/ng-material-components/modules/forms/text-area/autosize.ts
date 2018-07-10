/* tslint:disable */
export interface CustomCSS extends CSSStyleDeclaration {
    resize: string;
}

const set = (typeof Set === 'function') ? new Set() : (function() {
    const list: any = [];

    return {
        has(key: string) {
            return Boolean(list.indexOf(key) > -1);
        },
        add(key: string) {
            list.push(key);
        },
        delete(key: string) {
            list.splice(list.indexOf(key), 1);
        },
    };
})();

let createEvent = (name: string) => new Event(name);
try {
    new Event('test');
} catch (e) {
    // IE does not support `new Event()`
    createEvent = (name) => {
        const evt = document.createEvent('Event');
        evt.initEvent(name, true, false);
        return evt;
    };
}

function assign(ta: any, options: any) {
    if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || set.has(ta)) return;

    let heightOffset: number | null = null;
    let clientWidth: number = ta.clientWidth;
    let cachedHeight: number | null  = null;

    function init() {
        const style: CustomCSS = <CustomCSS>window.getComputedStyle(ta, undefined);

        if (style.resize === 'vertical') {
            ta.style.resize = 'none';
        } else if (style.resize === 'both') {
            ta.style.resize = 'horizontal';
        }

        if (style.boxSizing === 'content-box') {
            heightOffset = -(parseFloat(style.paddingTop || '') + parseFloat(style.paddingBottom || ''));
        } else {
            heightOffset = parseFloat(style.borderTopWidth || '') + parseFloat(style.borderBottomWidth || '');
        }
        // Fix when a textarea is not on document body and heightOffset is Not a Number
        if (isNaN(heightOffset)) {
            heightOffset = 0;
        }

        update();
    }

    function changeOverflow(value: string) {
        {
            // Chrome/Safari-specific fix:
            // When the textarea y-overflow is hidden, Chrome/Safari do not reflow the text to account for the space
            // made available by removing the scrollbar. The following forces the necessary text reflow.
            const width = ta.style.width;
            ta.style.width = '0px';
            // Force reflow:
            /* tslint:disable */
            ta.offsetWidth;
            /* tslint:enable */
            ta.style.width = width;
        }

        ta.style.overflowY = value;

        resize();
    }

    function getParentOverflows(el: any) {
        const arr: any = [];

        while (el && el.parentNode && el.parentNode instanceof Element) {
            if (el.parentNode.scrollTop) {
                arr.push({
                    node: el.parentNode,
                    scrollTop: el.parentNode.scrollTop,
                });
            }
            el = el.parentNode;
        }

        return arr;
    }

    function resize() {
        const originalHeight = ta.style.height;
        const overflows = getParentOverflows(ta);
        // Needed for Mobile IE (ticket #240)
        const docTop = document.documentElement && document.documentElement.scrollTop;

        ta.style.height = 'auto';

        const endHeight = ta.scrollHeight + heightOffset;

        if (ta.scrollHeight === 0) {
            // If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
            ta.style.height = originalHeight;
            return;
        }

        ta.style.height = endHeight + 'px';

        // used to check if an update is actually necessary on window.resize
        clientWidth = ta.clientWidth;

        // prevents scroll-position jumping
        overflows.forEach((el: any) => {
            el.node.scrollTop = el.scrollTop;
        });

        if (docTop) {
            document.documentElement.scrollTop = docTop;
        }
    }

    function update() {
        resize();

        const computed = window.getComputedStyle(ta, undefined);
        const computedHeight = Math.round(parseFloat(computed.height || ''));
        const styleHeight = Math.round(parseFloat(ta.style.height));

        // The computed height not matching the height set via resize indicates that
        // the max-height has been exceeded, in which case the overflow should be set to visible.
        if (computedHeight !== styleHeight) {
            if (computed.overflowY !== 'visible') {
                changeOverflow('visible');
            }
        } else {
            // Normally keep overflow set to hidden, to avoid flash of scrollbar as the textarea expands.
            if (computed.overflowY !== 'hidden') {
                changeOverflow('hidden');
            }
        }

        if (cachedHeight !== computedHeight) {
            cachedHeight = computedHeight;
            const evt = createEvent('autosize:resized');
            ta.dispatchEvent(evt);
        }
    }

    const pageResize = () => {
        if (ta.clientWidth !== clientWidth) {
            update();
        }
    };

    const destroy = (style: any) => {
        window.removeEventListener('resize', pageResize, false);
        ta.removeEventListener('input', update, false);
        ta.removeEventListener('keyup', update, false);
        ta.removeEventListener('autosize:destroy', destroy, false);
        ta.removeEventListener('autosize:update', update, false);
        set.delete(ta);

        Object.keys(style).forEach((key) => {
            ta.style[key] = style[key];
        });
    };

    destroy.bind(ta, {
        height: ta.style.height,
        overflowX: ta.style.overflowX,
        overflowY: ta.style.overflowY,
        resize: ta.style.resize,
        wordWrap: ta.style.wordWrap,
    });

    ta.addEventListener('autosize:destroy', destroy, false);

    // IE9 does not fire onpropertychange or oninput for deletions,
    // so binding to onkeyup to catch most of those events.
    // There is no way that I know of to detect something like 'cut' in IE9.
    if ('onpropertychange' in ta && 'oninput' in ta) {
        ta.addEventListener('keyup', update, false);
    }

    window.addEventListener('resize', pageResize, false);
    ta.addEventListener('input', update, false);
    ta.addEventListener('autosize:update', update, false);
    set.add(ta);
    ta.style.overflowX = 'hidden';
    ta.style.wordWrap = 'break-word';

    init();
}

function destroy(ta: HTMLElement) {
    if (!(ta && ta.nodeName && ta.nodeName === 'TEXTAREA')) { return; }
    const evt = createEvent('autosize:destroy');
    ta.dispatchEvent(evt);
}

function update(ta: HTMLElement) {
    if (!(ta && ta.nodeName && ta.nodeName === 'TEXTAREA')) { return; }
    const evt = createEvent('autosize:update');
    ta.dispatchEvent(evt);
}

let autosize: any = null;

// Do nothing in Node.js environment and IE8 (or lower)
if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
    autosize = (el: HTMLElement) => el;
    autosize.destroy = (el: HTMLElement) => el;
    autosize.update = (el: HTMLElement) => el;
} else {
    autosize = (el: any, options: any) => {
        if (el) {
            Array.prototype.forEach.call(el.length ? el : [el], (x: object) => assign(x, options));
        }
        return el;
    };
    autosize.destroy = (el: any) => {
        if (el) {
            Array.prototype.forEach.call(el.length ? el : [el], destroy);
        }
        return el;
    };
    autosize.update = (el: any) => {
        if (el) {
            Array.prototype.forEach.call(el.length ? el : [el], update);
        }
        return el;
    };
}

export default autosize;
