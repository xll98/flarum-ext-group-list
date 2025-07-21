import Page from 'flarum/common/components/Page';
import IndexPage from 'flarum/forum/components/IndexPage';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import GroupBadge from 'flarum/common/components/GroupBadge';
import Button from 'flarum/common/components/Button';
import listItems from 'flarum/common/helpers/listItems';
import UserList from './UserList';
import GroupApplicationModal from './GroupApplicationModal';

/* global app, m */

export default class GroupListPage extends Page {
    oninit(vnode) {
        super.oninit(vnode);

        this.items = null;

        app.request({
            method: 'GET',
            url: app.forum.attribute('apiUrl') + '/mircle-group-list',
        }).then(response => {
            this.items = app.store.pushPayload(response);
            m.redraw();
        });

        this.bodyClass = 'GroupList-page';
    }

    view() {
        return m('.IndexPage', [
            IndexPage.prototype.hero(),
            m('.container', m('.sideNavContainer', [
                m('nav.IndexPage-nav.sideNav', m('ul', listItems(IndexPage.prototype.sidebarItems().toArray()))),
                m('.IndexPage-results.sideNavOffset.GroupList-content', this.content()),
            ])),
        ]);
    }

    content() {
        if (this.items === null) {
            return LoadingIndicator.component();
        }

        return this.items.map(item => m('div', [
            m('h3.GroupList-title', [
                GroupBadge.component({
                    group: item.group(),
                }),
                ' ',
                item.group().namePlural(),
            ]),
            item.contentHtml() ? m('.GroupList-description', m.trust(item.contentHtml())) : null,
            m(UserList, {
                users: item.members(),
                hideBadgeId: 'group' + item.group().id(),
            }),
            // 添加申请按钮
            this.showApplyButton(item.group()) ? m('.GroupList-apply', [
                Button.component({
                    className: 'Button Button--primary',
                    onclick: () => {
                        //console.log('Apply button clicked');
                        //console.log('Group:', item.group());
                        //console.log('Modal component:', GroupApplicationModal);
                        //console.log('App modal:', app.modal);
                        
                        try {
                            app.modal.show(GroupApplicationModal, {
                                group: item.group()
                            });
                            console.log('Modal show called successfully');
                        } catch (error) {
                            console.error('Error showing modal:', error);
                        }
                    }
                }, app.translator.trans('mircle-group-list.forum.apply.button'))
            ]) : null,
        ]));
    }

    showApplyButton(group) {
        //console.log('showApplyButton called for group:', group);
        //console.log('canApplyToGroups:', app.forum.attribute('canApplyToGroups'));
        //console.log('user groups:', app.session.user.groups());
        //console.log('group id:', group.id());
        
        // 检查用户是否有权限申请，且不在该群组中
        const canApply = app.forum.attribute('canApplyToGroups') && 
               !app.session.user.groups().some(userGroup => userGroup.id() === group.id());
        
        console.log('Can apply:', canApply);
        return canApply;
    }
}
