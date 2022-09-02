"use strict";

import { Databases } from "appwrite";
import AppWriteClient from "../../AppWrite/AppWriteClient.js";
import AppWriteResourceManager from "./AppWriteResourceManager.js";


export default class AppWriteDocumentManager extends AppWriteResourceManager {
    constructor(collectionId) {
        super();

        this._collectionId = collectionId;
    }

    get collectionId() {
        return this._collectionId;
    }

    _configure() {
        const client = AppWriteClient.sharedInstance.client;
        this._api = new Databases(client, AppWriteConfig.DATABASE_SHARED_ID);
    }

    get api() {
        return this._api;
    }

    async loadResources(filter) {
        return await this.api.listDocuments(this.collectionId, filter);
    }
}