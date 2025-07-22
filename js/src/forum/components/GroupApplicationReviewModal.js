import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import withAttr from 'flarum/common/utils/withAttr';

/* global m */

export default class GroupApplicationReviewModal extends Modal {
    oninit(vnode) {
        super.oninit(vnode);
        
        this.application = this.attrs.application;
        this.status = Stream('approved');
        this.reviewComment = Stream('');
    }

    className() {
        return 'GroupApplicationReviewModal Modal--small';
    }

    title() {
        return app.translator.trans('mircle-group-list.forum.review.title');
    }

    content() {
        // 使用传递的included数据获取相关数据
        const userRelation = this.application.relationships.user;
        const groupRelation = this.application.relationships.group;
        const includedData = this.attrs.includedData || {};
        
        let user = null;
        let group = null;
        
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
        
        if (!user || !group) {
            return (
                <div className="Modal-body">
                    <p>数据加载错误，请刷新页面重试</p>
                </div>
            );
        }
        
        // 安全地获取显示名称
        const userName = user.displayName || user.username || 'Unknown User';
        const groupName = group.nameSingular || 'Unknown Group';
        
        return (
            <div className="Modal-body">
                <div className="GroupApplicationReviewModal-info">
                    <p>
                        用户 <strong>{userName}</strong> 申请加入群组 <strong>{groupName}</strong>
                    </p>
                </div>
                
                <div className="GroupApplicationReviewModal-content">
                    <h4>{app.translator.trans('mircle-group-list.forum.review.application_content')}</h4>
                    <div className="GroupApplicationReviewModal-applicationContent" innerHTML={this.application.attributes.content} />
                </div>
                
                <div className="Form-group">
                    <label>{app.translator.trans('mircle-group-list.forum.review.status_label')}</label>
                    <select
                        className="FormControl"
                        value={this.status()}
                        onchange={withAttr('value', this.status)}
                    >
                        <option value="approved">{app.translator.trans('mircle-group-list.forum.review.status.approved')}</option>
                        <option value="rejected">{app.translator.trans('mircle-group-list.forum.review.status.rejected')}</option>
                    </select>
                </div>
                
                <div className="Form-group">
                    <label>{app.translator.trans('mircle-group-list.forum.review.comment_label')}</label>
                    <textarea
                        className="FormControl"
                        rows="3"
                        placeholder={app.translator.trans('mircle-group-list.forum.review.comment_placeholder')}
                        value={this.reviewComment()}
                        oninput={withAttr('value', this.reviewComment)}
                    />
                </div>
                
                <div className="Form-group">
                    <Button
                        className="Button Button--primary"
                        type="submit"
                        loading={this.loading}
                    >
                        {app.translator.trans('mircle-group-list.forum.review.submit')}
                    </Button>
                </div>
            </div>
        );
    }

    onsubmit(e) {
        e.preventDefault();
        
        app.request({
            method: 'PATCH',
            url: app.forum.attribute('apiUrl') + `/mircle-group-applications/${this.application.id}/review`,
            body: {
                data: {
                    type: 'mircle-group-applications',
                    id: this.application.id,
                    attributes: {
                        status: this.status(),
                        reviewComment: this.reviewComment(),
                    },
                },
            },
        }).then(response => {
            app.alerts.show({ type: 'success' }, app.translator.trans('mircle-group-list.forum.review.success'));
            this.hide();
            this.attrs.onUpdate();
        }).catch(error => {
            console.error('Review failed:', error);
            app.alerts.show({ type: 'error' }, app.translator.trans('mircle-group-list.forum.review.error'));
        });
    }
} 