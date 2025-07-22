import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import GroupApplicationReviewModal from './GroupApplicationReviewModal';

export default class GroupApplicationItem extends Component {
    view() {
        const application = this.attrs.application;
        
        // 添加安全检查
        if (!application || !application.relationships) {
            return m('.GroupApplicationItem-error', 
                app.translator.trans('mircle-group-list.forum.applications.data_error', {}, 'Data loading error')
            );
        }
        
        // 检查application.attributes是否存在
        if (!application.attributes) {
            return m('.GroupApplicationItem-error', 
                app.translator.trans('mircle-group-list.forum.applications.missing_application_attributes', {}, 'Missing application attributes')
            );
        }
        
        // 使用传递的included数据获取相关数据
        const userRelation = application.relationships.user;
        const groupRelation = application.relationships.group;
        const reviewerRelation = application.relationships.reviewer;
        const includedData = this.attrs.includedData || {};
        
        let user = null;
        let group = null;
        let reviewer = null;
        
        // 从included数据中获取用户信息
        if (userRelation && userRelation.data && includedData.users) {
            const userData = includedData.users[userRelation.data.id];
            if (userData) {
                user = {
                    id: userData.id,
                    ...userData.attributes
                };
            }
        }
        
        // 从included数据中获取群组信息
        if (groupRelation && groupRelation.data && includedData.groups) {
            const groupData = includedData.groups[groupRelation.data.id];
            if (groupData) {
                group = {
                    id: groupData.id,
                    ...groupData.attributes
                };
            }
        }
        
        // 从included数据中获取审核者信息
        if (reviewerRelation && reviewerRelation.data && includedData.users) {
            const reviewerData = includedData.users[reviewerRelation.data.id];
            if (reviewerData) {
                reviewer = {
                    id: reviewerData.id,
                    ...reviewerData.attributes
                };
            }
        }
        
        // 如果关键数据缺失，显示错误信息
        if (!user || !group) {
            return m('.GroupApplicationItem-error', 
                `申请数据不完整 (用户ID: ${userRelation?.data?.id || 'N/A'}, 群组ID: ${groupRelation?.data?.id || 'N/A'})`
            );
        }
        
        // 安全地获取显示名称
        const userName = user.displayName || user.username || 'Unknown User';
        const groupName = group.nameSingular || 'Unknown Group';
        const reviewerName = reviewer ? (reviewer.displayName || reviewer.username || 'Unknown Reviewer') : app.translator.trans('mircle-group-list.forum.applications.unknown_reviewer', {}, 'Unknown');
        
        const statusClass = {
            'pending': 'GroupApplicationItem--pending',
            'approved': 'GroupApplicationItem--approved',
            'rejected': 'GroupApplicationItem--rejected',
        }[application.attributes.status];

        return m(`.GroupApplicationItem.${statusClass}`, [
            m('.GroupApplicationItem-header', [
                m('.GroupApplicationItem-user', [
                    m('strong', userName),
                    ' ',
                    app.translator.trans('mircle-group-list.forum.applications.applying_to'),
                    ' ',
                    m('strong', groupName)
                ]),
                m('.GroupApplicationItem-status', 
                    app.translator.trans(`mircle-group-list.forum.applications.status.${application.attributes.status}`)
                )
            ]),
            
            m('.GroupApplicationItem-content', [
                m('.GroupApplicationItem-text', {
                    innerHTML: application.attributes.content
                })
            ]),
            
            m('.GroupApplicationItem-meta', [
                m('span.GroupApplicationItem-date', 
                    app.translator.trans('mircle-group-list.forum.applications.submitted_on', {
                        date: application.attributes.createdAt ? 
                            new Date(application.attributes.createdAt).toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : '未知时间'
                    })
                ),
                
                application.attributes.reviewedAt ? m('span.GroupApplicationItem-reviewed', 
                    `审核人：${reviewerName}，审核时间：${application.attributes.reviewedAt ? 
                        new Date(application.attributes.reviewedAt).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '未知时间'}`
                ) : null
            ]),
            
            application.attributes.reviewComment ? m('.GroupApplicationItem-review', [
                m('strong', app.translator.trans('mircle-group-list.forum.applications.review_comment') + ':'),
                m('.GroupApplicationItem-reviewComment', {
                    innerHTML: application.attributes.reviewComment
                })
            ]) : null,
            
            application.attributes.status === 'pending' && app.forum.attribute('canReviewApplications') ? 
                m('.GroupApplicationItem-actions', [
                    Button.component({
                        className: 'Button Button--primary',
                        onclick: () => app.modal.show(GroupApplicationReviewModal, {
                            application: application,
                            includedData: this.attrs.includedData,
                            onUpdate: this.attrs.onUpdate
                        })
                    }, app.translator.trans('mircle-group-list.forum.applications.review'))
                ]) : null
        ]);
    }
} 