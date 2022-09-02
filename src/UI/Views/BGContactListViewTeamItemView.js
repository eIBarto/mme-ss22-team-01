"use strict";

import BGContactListViewItemView from "./BGContactListViewItemView.js";

export default class BGContactListViewTeamItemView extends BGContactListViewItemView {
    _applyData() {
        const data = this._data;

        this.name = data.name;
        this.detail = data.message;
    }
}