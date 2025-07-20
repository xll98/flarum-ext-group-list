import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import GroupApplicationItem from './GroupApplicationItem';

export default class GroupApplicationListPage extends Page {
    oninit(vnode) {
        super.oninit(vnode);
        
        this.applications = [];
        this.loading = false;
        this.loadApplications();
    }

    loadApplications() {
        this.loading = true;
        m.redraw();

        app.request({
            method: 'GET',
            url: app.forum.attribute('apiUrl') + '/mircle-group-applications',
        }).then(response => {
            this.applications = response.data;
            this.loading = false;
            m.redraw();
        }).catch(error => {
            console.error('Failed to load applications:', error);
            this.loading = false;
            m.redraw();
        });
    }

    view() {
        return m('.GroupApplicationListPage', [
            m('.container', [
                m('.GroupApplicationListPage-header', [
                    m('h1', app.translator.trans('mircle-group-list.forum.applications.title'))
                ]),
                
                this.loading ? 
                    LoadingIndicator.component() : 
                    m('.GroupApplicationListPage-content', 
                        this.applications.length === 0 ? 
                            m('.GroupApplicationListPage-empty', 
                                app.translator.trans('mircle-group-list.forum.applications.empty')
                            ) :
                            m('.GroupApplicationListPage-list', 
                                this.applications.map(application => 
                                    m(GroupApplicationItem, {
                                        key: application.id,
                                        application: application,
                                        onUpdate: () => this.loadApplications()
                                    })
                                )
                            )
                    )
            ])
        ]);
    }
} 