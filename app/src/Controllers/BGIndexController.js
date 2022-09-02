"use strict";

import BGRootViewController from "./BGRootController.js";
import BGMessageListViewController from "./ListView/BGMessageListViewController.js";
import BGAuthController from "./BGAuthController.js";
import AppWriteAuthentication from "../AppWrite/AppWriteAuthentication.js";
import BGTeamsListViewController from "./BGTeamsListViewController.js";
import BGChallengesListViewController from "./BGChallengeListViewController.js";
import BGListViewItemView from "../UI/Views/BGListViewItemView.js";
import BGMembersListViewController from "./BGMembersListViewController.js";
import BGTeamChallengesListViewController from "./BGTeamChallengesListViewController.js";
import BGLeaderboardController from "./BGLeaderboardController.js";
import { Button, Color, Icon } from "../UI/libs/WrappedUI.js";
import { Query, Databases } from "appwrite";
import AppWriteClient from "../AppWrite/AppWriteClient.js";
import AppWriteConfig from "../AppWrite/AppWriteConfig.js";

export default class BGIndexController extends BGRootViewController {
    static get Mode() {
        return Object.freeze({
            start: "start",
            detail: "detail"
        });
    }

    get mode() {
        return this._mode;
    }

    set mode(value) {
        this._mode = value;

        // this._applyMode();
    }

    _createIconButton() {
        const iconButton = super._createIconButton();
        iconButton.addEventListener(Button.BUTTON_CLICK_NOTIFICATION_TYPE, this._onIconButtonPressed.bind(this));
        iconButton.addEventListener(Button.BUTTON_MOUSE_OVER_NOTIFICATION_TYPE, this._onIconButtonMouseOver.bind(this));
        iconButton.addEventListener(Button.BUTTON_MOUSE_OUT_NOTIFICATION_TYPE, this._onIconButtonMouseOut.bind(this));

        return iconButton;
    }

    _onIconButtonMouseOver(event) {
        if (this.mode !== BGIndexController.Mode.start) return;

        this._addLogoutIcon();
    }

    _onIconButtonMouseOut(event) {
        if (this.mode !== BGIndexController.Mode.start) return;

        this._removeLogoutIcon();
        this._setIcon();
    }


    _onIconButtonPressed(event) {
        const mode = this.mode;

        switch (mode) {
            case BGIndexController.Mode.start:
                (async () => {
                    await AppWriteAuthentication.sharedInstance.logout();
                })()
                break;
            case BGIndexController.Mode.detail:
                break;
            default:
                throw new Error(`Unsupported mode: ${mode}`);
        }

        this.removeStackedControllers();
    }

    get closeIcon() {
        return this._closeIcon;
    }


    _addCloseIcon() {
        const closeIcon = this._createCloseIcon();
        this.iconButton.text = "";
        this.iconButton.addView(closeIcon);
        this._closeIcon = closeIcon;
    }

    _removeCloseIcon() {
        this.iconButton.text = "";
        this._closeIcon = undefined;
    }

    get logoutIcon() {
        return this._logoutIcon;
    }

    _addLogoutIcon() {
        const logoutIcon = this._createLogoutIcon();
        this.iconButton.text = "";
        this.iconButton.addView(logoutIcon);
        this._logoutIcon = logoutIcon;
    }

    _removeLogoutIcon() {
        this.iconButton.text = "";
        this._logoutIcon = undefined;
    }

    _createIcon() {
        const icon = new Icon();
        icon.color = Color.white;
        icon.fontSize = "17px";

        return icon;
    }

    _createCloseIcon() {
        const icon = this._createIcon();
        icon.classList.add("fa-solid", "fa-close");

        return icon;
    }

    _createLogoutIcon() {
        const icon = this._createIcon();
        icon.classList.add("fa-solid", "fa-sign-out");
        icon.pointerEvents = "none";

        return icon;
    }


    _applyMode() {
        const mode = this.mode;

        switch (mode) {
            case BGIndexController.Mode.start:
                this.controllers.forEach(parentController => parentController.controllers.forEach(controller => controller.removeFromParentController()));
                break;
            case BGIndexController.Mode.group:
                const memberListViewController = new BGMembersListViewController
            case BGIndexController.Mode.chat:
                break;
            default:
                throw new Error(`Unsupported mode: ${mode}`);
        }
    }

