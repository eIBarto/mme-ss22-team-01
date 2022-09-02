"use strict";

import BGListViewItemData from "./BGListViewItemData.js";

export default class BGSectionedListViewSectionData extends BGListViewItemData {

    get header() {
        return this._header;
    }

    set header(value) {
        this._header = value;
    }

    get items() {
        return this._items;
    }

    set items(value) {
        value.forEach(item => item.section = this); //todo addItem
        this._items = value;
    }

    addItem(item) {
        item.section = this;
        this.items.push(item);
    }

    get isEmpty() {
        return this.items.length < 1;
    }

    constructor(id, createdAt, updatedAt, items, header) {
        super(id, createdAt, updatedAt);
        
        this.items = items;
        this.header = header;
    }

    matches(criteria) {
        return this.items.some(item => item.matches(criteria) === true);
    }
}