"use strict";

import { Databases, Query } from "appwrite";
import AppWriteClient from "../AppWrite/AppWriteClient.js";
import AppWriteConfig from "../AppWrite/AppWriteConfig.js";
import BGChallengeCreationController from "./BGChallengeCreationController.js";
import BGChallengesListViewController from "./BGChallengeListViewController.js";
import BGSectionedListViewChallengeData from "../Data/Models/BGSectionedListViewChallengeData.js";
import BGSectionedListViewSectionData from "../Data/Models/BGSectionedListViewSectionData.js";

export default class BGTeamChallengesListViewController extends BGChallengesListViewController {
    constructor(containerId, listMode = BGChallengesListViewController.ListMode.default) {
        super(listMode);

        this._containerId = containerId;

        (async () => {
            await this.updateSections();
        })();
    }

    _createItemCreationController() {
        const controller = new BGChallengeCreationController(this.containerId);
        
        controller.addEventListener(BGChallengeCreationController.ITEM_CONFIGURATION_FINISHED_NOTIFICATION_TYPE, this._didFinishConfiguration.bind(this));
        return controller;
    }

    _didFinishConfiguration(event) {
        this.hideItemCreationController();
        
        (async () => {
            await this.updateSections();
        })()
    }

    get containerId() {
        return this._containerId;
    }

    async updateSections(title) {
        const containerId = this.containerId;
        if (containerId === undefined) return;

        const client = AppWriteClient.sharedInstance.client;
        const databases = new Databases(client, AppWriteConfig.DATABASE_SHARED_ID);

        const unassignedSection = new BGSectionedListViewSectionData("unassigned", 0, Number.MIN_SAFE_INTEGER, [], "Verfügbar");
        const sections = [new BGSectionedListViewSectionData(containerId, 0, Number.MAX_SAFE_INTEGER, [], "Aktiv"), unassignedSection];

        const assignmentsResult = await databases.listDocuments(AppWriteConfig.DATABASE_SHARED_COLLECTION_ASSIGNMENTS_ID, [Query.equal("assignee", containerId)]); // Todo checken ob des basd oder statt id einfach reference verwenden
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

        this.sections = sections.filter(section => section.isEmpty === false).sort((sectionA, sectionB) => sectionA.updatedAt < sectionB.updatedAt);
    }

    _onChallengeViewAccepted(event) {
        const challengeView = event.data;
        const challengeId = challengeView.data.id;

        const client = AppWriteClient.sharedInstance.client;
        const databases = new Databases(client, AppWriteConfig.DATABASE_SHARED_ID);

        (async () => {
            const result = await databases.createDocument(AppWriteConfig.DATABASE_SHARED_COLLECTION_ASSIGNMENTS_ID, "unique()", {
                challenge: challengeId, assignee: this.containerId
            });
            console.log(result);
            await this.updateSections();
        })()
    }
}