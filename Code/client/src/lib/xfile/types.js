define([
    'dojo/_base/lang',
    'xide/types',
    'xide/types/Types'
],function(lang,types){
        /**
         * Public mime registry setter
         * @param type
         * @param map
         */
        types.registerCustomMimeIconExtension = function (type, map) {
            types['customMimeIcons'][type] = map;
        };

        var ACTION = types.ACTION;

        var DEFAULT_PERMISSIONS = [
            ACTION.EDIT,
            ACTION.COPY,
            ACTION.CLOSE,
            ACTION.MOVE,
            ACTION.RENAME,
            ACTION.DOWNLOAD,
            ACTION.RELOAD,
            ACTION.DELETE,
            ACTION.NEW_FILE,
            ACTION.NEW_DIRECTORY,
            ACTION.CLIPBOARD,
            ACTION.LAYOUT,
            ACTION.COLUMNS,
            ACTION.SELECTION,
            ACTION.PREVIEW,
            ACTION.OPEN_IN,
            ACTION.GO_UP,
            ACTION.SEARCH,
            ACTION.OPEN_IN_TAB,
            ACTION.TOOLBAR,
            ACTION.STATUSBAR,
            ACTION.UPLOAD,
            ACTION.SOURCE,
            ACTION.SIZE_STATS,
            ACTION.CONSOLE,
            ACTION.HEADER,
            'File/Compress',
            'File/New',
            ACTION.CONTEXT_MENU
        ];

        types.DEFAULT_FILE_GRID_PERMISSIONS = DEFAULT_PERMISSIONS;

        types.FIELDS = {
            SHOW_ISDIR:1602,
            SHOW_OWNER:1604,
            SHOW_MIME:1608,
            SHOW_SIZE:1616,
            SHOW_PERMISSIONS:1632,
            SHOW_TIME:1633,
            SHOW_FOLDER_SIZE:1634,
            SHOW_FOLDER_HIDDEN:1635,
            SHOW_TYPE:1636,
            SHOW_MEDIA_INFO:1637
        };

        types.FILE_PANEL_LAYOUT =
        {
            TREE:1,
            LIST:2,
            THUMB:3,
            PREVIEW:4,
            COVER:5,
            SPLIT_VERTICAL:6,
            SPLIT_HORIZONTAL:7,
            IMAGE_GRID:8
        };

        types.LAYOUT_PRESET =
        {
            DUAL:1,
            SINGLE:2,
            BROWSER:3,
            PREVIEW:4,
            GALLERY:5,
            EDITOR:6
        };

        types.PANEL_OPTIONS = {
            ALLOW_NEW_TABS:true,
            ALLOW_MULTI_TAB:false,
            ALLOW_INFO_VIEW:true,
            ALLOW_LOG_VIEW:true,
            ALLOW_CONTEXT_MENU:true,
            ALLOW_LAYOUT_SELECTOR:true,
            ALLOW_SOURCE_SELECTOR:true,
            ALLOW_COLUMN_RESIZE:true,
            ALLOW_COLUMN_REORDER:true,
            ALLOW_COLUMN_HIDE:true,
            ALLOW_ACTION_TOOLBAR:true,
            ALLOW_MAIN_MENU:true
        };

        /**
         * @TODO: remove
         * @type {{LAYOUT: number, AUTO_OPEN: boolean}}
         */
        types.FILE_PANEL_OPTIONS_LEFT={
            LAYOUT:2,
            AUTO_OPEN:true
        };

        types.FILE_PANEL_OPTIONS_MAIN={
            LAYOUT:3,
            AUTO_OPEN:true
        };

        types.FILE_PANEL_OPTIONS_RIGHT={
            LAYOUT:3,
            AUTO_OPEN:true
        };
        types.FILE_GRID_COLUMNS =
        {
            NAME:'name',
            SIZE:'size',
            MODIFIED:'modified'
        };
        types.ACTION_TOOLBAR_MODE =
        {
            SELF:'self'
        };

        lang.mixin(types.ITEM_TYPE,{
            FILE:'BTFILE'
        });

        /***
         *
         * Extend the core events with xfile specific events
         */
        /**
         * ActionVisibility
         * @enum module:xide/types/EVENTS
         * @memberOf module:xide/types
         */
        lang.mixin(types.EVENTS,{
            STORE_CHANGED:'onStoreChange',
            BEFORE_STORE_CHANGE:'onBeforeStoreChange',
            STORE_REFRESHED:'onStoreRefreshed',
            ON_FILE_STORE_READY:'onFileStoreReady',
            ON_DID_OPEN_ITEM:'onDidOpenItem',
            ON_SHOW_PANEL:'onShowPanel',
            ITEM_SELECTED:'onItemSelected',
            ERROR:'fileOperationError',
            STATUS:'fileOperationStatus',
            IMAGE_LOADED:'imageLoaded',
            IMAGE_ERROR:'imageError',
            RESIZE:'resize',
            ON_UPLOAD_BEGIN:'onUploadBegin',
            ON_UPLOAD_PROGRESS:'onUploadProgress',
            ON_UPLOAD_FINISH:'onUploadFinish',
            ON_UPLOAD_FAILED: 'onUploadFailed',
            ON_CLIPBOARD_COPY:'onClipboardCopy',
            ON_CLIPBOARD_PASTE:'onClipboardPaste',
            ON_CLIPBOARD_CUT:'onClipboardCut',
            ON_CONTEXT_MENU_OPEN:'onContextMenuOpen',
            ON_PLUGIN_LOADED:'onPluginLoaded',
            ON_PLUGIN_READY:'onPluginReady',
            ON_MAIN_VIEW_READY:'onMainViewReady',
            ON_FILE_CONTENT_CHANGED:'onFileContentChanged',
            ON_PANEL_CLOSED:'onPanelClosed',
            ON_PANEL_CREATED:'onPanelCreated',
            ON_COPY_BEGIN:'onCopyBegin',
            ON_COPY_END:'onCopyEnd',
            ON_DOWNLOAD_TO_BEGIN:'onDownloadToBegin',
            ON_DOWNLOAD_TO_END:'onDownloadToEnd',
            ON_DELETE_BEGIN:'onDeleteBegin',
            ON_DELETE_END:'onDeleteEnd',
            ON_MOVE_BEGIN:'onMoveBegin',
            ON_MOVE_END:'onMoveEnd',
            ON_COMPRESS_BEGIN:'onCompressBegin',
            ON_COMPRESS_END:'onCompressEnd',
            ON_SOURCE_MENU_OPEN:'onSourceMenuOpen',
            ON_MOUNT_DATA_READY:'onMountDataReady',
            ON_XFILE_READY:'onXFileReady',
            ON_CHANGE_PERSPECTIVE:'onChangePerspective',
            ON_FILE_PROPERTIES_RENDERED:'onFilePropertiesRendered'
        });

        /**
         * SELECTION_MODE specfies the possible selection modes for xfile grid views
         * @enum module:xide/types/SELECTION_MODE
         * @memberOf module:xide/types
         */
        types.SELECTION_MODE =
        {
            /** Single
             * @const
             * @type {string}
             */
            SINGLE:'single',
            /** Multiple
             * @const
             * @type {string}
             */
            MULTI:'multiple',
            /** Extended
             * @const
             * @type {string}
             */
            EXTENDED:'extended'
        };

        /**
         * @TODO: remove
         * OPERATION is the string representation of xfile commands
         * @enum module:xide/types/OPERATION
         * @memberOf module:xide/types
         */
        types.OPERATION=
        {

            COPY:'copy',
            MOVE:'move',
            RENAME:'rename',
            DELETE:'delete',
            OPEN:'open',
            EDIT:'edit',
            DOWNLOAD:'download',
            DOWNLOAD_TO:'downloadTo',
            INFO:'info',
            COMPRESS:'compress',
            RELOAD:'reload',
            PREVIEW:'preview',
            INSERT_IMAGE:'insertImage',
            COPY_PASTE:'copypaste',
            DND:'dnd',
            OPTIONS:'options',
            NEW_FILE:'mkfile',
            NEW_DIRECTORY:'mkdir',
            GET_CONTENT:'get',
            SET_CONTENT:'set',
            FIND:'find',
            CUSTOM:'custom',
            PERMA_LINK:'permaLink',
            ADD_MOUNT:'ADD_MOUNT',
            REMOVE_MOUNT:'REMOVE_MOUNT',
            EDIT_MOUNT:'EDIT_MOUNT',
            PERSPECTIVE:'PERSPECTIVE',
            EXTRACT:'extract'
        };

        /**
         * @TODO: remove
         * OPERATION_INT is the integer version of {xide/types/OPERATION}
         * @enum module:xide/types/OPERATION_INT
         * @memberOf module:xide/types
         */
        types.OPERATION_INT={
            NONE:0,
            EDIT:1,
            COPY:2,
            MOVE:3,
            INFO:4,
            DOWNLOAD:5,
            COMPRESS:6,
            DELETE:7,
            RENAME:8,
            DND:9,
            COPY_PASTE:10,
            OPEN:11,
            RELOAD:12,
            PREVIEW:13,
            INSERT_IMAGE:15,
            NEW_FILE:16,
            NEW_DIRECTORY:17,
            UPLOAD:18,
            READ:19,
            WRITE:20,
            PLUGINS:21,
            CUSTOM:22,
            FIND:23,
            PERMA_LINK:24,
            ADD_MOUNT:25,
            REMOVE_MOUNT:26,
            EDIT_MOUNT:27,
            PERSPECTIVE:28,      //change perspective
            CLIPBOARD_COPY:29,
            CLIPBOARD_CUT:30,
            CLIPBOARD_PASTE:31,
            EXTRACT:32
        };

    return types;
});