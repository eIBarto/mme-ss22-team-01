"use strict";

import BGItemCreationController from "../BGItemCreationController.js";
import { Border, Borders, Button, Color, Corners, Icon, Gap, Padding, RoundedCorner, StackView, TextField } from "../../UI/libs/WrappedUI.js";
import BGSectionedListViewController from "./BGSectionedListViewController.js";

export default class BGSearchableListViewController extends BGSectionedListViewController {

    static get TEXT_CHANGE_TIMEOUT_MILLISECONDS() {
        return 300;
    }

    constructor(itemViewClass, headerViewClass, listMode = BGSearchableListViewController.ListMode.default) {
        super(itemViewClass, headerViewClass);

        this.listMode = listMode;
    }

    get itemCreationController() {
        return this._itemCreationController;
    }

    showItemCreationController(item) {
        this.hideItemCreationController();

        const itemCreationController = this._createItemCreationController();
        itemCreationController.addEventListener(BGItemCreationController.ITEM_CONFIGURATION_FINISHED_NOTIFICATION_TYPE, this._onItemConfigurationFinished.bind(this));
        itemCreationController.addEventListener(BGItemCreationController.ITEM_CONFIGURATION_CANCELLED_NOTIFICATION_TYPE, this._onItemConfigurationCancelled.bind(this));
        itemCreationController.item = item;
        this.listView.isHidden = true;
        this.addController(itemCreationController, this.contentView);

        this._itemCreationController = itemCreationController;
    }

    hideItemCreationController() {
        this.listView.isHidden = false;

        const itemCreationController = this.itemCreationController;
        if (itemCreationController === undefined) return;
        itemCreationController.removeFromParentController();
    }

    _createItemCreationController() {
        return new BGItemCreationController();
    }

    static get ListMode() {
        return Object.freeze({
            default: "search",
            searching: "cancel"
        });
    }

    get listMode() {
        return this._listMode;
    }

    set listMode(value) {
        this._listMode = value;

        this._applyListMode(); //Todo die hier statt setter?
    }

    get searchBar() {
        return this._searchBar;
    }

    get searchText() {
        return this.searchBar.text;
    }

    set searchText(value) {
        this.searchBar.text = value;
    }

    get searchPlaceholder() {
        return this.searchBar.placeholder;
    }

    set searchBarPlaceholder(value) {
        this.searchBar.text = value;
    }

    get searchButton() {
        return this._searchButton;
    }

    _createSearchBar() {
        const textField = new TextField();
        textField.isHidden = true;
        textField.color = Color.darkGreen;
        textField.fontFamily = TextField.FontFamily.sansSerif;
        textField.fontSize = "12px";
        textField.padding = Padding.axes("8px", "3px");
        textField.backgroundColor = Color.transparent;
        textField.borders = Borders.all(new Border(Color.darkGreen, "2px"));
        textField.corners = Corners.all(new RoundedCorner("7px"));
        textField.grow = "1";
        textField.addEventListener(TextField.TEXT_FIELD_CHANGE_NOTIFICATION_TYPE, this._onSearchTextChange.bind(this));
        textField.addEventListener(TextField.TEXT_FIELD_KEYPRESS_NOTIFICATION_TYPE, this._onSearchTextChange.bind(this));
        textField.addEventListener(TextField.TEXT_FIELD_PASTE_NOTIFICATION_TYPE, this._onSearchTextChange.bind(this));
        textField.addEventListener(TextField.TEXT_FIELD_INPUT_NOTIFICATION_TYPE, this._onSearchTextChange.bind(this));

        return textField;
    }

    _createSearchButton() {
        const button = this._createHeaderButton();
        button.addEventListener(Button.BUTTON_CLICK_NOTIFICATION_TYPE, this.toggleMode.bind(this));

        return button;
    }

    _createAddButton() {
        const button = this._createHeaderButton();
        button.addEventListener(Button.BUTTON_CLICK_NOTIFICATION_TYPE, this.showItemCreationController.bind(this));

        return button;
    }

