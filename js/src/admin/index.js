import SettingsPage from './components/SettingsPage';
import GroupListItem from '../common/models/GroupListItem';

/* global app */

app.initializers.add('mircle-group-list', () => {
    app.store.models['mircle-group-list-items'] = GroupListItem;

    app.extensionData
        .for('mircle-group-list')
        .registerPage(SettingsPage)
        .registerPermission({
            icon: 'fas fa-users',
            label: app.translator.trans('mircle-group-list.admin.permissions.see'),
            permission: 'mircle-group-list.see',
            allowGuest: true,
        }, 'view')
        .registerPermission({
            icon: 'fas fa-edit',
            label: app.translator.trans('mircle-group-list.admin.permissions.apply'),
            permission: 'mircle-group-list.apply',
            allowGuest: false,
        }, 'start')
        .registerPermission({
            icon: 'fas fa-clipboard-check',
            label: app.translator.trans('mircle-group-list.admin.permissions.review-applications'),
            permission: 'mircle-group-list.review-applications',
            allowGuest: false,
        }, 'moderate');
});
