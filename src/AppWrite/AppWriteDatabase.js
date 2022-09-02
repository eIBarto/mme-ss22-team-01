"use strict";

import { Databases } from "appwrite";
import AppWriteClient from "./AppWriteClient.js";

export default class AppWriteDatabase {
    get databases() {
        return this._databases;
    }

    get id() {
        return this._id;
    }

    constructor(id) {
        this._id = id;

        this._setup();
    }

    _setup() {
        const client = AppWriteClient.sharedInstance.client;
        const databases = new Databases(client, this.id);
        this._databases = databases;
    }
}