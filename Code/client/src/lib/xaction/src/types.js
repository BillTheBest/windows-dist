define([
    'xide/types',
    'dojo/_base/lang'
],function(types,lang){

    lang.mixin(types.EVENTS,{
        ON_ACTION_CHANGE_CONTEXT: 'onChangeActionContext',
        ON_ACTION_CONTEXT_CHANGED: 'onActionContextChanged',
        REGISTER_ACTION: 'registerAction',
        SET_ITEM_ACTIONS: 'onSetItemsActions',
        ON_CLIPBOARD_COPY: 'onClipboardCopy',
        ON_CLIPBOARD_PASTE: 'onClipboardPaste',
        ON_CLIPBOARD_CUT: 'onClipboardCut',
        ON_RENDER_ACTIONS: 'onRenderActions',
        ON_DID_ACTION:'onDidAction',
        ON_AFTER_ACTION:'onAfterAction'
    });

    /**
     * Enumeration to define an Action command
     * @enum {string} module:xide/types/Action
     * @memberOf module:xide/types
     */
    types.ACTION =
    {
        LAYOUT: 'View/Layout',
        COLUMNS: 'View/Columns',
        SELECTION: 'File/Select',
        CLIPBOARD: 'Edit/Clipboard',
        UNDO: 'Edit/Undo',
        REDO: 'Edit/Redo',
        CLIPBOARD_COPY: 'Edit/Clipboard/Copy',
        CLIPBOARD_PASTE: 'Edit/Clipboard/Paste',
        CLIPBOARD_CUT: 'Edit/Clipboard/Cut',
        COPY: 'File/Copy',
        MOVE: 'File/Move',
        RENAME: 'File/Rename',
        DELETE: 'File/Delete',
        OPEN: 'File/Open',
        EDIT: 'File/Edit',
        SAVE: 'File/Save',
        SEARCH: 'File/Search',
        TOOLBAR: 'View/Show/Toolbar',
        STATUSBAR: 'View/Show/Statusbar',
        BREADCRUMB: 'View/Show/Breadcrumb',
        HEADER: 'View/Show/Header',
        DOWNLOAD: 'File/Download',
        DOWNLOAD_TO: 'File/downloadTo',
        INFO: 'File/Info',
        COMPRESS: 'File/Compress',
        RELOAD: 'File/Reload',
        UPLOAD: 'File/Upload',
        PREVIEW: 'File/Preview',
        OPEN_IN: 'File/Open In',
        INSERT_IMAGE: 'insertImage',
        COPY_PASTE: 'copypaste',
        DND: 'dnd',
        OPTIONS: 'options',
        NEW_FILE: 'File/New/New File',
        NEW_DIRECTORY: 'File/New/New Folder',
        GET_CONTENT: 'get',
        SET_CONTENT: 'set',
        FIND: 'File/Find',
        CUSTOM: 'custom',
        PERMA_LINK: 'permaLink',
        ADD_MOUNT: 'ADD_MOUNT',
        REMOVE_MOUNT: 'REMOVE_MOUNT',
        EDIT_MOUNT: 'EDIT_MOUNT',
        PERSPECTIVE: 'PERSPECTIVE',
        RUN: 'File/Run',
        GO_UP: 'Navigation/Go Up',
        STOP: 'File/Stop',
        CLOSE: 'View/Close',
        FULLSCREEN: 'View/Fullscreen',
        OPEN_IN_TAB: 'File/OpenInNewTab',
        SOURCE: 'Navigation/Source',
        RIBBON: 'View/Show/Ribbon',
        MAIN_MENU: 'View/Show/MainMenu',
        NAVIGATION: 'View/Show/Navigation',
        BASH_CONSOLE: 'File/Console/Bash',
        JS_CONSOLE: 'File/Console/JS',
        PHP_CONSOLE: 'File/Console/PHP',
        CONSOLE: 'File/Console/PHP',
        SIZE_STATS: 'View/Show/SizeStats',
        WELCOME: 'Window/Welcome',
        CONTEXT_MENU:'File/ContextMenu'
    };

    types.ACTION_TYPE = {
        MULTI_TOGGLE: 'multiToggle',
        SINGLE_TOGGLE: 'singleToggle'
    };

    types.ACTION_ICON =
    {
        CLIPBOARD_COPY: 'fa-copy',
        CLIPBOARD_PASTE: 'fa-paste',
        UPLOAD: 'fa-upload',
        RENAME: 'el-icon-edit',
        DELETE: 'text-danger fa-remove',
        RELOAD: 'fa-refresh',
        EDIT: 'fa-pencil',
        SAVE: 'fa-floppy-o',
        SEARCH: 'fa-search',
        NEW_DIRECTORY: 'fa-magic',
        NEW_FILE: 'fa-magic',
        RUN: 'text-success el-icon-play',
        COMPRESS: 'fa-file-archive-o',
        EXTRACT: 'fa-folder-open',
        DOWNLOAD: 'fa-download',
        GO_UP: 'fa-level-up',
        TOOLBAR: 'fa-bars',
        STATUSBAR: 'fa-terminal',
        PREVIEW: 'fa-eye',
        MAXIMIZE: 'fa-arrows-alt',
        UNDO: 'fa-undo',
        REDO: 'fa-repeat'

    };

    return types;
});