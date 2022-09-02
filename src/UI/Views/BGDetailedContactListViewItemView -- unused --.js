"use strict";

import BGContactListViewItemView from "./BGContactListViewItemView.js";
import { Label } from "../libs/WrappedUI.js";

export default class BGDetailedContactListViewItemView extends BGContactListViewItemView {

    get detailLabel() {
        return this._detailLabel;
    }

    get detail() {
        return this.detailLabel.text;
    }

    set detail(value) {
        this.detailLabel.text = value;
    }

    _createContentView() {
        const contentView = super._createContentView();

        return contentView;
    }

    _createDetailLabel() {
        const label = new Label();

        label.text = "Lorem ipsum dolor";
        label.fontFamily = Label.FontFamily.sansSerif;
        this._detailLabel = label;

        return label;
    }
}