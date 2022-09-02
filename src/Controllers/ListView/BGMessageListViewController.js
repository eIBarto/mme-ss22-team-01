"use strict";

import { TextField, Corners, RoundedCorner, View, Padding, Color, StackView, Borders, Border, Button, Gap } from "../../UI/libs/WrappedUI.js";
import BGController from "../../Controllers/BGController.js";
import AppWriteConfig from "../../AppWrite/AppWriteConfig.js";
import AppWriteClient from "../../AppWrite/AppWriteClient.js";
import { Databases, Query, Teams } from "appwrite";
import BGMessageListViewItemView from "../../UI/Views/BGMessageListViewItemView.js";
import BGListView from "../../UI/Views/BGListView.js";
import BGListViewMessageItemData from "../../Data/Models/BGListViewMessageItemData.js";
import AppWriteAuthentication from "../../AppWrite/AppWriteAuthentication.js";

export default class BGMessageListViewController extends BGController { // ob man den wirklich braucht?

    constructor(containerId) {
        super();

        this._containerId = containerId;

        (async () => {
            await this.updateMessages();
        })();
    }

    async updateMessages() {
        const containerId = this.containerId;

        const client = AppWriteClient.sharedInstance.client;
        const databases = new Databases(client, AppWriteConfig.DATABASE_SHARED_ID);
        const teams = new Teams(client);

        const userId = AppWriteAuthentication.sharedInstance.user.$id; // TODO oder account.get()

        const memberships = await teams.getMemberships(containerId);

        const result = await databases.listDocuments(AppWriteConfig.DATABASE_SHARED_COLLECTION_MESSAGES_ID, [Query.equal("team", containerId)]); // Todo auch description durchsuchen
        this.messages = result.documents.map(document => {
            let name = "";
            const membership = memberships.memberships.find(membership => membership.userId === document.author);
            if (membership !== undefined) name = membership.userName;
            const isForeign = document.author !== userId;

            return new BGListViewMessageItemData(document.$id, document.$createdAt, document.$updatedAt, document.text, name, isForeign);
        });
    }

    get containerId() {
        return this._containerId;
    }

    get listView() {
        return this._listView;
    }

    set messages(value) {
        this.listView.items = value;
    }

    get messages() {
        return this.listView.items;
    }

    get textField() {
        return this._textField;
    }

    get text() {
        return this.textField.text;
    }

    set text(value) {
        this.textField.text = value;
    }

    get button() {
        return this._button;
    }

    _createListView() {
        const listView = new BGListView(BGMessageListViewItemView);
        listView.padding = Padding.all("10px");
        //listView.addEventListener(BGMessageListView.ITEM_VIEW_CREATED_NOTIFICATION_TYPE, this._onItemViewCreated.bind(this)); //bind needed?
        //listView.addEventListener(BGContactListViewItemView.ITEM_VIEW_SELECTED_NOTIFICATION_TYPE, this._onItemViewClicked.bind(this)); //bind needed?
        this._listView = listView;

        return listView;
    }

    _createActionView() {
        const stackView = new StackView(StackView.Axis.horizontal, StackView.MainAxisAlignment.center, StackView.CrossAxisAlignment.center, Gap.all("5px"));
        stackView.backgroundColor = Color.lightGrey;
        stackView.padding = Padding.all("10px");
        stackView.borders = Borders.top(new Border(Color.darkGreen, "1px"));

        const textField = this._createTextField();
        stackView.addView(textField);
        this._textField = textField;

        const button = this._createButton();
        stackView.addView(button);
        this._button = button;

        return stackView;
    }

    _createTextField() {
        const textField = new TextField();
        textField.backgroundColor = Color.white;
        textField.corners = Corners.all(new RoundedCorner("10px"));
        textField.fontFamily = TextField.FontFamily.sansSerif;
        textField.grow = "1";
        textField.fontSize = "15px";
        textField.padding = Padding.axes("10px", "3px");
        textField.placeholder = "Nachricht";
        textField.borders = Borders.all(new Border(Color.darkGreen, "2px"));
        textField.addEventListener(TextField.TEXT_FIELD_CHANGE_NOTIFICATION_TYPE, this._onTextChange.bind(this));
        textField.addEventListener(TextField.TEXT_FIELD_KEYPRESS_NOTIFICATION_TYPE, this._onTextChange.bind(this));
        textField.addEventListener(TextField.TEXT_FIELD_PASTE_NOTIFICATION_TYPE, this._onTextChange.bind(this));
        textField.addEventListener(TextField.TEXT_FIELD_INPUT_NOTIFICATION_TYPE, this._onTextChange.bind(this));

        return textField;
    }

    _onTextChange(event) {
        this.button.isDisabled = this.text.length < 1;
    }

    _onItemViewCreated(event) {
        const itemView = event.data;
        const index = this.messages.length;
        if (index % 2 === 0) itemView.backgroundColor = new Color(245, 245, 245);
    }

    _onItemViewClicked(event) {
        const itemView = event.data;
        console.log(itemView);
    }

    _createButton() { // todo button bild
        const button = new Button();
        button.borders = Borders.all(new Border(Color.green, "2px"));
        button.backgroundColor = Color.darkGreen;
        button.color = Color.white;
        button.fontSize = "15px";
        button.isDisabled = true;
        button.padding = Padding.axes("10px", "3px");
        button.text = "senden";
        button.corners = Corners.all(new RoundedCorner("10px"))
        button.addEventListener(Button.BUTTON_CLICK_NOTIFICATION_TYPE, this._onSubmit.bind(this));

        return button;
    }

    async _onSubmit(event) {
        const text = this.text;
        if (text.length < 1) return;

        const containerId = this.containerId;
        const client = AppWriteClient.sharedInstance.client;
        const databases = new Databases(client, AppWriteConfig.DATABASE_SHARED_ID);
        const userId = AppWriteAuthentication.sharedInstance.user.$id; // TODO oder account.get()

        const result = await databases.createDocument(AppWriteConfig.DATABASE_SHARED_COLLECTION_MESSAGES_ID, "unique()", {
            text: text, team: containerId, author: userId
        });

        this.textField.clear();
        await this.updateMessages();
    }

    _createContentView() {
        const contentView = super._createContentView();
        contentView.overflow = View.Overflow.hidden;
        contentView.mainAxisAlignment = StackView.MainAxisAlignment.spaceBetween;
        contentView.grow = "1";

        const listView = this._createListView();
        contentView.addView(listView);

        const actionView = this._createActionView();
        contentView.addView(actionView);

        return contentView;
    }
}