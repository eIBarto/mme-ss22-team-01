"use strict";

import { Teams } from "appwrite";
import AppWriteAuthentication from "../AppWrite/AppWriteAuthentication.js";
import AppWriteClient from "../AppWrite/AppWriteClient.js";
import AppWriteTeamManager from "../Data/Managers/AppWriteTeamManager.js";
import BGContactListViewTeamItemView from "../UI/Views/BGContactListViewTeamItemView.js";
import BGListViewTeamItemData from "../Data/Models/BGListViewTeamItemData.js";
import BGSearchableListViewController from "./ListView/BGSearchableListViewController.js";
import BGSectionedListViewTextHeaderView from "../UI/Views/BGSectionedListViewTextHeaderView.js";
import BGTeamCreationController from "./BGTeamCreationController.js";
import BGSectionedListViewSectionData from "../Data/Models/BGSectionedListViewSectionData.js";
import { Color } from "../UI/libs/WrappedUI.js";

export default class BGTeamsListViewController extends BGSearchableListViewController { // extends BGListViewController+ // BGSearchableListViewController

    constructor(listMode = BGTeamsListViewController.ListMode.default) {
        super(BGContactListViewTeamItemView, BGSectionedListViewTextHeaderView, listMode); //Todo die classes noch in statische getter umwandeln, falls gewünscht. Ändern sich ja nie

        this._teamManager = this._createTeamManager();


        (async () => {
            await this.updateSections();
        })()
    }

    get teamManager() {
        return this._teamManager;
    }

    _createItemCreationController() {
        const controller = new BGTeamCreationController();
        controller.addEventListener(BGTeamCreationController.ITEM_CONFIGURATION_FINISHED_NOTIFICATION_TYPE, this._didFinishConfiguration.bind(this));

        return controller;
    }

    _didFinishConfiguration(event) {
        this.hideItemCreationController();

        (async () => {
            await this.updateSections();
        })()
    }

    _createTeamManager() {
        const teamManager = new AppWriteTeamManager();

        return teamManager;
    }

    async updateSections(filter) {
        const client = AppWriteClient.sharedInstance.client;
        const teams = new Teams(client);

        const t = await teams.list(filter);
        const groups = new BGSectionedListViewSectionData("groups", 0, 0, [], "Gruppen");
        const chats = new BGSectionedListViewSectionData("friends", 0, 0, [], "Freunde");
        const userId = AppWriteAuthentication.sharedInstance.user.$id;

        for (const team of t.teams) {
            if (team.name === "chat") {
                const memberships = await teams.getMemberships(team.$id);
                const membership = memberships.memberships.find(membership => membership.userId !== userId);
                if (membership === undefined) continue;
                chats.addItem(new BGListViewTeamItemData(team.$id, team.$createdAt, team.$updatedAt, membership.userName, 0, "test"));
            } else {
                groups.addItem(new BGListViewTeamItemData(team.$id, team.$createdAt, team.$updatedAt, team.name, 0, "test"));
            }
        }

        this.sections = [groups, chats].filter(section => section.isEmpty === false);
    }

    _onItemViewCreated(event) {
        const itemView = event.data;

        itemView.backgroundColor = new Color(245, 245, 245);
    }

    _onItemViewClicked(event) {
        this.notifyAll(event);
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
}