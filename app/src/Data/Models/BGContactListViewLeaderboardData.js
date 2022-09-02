"use strict";

import BGListViewItemData from "./BGListViewItemData.js";

export default class BGListViewLeaderboardData extends BGListViewItemData {
    constructor(id, createdAt, updatedAt, name, score) {
        super(id, createdAt, updatedAt);

        this._name = name;
        this._score = score;
    }

    get name() {
        return this._name;
    }

    get score() {
        return this._score;
    }
}