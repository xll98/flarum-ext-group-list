import {extend} from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import LinkButton from 'flarum/common/components/LinkButton';
import GroupListPage from './components/GroupListPage';
import GroupListItem from '../common/models/GroupListItem';

/* global app */

app.initializers.add('mircle-group-list', () => {
    app.routes['mircle-group-list'] = {
        path: '/groups',
        component: GroupListPage,
    };

    app.store.models['mircle-group-list-items'] = GroupListItem;

    extend(IndexPage.prototype, 'navItems', items => {
        if (!app.forum.attribute('mircle-group-list.showSideNavLink')) {
            return;
        }

        items.add('mircle-group-list-item', LinkButton.component({
            href: app.route('mircle-group-list'),
            icon: 'fas fa-users',
        }, app.translator.trans('mircle-group-list.forum.nav')), 85);
    });
});
