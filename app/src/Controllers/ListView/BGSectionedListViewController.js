"use strict";

import { Corners, RoundedCorner, Padding, Gap } from "../../UI/libs/WrappedUI.js";
import BGChallengeListViewItemView from "../../UI/Views/BGChallengeListViewItemView.js";
import BGListViewController from "./BGListViewController.js";
import BGSectionedListView from "../../UI/Views/BGSectionedListView.js";

export default class BGSectionedListViewController extends BGListViewController { // ob man den wirklich braucht?

    constructor(itemViewClass, headerViewClass) {
        super(itemViewClass);

        this.headerViewClass = headerViewClass;
    }

    set headerViewClass(value) {
        this.listView.headerViewClass = value;
    }

    get headerViewClass() {
        return this.listView.headerViewClass;
    }

    get sections() {
        return this.listView.sections;
    }

    set sections(value) {
        this.listView.sections = value;
    }

    _createListView() {
        const sectionedListView = new BGSectionedListView();
        sectionedListView.padding = Padding.all("10px");
        sectionedListView.gap = Gap.all("10px");
        sectionedListView.addEventListener(BGSectionedListView.ITEM_VIEW_CREATED_NOTIFICATION_TYPE, this._onItemViewCreated.bind(this)); //bind needed?
        sectionedListView.addEventListener(BGChallengeListViewItemView.ITEM_VIEW_SELECTED_NOTIFICATION_TYPE, this._onItemViewClicked.bind(this)); //bind needed?
        sectionedListView.corners = Corners.bottom(new RoundedCorner("15px"));
        this._listView = sectionedListView;

        return sectionedListView;
    }

    _onItemViewCreated(event) {
        
    }

    _onItemViewClicked(event) {
        const itemView = event.data;
        console.log(itemView);
    }
}