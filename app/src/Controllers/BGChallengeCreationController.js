"use strict";


import BGItemCreationController from "./BGItemCreationController.js";
import BGChallengeCreationSectionView from "../UI/Views/BGChallengeCreationSectionView.js";
import { Button, Color, Corners, Gap, Padding, RoundedCorner, Borders, Border, View } from "../UI/libs/WrappedUI.js";
import { Databases } from "appwrite";
import AppWriteClient from "../AppWrite/AppWriteClient.js";
import AppWriteConfig from "../AppWrite/AppWriteConfig.js";

export default class BGChallengeCreationController extends BGItemCreationController {

    get cancelButton() {
        return this._cancelButton;
    }

    get challengeView() {
        return this._challengeView;
    }

    _createView() {
        const view = super._createView();

        view.gap = Gap.all("10px");
        view.overflow = View.Overflow.hidden;

        const challengeView = this._createChallengeView();
        this._challengeView = challengeView;
        view.addView(challengeView);

        const cancelButton = this._createCancelButton();
        view.addView(cancelButton);
        this._cancelButton = cancelButton;

        return view;
    }

    _createCancelButton() {
        const button = new Button();
        button.borders = Borders.all(new Border(Color.green, "2px"));
        button.backgroundColor = Color.darkGreen;
        button.color = Color.white;
        button.fontSize = "15px";
        button.padding = Padding.axes("10px", "3px");
        button.text = "cancel";
        button.corners = Corners.all(new RoundedCorner("10px"))
        button.addEventListener(Button.BUTTON_CLICK_NOTIFICATION_TYPE, this._onConfigurationCancelled.bind(this));

        return button;
    }

    _createChallengeView() {
        const challengeView = new BGChallengeCreationSectionView(); //TODO erstellen; 
        challengeView.title = "Challenge erstellen";
        challengeView.hint = "erstellen";
        challengeView.placeholder = "Titel";
        challengeView.addEventListener(BGChallengeCreationSectionView.ENTRY_COMPLETE_NOTIFICATION_TYPE, this._onChallengeSubmit.bind(this));

        return challengeView;
    }

    _onChallengeSubmit(event) {
        const challengeView = event.data;
        const duration = challengeView.duration;
        const score = challengeView.score;
        const name = challengeView.name;
        const description = challengeView.description;

        (async () => {
            await this._createChallenge(duration, score, name, description);
            this._onConfigurationFinished();
        })();

    }

    async _createChallenge(duration, score, name, description) {
        const client = AppWriteClient.sharedInstance.client;
        const databases = new Databases(client, AppWriteConfig.DATABASE_SHARED_ID);

        const containerId = this.containerId;

        // todo überarbeiten 

        await databases.createDocument(AppWriteConfig.DATABASE_SHARED_COLLECTION_CHALLENGES_ID, "unique()", {
            title: name, description: description, score: score, author: containerId, origin: containerId, duration: duration
        });


    }
}