    _createHeaderButton() {
        const button = new Button();
        button.fontFamily = Button.FontFamily.sansSerif;
        button.fontSize = "15px";
        button.padding = Padding.axes("8px", "5px");
        button.backgroundColor = Color.transparent;
        button.borders = Borders.all(new Border(Color.transparent, "2px"));
        button.corners = Corners.all(new RoundedCorner("5px"));
        button.addEventListener(Button.BUTTON_MOUSE_OVER_NOTIFICATION_TYPE, this._onHeaderButtonMouseOver.bind(this));
        button.addEventListener(Button.BUTTON_MOUSE_OUT_NOTIFICATION_TYPE, this._onHeaderButtonMouseOut.bind(this));

        return button;
    }

    _onHeaderButtonMouseOver(event) {
        const button = event.data;
        button.backgroundColor = Color.lightGrey;
    }

    _onHeaderButtonMouseOut(event) {
        const button = event.data;
        button.backgroundColor = Color.transparent;
    }

    get addButton() {
        return this._addButton;
    }

    _createAddIcon(){
        const icon = new Icon();
        icon.classList.add("fa-solid", "fa-plus");
        icon.color = Color.darkGreen;
        return icon;
    }

    _createSearchIcon() {
        const icon = new Icon();
        icon.classList.add("fa-solid");
        icon.color =  Color.darkGreen;
        return icon;
    }

    _createHeaderButtonView() {
        const stackView = new StackView(StackView.Axis.horizontal, StackView.MainAxisAlignment.spaceBetween, StackView.CrossAxisAlignment.center, Gap.all("2px"));

        const searchButton = this._createSearchButton();
        const searchIcon = this._createSearchIcon();
        this.searchIcon = searchIcon;
        searchButton.addView(searchIcon);
        this._searchButton = searchButton;
        stackView.addView(searchButton);

        const addButton = this._createAddButton();
        const addIcon = this._createAddIcon();
        this._addIcon = addIcon;
        addButton.addView(addIcon);
        this._addButton = addButton;
        stackView.addView(addButton);

        return stackView;
    }

    get headerButtonsView() {
        return this._headerButtonsView;
    }

    _createHeaderView() {
        const headerView = super._createHeaderView();

        const searchBar = this._createSearchBar();
        this._searchBar = searchBar;
        headerView.addView(searchBar);

        const headerButtonsView = this._createHeaderButtonView();
        this._headerButtonsView = headerButtonsView;
        headerView.addView(headerButtonsView);

        return headerView;
    }

    _toggleSearchBar(show) {
        this.headerView.views.forEach(view => view.isHidden = show);
        this.headerButtonsView.isHidden = false;
        this.searchIcon.classList.toggle("fa-magnifying-glass", !show);
        this.searchIcon.classList.toggle("fa-close", show);
        this.searchBar.isHidden = !show;
    }

    toggleMode() {
        this.listMode = this.listMode === BGSearchableListViewController.ListMode.default ? BGSearchableListViewController.ListMode.searching : BGSearchableListViewController.ListMode.default;
    }

    _applyListMode() {
        const listMode = this._listMode;

        switch (listMode) {
            case BGSearchableListViewController.ListMode.default:
                this._toggleSearchBar(false);
                this._onSearchEnd();
                break;
            case BGSearchableListViewController.ListMode.searching:
                this._toggleSearchBar(true);
                this._onSearchStart();
                break;
            default:
                throw new Error(`Unsupported list mode: ${listMode}`);
        }
    }

    _onSearchTextChange() {
        const timeout = this._timeout;
        if (timeout !== undefined) clearTimeout(timeout);
        this._timeout = setTimeout(this._onSearchTextChangeEnd.bind(this), BGSearchableListViewController.TEXT_CHANGE_TIMEOUT_MILLISECONDS);
    }

    _onSearchTextChangeEnd() {

    }

    _onSearchStart() {

    }

    _onSearchEnd() {
    }

    _onItemConfigurationFinished(event) {
        
    }

    _onItemConfigurationCancelled(event) {
        this.hideItemCreationController();
    }
}