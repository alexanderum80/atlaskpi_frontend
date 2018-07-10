export class MenuItem {
    /**
     * Item's id
     */
    public id?: string;

    /**
     * Item's title
     */
    public title?: string;

    /**
     * Internal property used to save the original icon
     */
    public originalIcon?: string;

    /**
     * Zmdi icon
     */
    public icon?: string;

    /**
     * The order in which this item should be shown
     */
    public order?: number;

    /**
     * If this item affers navigation to a different route. This property will hold the route name
     */
    public route?: string;

    /**
     * IF the item offers URL navigation. You should set this property to the desire path
     */
    public url?: string;

    /**
     * Allow you to set an external navigation url
     */
    public externalUrl?: string;

    /**
     * Children elements for this item
     */
    public children?: MenuItem[];

    /**
     * Determine if the element should be shown as active or not
     */
    public active?: boolean;

    /**
     * Parent Item
     */
    public parent?: MenuItem;

    /**
     * disabled the item
     */
    public disabled?: boolean;
}
