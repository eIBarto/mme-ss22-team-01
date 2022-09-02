"use strict";

import BGContactListViewItemView from "./BGContactListViewItemView";

export default class BGContactListViewLeaderboardView extends BGContactListViewItemView {
    _applyData() {
        const data = this._data;

        this.name = data.name;
        this.detail = data.score;
    }
}