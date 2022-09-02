"use strict";

import { Teams } from "appwrite";
import AppWriteAuthentication from "../AppWrite/AppWriteAuthentication.js";
import AppWriteClient from "../AppWrite/AppWriteClient.js";
import BGContactListViewTeamItemView from "../UI/Views/BGContactListViewTeamItemView.js";
import BGListViewTeamItemData from "../Data/Models/BGListViewTeamItemData.js";
import BGSearchableListViewController from "./ListView/BGSearchableListViewController.js";
import BGSectionedListViewTextHeaderView from "../UI/Views/BGSectionedListViewTextHeaderView.js";
import BGMemberCreationController from "./BGMemberCreationController.js";
import BGSectionedListViewSectionData from "../Data/Models/BGSectionedListViewSectionData.js";
import { Color } from "../UI/libs/WrappedUI.js";

export default class BGMembersListViewController extends BGSearchableListViewController {

    get teamId() {
        return this._teamId;
    }
    constructor(teamId, listMode = BGMembersListViewController.ListMode.default) {
        super(BGContactListViewTeamItemView, BGSectionedListViewTextHeaderView, listMode); //Todo die classes noch in statische getter umwandeln, falls gewünscht. Ändern sich ja nie

        //this._createManager();

        this._teamId = teamId;
        (async () => {
            await this.updateSections();
        })();

    }

    _createItemCreationController() {
        const controller = new BGMemberCreationController();
        controller.addEventListener(BGTeamCreationController.ITEM_CONFIGURATION_FINISHED_NOTIFICATION_TYPE, this._didFinishConfiguration.bind(this));

        return controller;
    }

    _didFinishConfiguration(event) {
        this.hideItemCreationController();
        
        (async () => {
            await this.updateSections();
        })()
    }

    async updateSections(filter) {
        const teamId = this.teamId;
        if (teamId === undefined) return;
        const client = AppWriteClient.sharedInstance.client;
        const teams = new Teams(client);

        const t = await teams.getMemberships(teamId, filter);

        const friends = new BGSectionedListViewSectionData("members", 0, 0, [], "");
        const userId = AppWriteAuthentication.sharedInstance.user.$id;

        t.memberships.forEach(membership => {
            if (membership.userId === userId) return;
            const item = new BGListViewTeamItemData(membership.userId, membership.$createdAt, membership.$updatedAt, membership.userName, 0, "");
            friends.addItem(item);
        });

        this.sections = [friends].filter(section => section.isEmpty === false);
    }


    _onItemViewCreated(event) {
        const itemView = event.data;
        const index = this.items.length;

        itemView.backgroundColor = new Color(245, 245, 245);
    }

    _onItemViewClicked(event) {
        const itemView = event.data;
        const item = itemView.data;
    }

    _onSearchTextChangeEnd() {
        const searchText = this.searchText;

        let filter = searchText;
        if (searchText.length < 1) filter = undefined;

        console.log("ended");

        (async () => {
            await this.updateSections(filter);
        })()
    }

    _onSearchStart() {
        this.searchBar.focus();
    }

    _onSearchEnd() {
        this.searchBar.clear();


        (async () => {
            await this.updateSections();
        })()
    }

    _onItemConfigurationFinished(event) {
        this.hideItemCreationController();
    }
}