export const ActionsMap = {
    Activity: 'Activity',
    Create: 'Create',
    Clone: 'Clone',
    List: 'List',
    View: 'View',
    Delete: 'Delete',
    Modify: 'Modify',
    Manage: 'Manage',
    ManageAccessLevels: 'Manage Access Levels',
    Share: 'Share',
    AddComment: 'AddComment',
    ViewComments: 'ViewComments',
    EditComment: 'EditComment',
    DeleteComment: 'AddComment',
    ChangeSettingsOnFly: 'ChangeSettingsOnFly',
    CompareOnFly: 'CompareOnFly',
    Download: 'Download',
    SeeInfo: 'SeeInfo',
    AssignUserTo: 'Assign User To'
};

export const CrudActions = [
    ActionsMap.Create,
    ActionsMap.View,
    ActionsMap.Modify,
    ActionsMap.Delete
];

export const CommentActions = [
    ActionsMap.AddComment,
    ActionsMap.ViewComments,
    ActionsMap.EditComment,
    ActionsMap.DeleteComment,
];

export const DataEntryActions = [
    ActionsMap.AssignUserTo
];
