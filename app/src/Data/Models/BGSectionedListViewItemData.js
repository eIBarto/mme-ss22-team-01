"use strict";

import BGListViewItemData from "./BGListViewItemData.js";

export default class BGSectionedListViewItemData extends BGListViewItemData {

    get section() {
        return this._section;
    }

    set section(value) {
        this._section = value;
    }

    constructor(id, createdAt, updatedAt, section) {
        super(id, createdAt, updatedAt);

        this.section = section;
    }
}