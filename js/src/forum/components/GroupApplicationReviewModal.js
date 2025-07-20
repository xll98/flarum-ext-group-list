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
        const user = this.application.relationships.user.data;
        const group = this.application.relationships.group.data;
        
        return (
            <div className="Modal-body">
                <div className="GroupApplicationReviewModal-info">
                    <p>
                        {app.translator.trans('mircle-group-list.forum.review.applicant_info', {
                            user: user.attributes.username,
                            group: group.attributes.nameSingular
                        })}
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
                        value={this.reviewComment()}
                        oninput={withAttr('value', this.reviewComment)}
                        rows="3"
                        placeholder={app.translator.trans('mircle-group-list.forum.review.comment_placeholder')}
                    />
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