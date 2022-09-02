"use strict";

import { Databases, Query, Teams } from "appwrite";
import AppWriteAuthentication from "../AppWrite/AppWriteAuthentication.js";
import AppWriteClient from "../AppWrite/AppWriteClient.js";
import AppWriteConfig from "../AppWrite/AppWriteConfig.js";
import BGListViewLeaderboardData from "../Data/Models/BGContactListViewLeaderboardData.js";
import BGContactListViewLeaderboardView from "../UI/Views/BGContactListViewLeaderboardView.js";
import BGSectionedListViewTextHeaderView from "../UI/Views/BGSectionedListViewTextHeaderView.js";
import BGSectionedListViewController from "./ListView/BGSectionedListViewController.js";
import BGSectionedListViewSectionData from "../Data/Models/BGSectionedListViewSectionData.js";
import { Color } from "../UI/libs/WrappedUI.js";


export default class BGLeaderboardController extends BGSectionedListViewController {
    get aliases() {
        return ["Anonymer Hase", "Anonymer Hund", "Anonyme Katze", "Anonymer Krebs", "Anonymer Vogel", "Anonymer Apfel"];
    }

    constructor() {
        super(BGContactListViewLeaderboardView, BGSectionedListViewTextHeaderView);

        (async () => {
            await this.updateSections();
        })();
    }

    async updateSections(filter) {
        const client = AppWriteClient.sharedInstance.client;
        const databases = new Databases(client, AppWriteConfig.DATABASE_SHARED_ID);

        const userId = AppWriteAuthentication.sharedInstance.user.$id;
        const userName = AppWriteAuthentication.sharedInstance.user.name;

        const t = new Teams(client);
        const teamsResult = await t.list();
        const teams = teamsResult.teams;

        for (const team of teams) {
            if (team.name === "chat") {
                const memberships = await t.getMemberships(team.$id);
                team.name = memberships.memberships.map(membership => membership.userName).join(" + ");
            }
        }

        teams.push({ $id: userId, name: userName });
        const rankedSection = new BGSectionedListViewSectionData("ranked", 0, 0, [], "Top 3");
        const personalSection = new BGSectionedListViewSectionData("personal", 0, 0, [], "Platzierung");
        const sections = [rankedSection, personalSection];
        const previewResult = await databases.listDocuments(AppWriteConfig.DATABASE_SHARED_COLLECTION_PREVIEW_ID, [], 3, 0, "", "after", ["score"], ["DESC"]);

        previewResult.documents.forEach(document => {
            const id = document.$id;
            const team = teams.find(team => team.$id === id);
            let name = "";
            if (team === undefined) {
                const aliases = this.aliases;
                const index = id.charCodeAt(id.length - 1) % aliases.length;
                name = aliases[index];
            }
            else {
                name = team.name;
            }

            rankedSection.addItem(new BGListViewLeaderboardData(id, document.$createdAt, document.$updatedAt, name, document.score));
        });

        let personalItem = rankedSection.items.find(item => item.id === userId);
        if (personalItem === undefined) {
            const personalResult = await databases.listDocuments(AppWriteConfig.DATABASE_SHARED_COLLECTION_PREVIEW_ID, [Query.equal("$id", userId)]);
            const documents = personalResult.documents;
            if (documents.length > 0) {
                const document = documents[0];
                personalItem = new BGListViewLeaderboardData(document.$id, document.$createdAt, document.$updatedAt, userName, document.score);
            }
        }

        if (personalItem !== undefined) personalSection.addItem(personalItem);
        this.sections = sections.filter(section => section.isEmpty === false);
    }

    _onItemViewCreated(event) {
        const itemView = event.data;
        const item = itemView.data;
        const section = item.section;

        const index = section.items.indexOf(item);
        itemView.backgroundColor = (index % 2 === 0) ? new Color(245, 245, 245) : Color.transparent;
    }
}