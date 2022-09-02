"use strict";

import { Client } from "appwrite";
import AppWriteConfig from "./AppWriteConfig.js";

export default class AppWriteClient {

    static _sharedInstance;

    static get sharedInstance() {
        if (AppWriteClient._sharedInstance === undefined) AppWriteClient._sharedInstance = new AppWriteClient();

        return AppWriteClient._sharedInstance;
    }

    get client() {
        return this._client;
    }

    constructor() {
        this._createClient();
    }

    _createClient() {
        const client = new Client();
        client.setEndpoint(AppWriteConfig.ENDPOINT_URI).setProject(AppWriteConfig.PROJECT_ID);
        this._client = client;
    }
}