    get stackedControllers() {
        return this._stackedControllers;
    }

    removeStackedControllers() {
        this.mode = BGIndexController.Mode.start;
        this.stackedControllers.forEach(controller => controller.removeFromParentController());
        this.controllers.forEach(controller => controller.view.isHidden = false);
        this._removeCloseIcon();
        this._setIcon();

        this.title = "BeGreen";
    }

    embedStackedController(controller, position) {
        this.stackedControllers.push(controller);

        this.embedController(controller, position);
    }

    constructor(mode = BGIndexController.Mode.start) {
        super();

        this.mode = mode;

        this._stackedControllers = [];

        this._ensureAuthentication();

        this._createControllers();

        this._setIcon();

        (async () => {
            await this._updateScore();
        })();
    }

    async _updateScore() {
        const client = AppWriteClient.sharedInstance.client;
        const databases = new Databases(client, AppWriteConfig.DATABASE_SHARED_ID);

        const userId = AppWriteAuthentication.sharedInstance.user.$id;

        const previewResult = await databases.listDocuments(AppWriteConfig.DATABASE_SHARED_COLLECTION_PREVIEW_ID, [Query.equal("$id", userId)]);
        let score = 0;
        const documents = previewResult.documents;
        if (documents.length > 0) score = documents[0].score;

        this.score = score;
    }

    _onTeamSelected(event) {
        this.removeStackedControllers();
        this.mode = BGIndexController.Mode.detail;
        this.controllers.forEach(controller => controller.view.isHidden = true);

        const teamView = event.data;
        const team = teamView.data;
        const id = team.id;

        this.title = team.name;
        this._addCloseIcon();
        //this.mode = BGIndexController.Mode.group;
        const membersController = new BGMembersListViewController(id);
        membersController.view.minWidth = "350px";
        membersController.title = "Mitglieder";
        this.embedStackedController(membersController, BGRootViewController.ControllerPosition.topLeft);

        const challengesController = new BGTeamChallengesListViewController(id);
        challengesController.title = "Challenges";
        this.embedStackedController(challengesController, BGRootViewController.ControllerPosition.right);

        const bottomLeftController = new BGMessageListViewController(id);
        bottomLeftController.title = "Chat";
        this.embedStackedController(bottomLeftController, BGRootViewController.ControllerPosition.bottomLeft);
    }

    _onStateChange() {
        //todo den controllern hier sagen, dass sie updaten können, wenn authenticated
    }

    _setIcon() {
        const user = AppWriteAuthentication.sharedInstance.user;
        if (user === undefined) return;
        this.iconButton.text = user.name[0].toUpperCase();
    }

    _createControllers() {

        const controller = new BGTeamsListViewController();
        controller.title = "Kontakte";
        controller.addEventListener(BGListViewItemView.ITEM_VIEW_SELECTED_NOTIFICATION_TYPE, this._onTeamSelected.bind(this));
        controller.view.minWidth = "350px";
        this.embedController(controller, BGRootViewController.ControllerPosition.topLeft);

        const topLeftController = new BGChallengesListViewController();
        topLeftController.title = "Challenges";
        this.embedController(topLeftController, BGRootViewController.ControllerPosition.right);

        const bottomLeftController = new BGLeaderboardController();
        bottomLeftController.title = "Leaderboard";
        this.embedController(bottomLeftController, BGRootViewController.ControllerPosition.bottomLeft);
    }

    _ensureAuthentication() {
        const authentication = AppWriteAuthentication.sharedInstance;
        if (authentication.isAuthenticated === false) this._presentAuthenticationController();
        authentication.addEventListener(AppWriteAuthentication.APPWRITEAUTHENTICATION_DEAUTHENTICATED_NOTIFICATION_TYPE, this._presentAuthenticationController.bind(this));
    }

    _presentAuthenticationController() {
        const authController = new BGAuthController();
        this.addController(authController);
    }
}