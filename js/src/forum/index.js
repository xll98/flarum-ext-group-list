import {extend} from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import LinkButton from 'flarum/common/components/LinkButton';
import GroupListPage from './components/GroupListPage';
import GroupListItem from '../common/models/GroupListItem';
import GroupApplicationListPage from './components/GroupApplicationListPage';
import GroupApplicationModal from './components/GroupApplicationModal';
import GroupApplication from '../common/models/GroupApplication';

/* global app */

app.initializers.add('mircle-group-list', () => {
    app.routes['mircle-group-list'] = {
        path: '/groups',
        component: GroupListPage,
    };
    
    app.routes['mircle-group-applications'] = {
        path: '/group-applications',
        component: GroupApplicationListPage,
    };

    app.store.models['mircle-group-list-items'] = GroupListItem;
    app.store.models['mircle-group-applications'] = GroupApplication;

    extend(IndexPage.prototype, 'navItems', items => {
        if (!app.forum.attribute('mircle-group-list.showSideNavLink')) {
            return;
        }

        items.add('mircle-group-list-item', LinkButton.component({
            href: app.route('mircle-group-list'),
            icon: 'fas fa-users',
        }, app.translator.trans('mircle-group-list.forum.nav')), 85);
        
        // 添加申请列表链接（对有申请权限或审核权限的用户显示）
        if (app.forum.attribute('canApplyToGroups') || app.forum.attribute('canReviewApplications')) {
            items.add('mircle-group-applications-item', LinkButton.component({
                href: app.route('mircle-group-applications'),
                icon: 'fas fa-clipboard-list',
            }, app.translator.trans('mircle-group-list.forum.applications.nav')), 86);
        }
    });
});
