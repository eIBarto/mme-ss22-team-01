"use strict";

import { Teams } from "appwrite";
import AppWriteClient from "../AppWrite/AppWriteClient.js";
import AppWriteConfig from "../AppWrite/AppWriteConfig.js";
import BGItemCreationController from "./BGItemCreationController.js";
import BGTeamCreationSectionView from "../UI/Views/BGTeamCreationSectionView.js";
import { Button, Color, Corners, Gap, Padding, RoundedCorner, Borders, Border, TextField, View } from "../UI/libs/WrappedUI.js";


export default class BGMemberCreationController extends BGItemCreationController {

    get cancelButton() {
        return this._cancelButton;
    }

    get friendView() {
        return this._friendView;
    }

    _createView() {
        const view = super._createView();

        view.gap = Gap.all("10px");
        view.overflow = View.Overflow.hidden;

        const friendView = this._createFriendView();
        this._friendView = friendView;
        view.addView(friendView);

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
        button.fontSize = "13px";
        button.padding = Padding.all("5px");
        button.text = "cancel";
        button.corners = Corners.all(new RoundedCorner("10px"))
        button.addEventListener(Button.BUTTON_CLICK_NOTIFICATION_TYPE, this._onConfigurationCancelled.bind(this));

        return button;
    }

    _createFriendView() {
        const sectionView = new BGTeamCreationSectionView(); //todo umbennen
        sectionView.title = "Freund hinzufügen";
        sectionView.hint = "hinzufügen";
        sectionView.placeholder = "E-Mail";
        sectionView.textInputType = TextField.TextInputType.email;
        sectionView.addEventListener(BGTeamCreationSectionView.ENTRY_COMPLETE_NOTIFICATION_TYPE, this._onFriendSubmit.bind(this));

        return sectionView;
    }


    _onFriendSubmit(event) {
        const mail = event.data.name;

        (async () => {
            const client = AppWriteClient.sharedInstance.client;
            const teams = new Teams(client);

            const membership = await teams.createMembership(this.containerId, mail, [], AppWriteConfig.APPLICATION_URL);

            console.log(membership);
            this._onConfigurationFinished(this);
        })();
    }
}