
/* I'm not sure here that this one would be extends correctly */
interface ReducedCSSStyleDeclObject {
    _className:    string; // Serving field for get classname directly from obj, have no need if use only map for it
    /* https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures */
    [key: string]: any;    // For extend object safely
};

class CompStylesHandler {
    // Map<className, RCSSObject>, where classname describe general class for some elements
    //  and RCSSObject describe reduced general CSS rules from CSSStyleDeclaration for them
    _intrs: Map<string, ReducedCSSStyleDeclObject | CSSStyleDeclaration>;
    _currClassName: string;

    constructor() {
        this._intrs = new Map<string, ReducedCSSStyleDeclObject>();
        this._currClassName = '';
    };

    _reduceStyles = (obj: CSSStyleDeclaration) => {
        let newObj: ReducedCSSStyleDeclObject = {
            _className: this._currClassName,
        };

        const refObj = this._intrs.get(this._currClassName); // err(?): possible undefined, anyway not that tho
        for (let prop in obj) {
            if (prop in refObj) {
                if (refObj[prop] === obj[prop]) {
                    // Here we check that prop exist in both variants of same by classname objects,
                    //  if so pass it to curr obj, in other case just throw out it
                    //      ps: other way through out of delete props may be slower, not sure bout that tho
                    newObj[prop] = prop; 
                }
            }
        };

        return newObj;
    };

    // [Pass all collection maybe better way]
    checkAndAddRules = (obj: CSSStyleDeclaration, className: string) => {
        // For prevent passing string deeply; have no need if it's not a problem
        this._currClassName = className;

        // If first appearance just add in map
        if (!this._intrs.has(this._currClassName)) {
            this._intrs.set(this._currClassName, obj)
        } else { 
            // In other case check correctivity of them and fix if need
            const newObj = this._reduceStyles(obj);
            this._intrs.set(this._currClassName, newObj);
        }

        this._currClassName = '';
    };

    getReducedObjects = () => {
        return this._intrs;
    };
};



/* Possible way to use */
const reduceIntersectedCompStyles = (className: string) => {
    const rshandler: CompStylesHandler = new CompStylesHandler();

    const collection = document.getElementsByClassName(className);

    for (const obj of collection) {
        const styleObj = window.getComputedStyle(obj);
        rshandler.checkAndAddRules(styleObj, className);
    };

    return rshandler.getReducedObjects();
};