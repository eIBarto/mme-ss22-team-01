"use strict";

import {
    Databases,
    Query,
    Teams
} from "appwrite";
import AppWriteAuthentication from "../AppWrite/AppWriteAuthentication.js";
import AppWriteClient from "../AppWrite/AppWriteClient.js";
import AppWriteConfig from "../AppWrite/AppWriteConfig.js";
import BGChallengeListViewItemView from "../UI/Views/BGChallengeListViewItemView.js";
import BGChallengeCreationController from "./BGChallengeCreationController.js";
import BGSearchableListViewController from "./ListView/BGSearchableListViewController.js";
import BGSectionedListViewChallengeData from "../Data/Models/BGSectionedListViewChallengeData.js";
import BGSectionedListViewTextHeaderView from "../UI/Views/BGSectionedListViewTextHeaderView.js";
import BGSectionedListViewSectionData from "../Data/Models/BGSectionedListViewSectionData.js";

export default class BGChallengesListViewController extends BGSearchableListViewController { // extends BGListViewController+ // BGSearchableListViewController

    constructor(listMode = BGChallengesListViewController.ListMode.default) {
        super(BGChallengeListViewItemView, BGSectionedListViewTextHeaderView, listMode); //Todo die classes noch in statische getter umwandeln, falls gewünscht. Ändern sich ja nie


        (async () => {
            await this.updateSections();
        })();
    }

    _createItemCreationController() {
        const controller = new BGChallengeCreationController(AppWriteAuthentication.sharedInstance.user.$id);

        controller.addEventListener(BGChallengeCreationController.ITEM_CONFIGURATION_FINISHED_NOTIFICATION_TYPE, this._didFinishConfiguration.bind(this));
        return controller;
    }

    _didFinishConfiguration(event) {
        this.hideItemCreationController();
        
        (async () => {
            await this.updateSections();
        })()
    }

    async updateSections(title) {

        const client = AppWriteClient.sharedInstance.client;
        const databases = new Databases(client, AppWriteConfig.DATABASE_SHARED_ID);

        const userId = AppWriteAuthentication.sharedInstance.user.$id; // TODO oder account.get()

        const t = new Teams(client);
        const teamsResult = await t.list();
        const teams = teamsResult.teams;

        for (const team of teams) {
            if (team.name === "chat") {
                const memberships = await t.getMemberships(team.$id);
                const membership = memberships.memberships.find(membership => membership.userId !== userId);
                if (membership !== undefined) team.name = membership.userName;
            }
        }

        const sections = teams.map(team => new BGSectionedListViewSectionData(team.$id, team.$createdAt, team.$updatedAt, [], team.name));

        sections.push(new BGSectionedListViewSectionData(userId, 0, Number.MAX_SAFE_INTEGER, [], "Aktiv"));

        const assignmentsResult = await databases.listDocuments(AppWriteConfig.DATABASE_SHARED_COLLECTION_ASSIGNMENTS_ID, [Query.equal("assignee", sections.map(section => section.id))]); // Todo checken ob des basd oder statt id einfach reference verwenden
        const unassignedSection = new BGSectionedListViewSectionData("unassigned", 0, Number.MIN_SAFE_INTEGER, [], "Verfügbar");
        sections.push(unassignedSection);

        const filters = (title === undefined || title.length < 1) ? [] : [Query.search("title", title)]
        const challengesResult = await databases.listDocuments(AppWriteConfig.DATABASE_SHARED_COLLECTION_CHALLENGES_ID, filters); // Todo auch description durchsuchen
        challengesResult.documents.map(document => {
            const assignment = assignmentsResult.documents.find(assignment => assignment.challenge === document.$id);
            if (assignment !== undefined) {
                const section = sections.find(section => section.id === assignment.assignee);
                if (section === undefined) throw new Error("Failed to match section");
                section.addItem(new BGSectionedListViewChallengeData(document.$id, document.$createdAt, document.$updatedAt, document.title, document.description, document.duration, document.score, document.origin, document.author, assignment.$createdAt));
            } else {
                unassignedSection.addItem(new BGSectionedListViewChallengeData(document.$id, document.$createdAt, document.$updatedAt, document.title, document.description, document.duration, document.score, document.origin, document.author));
            }
        });

        this.sections = sections.filter(section => section.isEmpty === false).sort((sectionA, sectionB) => sectionA.updatedAt < sectionB.updatedAt);;
    }

