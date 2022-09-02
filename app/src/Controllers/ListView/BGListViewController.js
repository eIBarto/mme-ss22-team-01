"use strict";

import { Corners, RoundedCorner, View, Padding, Color } from "../../UI/libs/WrappedUI.js";
import BGContactListViewItemView from "../../UI/Views/BGContactListViewItemView.js";
import BGController from "../../Controllers/BGController.js";
import BGListView from "../../UI/Views/BGListView.js";

export default class BGListViewController extends BGController { // ob man den wirklich braucht?

    constructor(itemViewClass) {
        super();

        this.itemViewClass = itemViewClass;
    }

    _createContentView() {
        const contentView = super._createContentView();
        contentView.overflow = View.Overflow.hidden;

        const listView = this._createListView();
        contentView.addView(listView);

        return contentView;
    }

    get listView() {
        return this._listView;
    }

    set items(value) {
        this.listView.items = value;
    }

    get items() {
        return this.listView.items;
    }

    set itemViewClass(value) {
        this.listView.itemViewClass = value;
    }

    get itemViewClass() {
        return this.listView.itemViewClass;
    }

    _createListView() {
        const listView = new BGListView();
        listView.padding = Padding.all("10px");
        listView.addEventListener(BGListView.ITEM_VIEW_CREATED_NOTIFICATION_TYPE, this._onItemViewCreated.bind(this)); //bind needed?
        listView.addEventListener(BGContactListViewItemView.ITEM_VIEW_SELECTED_NOTIFICATION_TYPE, this._onItemViewClicked.bind(this)); //bind needed?
        listView.corners = Corners.bottom(new RoundedCorner("15px"));
        this._listView = listView;

        return listView;
    }

    _onItemViewCreated(event) {
        const itemView = event.data;
        const index = this.items.length;
        if (index % 2 === 0) itemView.backgroundColor = new Color(245, 245, 245);
    }

    _onItemViewClicked(event) {
        const itemView = event.data;
        console.log(itemView);
    }
}