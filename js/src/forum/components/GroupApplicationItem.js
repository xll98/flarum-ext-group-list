import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import GroupApplicationReviewModal from './GroupApplicationReviewModal';

export default class GroupApplicationItem extends Component {
    view() {
        const application = this.attrs.application;
        const user = application.relationships.user.data;
        const group = application.relationships.group.data;
        const reviewer = application.relationships.reviewer.data;
        
        const statusClass = {
            'pending': 'GroupApplicationItem--pending',
            'approved': 'GroupApplicationItem--approved',
            'rejected': 'GroupApplicationItem--rejected',
        }[application.attributes.status];

        return m(`.GroupApplicationItem.${statusClass}`, [
            m('.GroupApplicationItem-header', [
                m('.GroupApplicationItem-user', [
                    m('strong', user.attributes.username),
                    ' ',
                    app.translator.trans('mircle-group-list.forum.applications.applying_to'),
                    ' ',
                    m('strong', group.attributes.nameSingular)
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
                        date: dayjs(application.attributes.createdAt).format('YYYY-MM-DD HH:mm')
                    })
                ),
                
                application.attributes.reviewedAt ? m('span.GroupApplicationItem-reviewed', 
                    app.translator.trans('mircle-group-list.forum.applications.reviewed_by', {
                        reviewer: reviewer ? reviewer.attributes.username : 'Unknown',
                        date: dayjs(application.attributes.reviewedAt).format('YYYY-MM-DD HH:mm')
                    })
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
                            onUpdate: this.attrs.onUpdate
                        })
                    }, app.translator.trans('mircle-group-list.forum.applications.review'))
                ]) : null
        ]);
    }
} 