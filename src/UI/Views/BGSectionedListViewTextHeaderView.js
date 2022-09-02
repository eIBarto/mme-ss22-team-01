"use strict";

import BGSectionedListViewHeaderView from "./BGSectionedListViewHeaderView.js";

export default class BGSectionedListViewTextHeaderView extends BGSectionedListViewHeaderView {
    _applyData() {
        this.title = this.data;
    }
}