    _onItemViewCreated(event) {
        const itemView = event.data;
        //const index = this.items.length;
        //console.log(index);
        //itemView.backgroundColor = (index % 2 === 0) ? new Color(245, 245, 245) : Color.white;
        itemView.addEventListener(BGChallengeListViewItemView.CHALLENGE_ACCEPT_NOTIFICATION_TYPE, this._onChallengeViewAccepted.bind(this));
        itemView.addEventListener(BGChallengeListViewItemView.CHALLENGE_FINISH_NOTIFICATION_TYPE, this._onChallengeViewFinished.bind(this));
        itemView.addEventListener(BGChallengeListViewItemView.CHALLENGE_CANCEL_NOTIFICATION_TYPE, this._onChallengeViewCancelled.bind(this));
    }

    _onChallengeViewAccepted(event) {
        const challengeView = event.data;
        const challengeId = challengeView.data.id;

        const client = AppWriteClient.sharedInstance.client;
        const databases = new Databases(client, AppWriteConfig.DATABASE_SHARED_ID);

        const userId = AppWriteAuthentication.sharedInstance.user.$id; // TODO oder account.get()
        (async () => {
            const result = await databases.createDocument(AppWriteConfig.DATABASE_SHARED_COLLECTION_ASSIGNMENTS_ID, "unique()", {
                challenge: challengeId, assignee: userId
            });
            await this.updateSections();
            console.log(result);
        })()
    }

    _onChallengeViewFinished(event) {
        const challengeView = event.data;
        const challenge = challengeView.data;
        const assigneeId = challenge.section.id;

        (async () => {
            await this.removeChallengeAssignment(challenge.id, assigneeId);
            await this.updateScore(assigneeId, challenge.score);
            await this.updateSections();
        })()
    }

    _onChallengeViewCancelled(event) {
        const challengeView = event.data;

        const challenge = challengeView.data;
        const assigneeId = challenge.section.id;

        (async () => {
            await this.removeChallengeAssignment(challenge.id, assigneeId);
            await this.updateScore(assigneeId, challenge.score * -1);
            await this.updateSections();
        })()
    }

    async updateScore(assigneeId, score) {
        const client = AppWriteClient.sharedInstance.client;
        const databases = new Databases(client, AppWriteConfig.DATABASE_SHARED_ID);

        const result = await databases.listDocuments(AppWriteConfig.DATABASE_SHARED_COLLECTION_PREVIEW_ID, [Query.equal("$id", assigneeId)]);
        const documents = result.documents;
        if (documents.length > 0) {
            const result = await databases.updateDocument(AppWriteConfig.DATABASE_SHARED_COLLECTION_PREVIEW_ID, assigneeId, { score: Math.max(documents[0].score + score, 0) });
            console.log(result);
        }
        else {
            const result = await databases.createDocument(AppWriteConfig.DATABASE_SHARED_COLLECTION_PREVIEW_ID, assigneeId, { score: Math.max(score, 0) });
            console.log(result);
        }
    }

    async removeChallengeAssignment(challengeId, assigneeId) {
        const client = AppWriteClient.sharedInstance.client;
        const databases = new Databases(client, AppWriteConfig.DATABASE_SHARED_ID);

        const assignments = await databases.listDocuments(AppWriteConfig.DATABASE_SHARED_COLLECTION_ASSIGNMENTS_ID, [Query.equal("challenge", challengeId), Query.equal("assignee", assigneeId)]);
        if (assignments.documents.length > 0) {
            const assignment = assignments.documents[0];
            const result = await databases.deleteDocument(AppWriteConfig.DATABASE_SHARED_COLLECTION_ASSIGNMENTS_ID, assignment.$id);

            console.log(result);
        }
    }

    _onSearchTextChangeEnd() {
        const searchText = this.searchText;

        let title = searchText;
        if (searchText.length < 1) title = undefined;

        (async () => {
            await this.updateSections(title);
        })();
    }

    _onSearchStart() {
        this.searchBar.focus();
    }

    _onSearchEnd() {
        this.searchBar.clear();

        (async () => {
            await this.updateSections();
        })();
    }
}