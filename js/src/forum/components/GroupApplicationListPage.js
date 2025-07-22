import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import GroupApplicationItem from './GroupApplicationItem';

export default class GroupApplicationListPage extends Page {
    oninit(vnode) {
        super.oninit(vnode);
        
        this.applications = [];
        this.loading = false;
        this.statusFilter = 'all'; // 添加状态筛选器
        this.includedData = {}; // 存储included数据
        this.loadApplications();
    }

    loadApplications() {
        this.loading = true;
        m.redraw();

        // 构建API URL，添加状态筛选参数
        let url = app.forum.attribute('apiUrl') + '/mircle-group-applications?include=user,group,reviewer';
        if (this.statusFilter !== 'all') {
            url += '&filter[status]=' + this.statusFilter;
        }

        app.request({
            method: 'GET',
            url: url,
        }).then(response => {
            // 将included数据存储起来
            this.includedData = {};
            if (response.included) {
                response.included.forEach(item => {
                    if (!this.includedData[item.type]) {
                        this.includedData[item.type] = {};
                    }
                    this.includedData[item.type][item.id] = item;
                });
            }
            
            this.applications = response.data;
            this.loading = false;
            m.redraw();
        }).catch(error => {
            console.error('Failed to load applications:', error);
            this.loading = false;
            m.redraw();
        });
    }

    onStatusFilterChange(newStatus) {
        this.statusFilter = newStatus;
        this.loadApplications();
    }

    view() {
        const isReviewer = app.forum.attribute('canReviewApplications');
        const pageTitle = isReviewer ? 
            app.translator.trans('mircle-group-list.forum.applications.title') :
            app.translator.trans('mircle-group-list.forum.applications.my_title', {}, '我的群组申请');
        
        // 根据筛选状态调整空状态文本
        let emptyText;
        if (this.statusFilter === 'all') {
            emptyText = isReviewer ? '暂无申请记录' : '您暂无申请记录';
        } else {
            const statusNames = {
                'pending': '待审核',
                'approved': '已批准', 
                'rejected': '已拒绝'
            };
            emptyText = `暂无${statusNames[this.statusFilter]}的申请`;
        }
        
        // 申请数量统计
        const applicationCount = this.applications.length;
        const countText = this.loading ? '' : `(${applicationCount} 条)`;
            
        return m('.GroupApplicationListPage', [
            m('.container', [
                m('.GroupApplicationListPage-header', [
                    m('h1', [pageTitle, ' ', m('span.GroupApplicationListPage-count', countText)]),
                    // 添加状态筛选器
                    m('.GroupApplicationListPage-filters', [
                        m('.GroupApplicationListPage-filterButtons', [
                            m('button.Button.GroupApplicationListPage-filterButton', {
                                className: this.statusFilter === 'all' ? 'Button--primary' : '',
                                onclick: () => this.onStatusFilterChange('all')
                            }, [
                                m('span.GroupApplicationListPage-filterText', '全部')
                            ]),
                            m('button.Button.GroupApplicationListPage-filterButton', {
                                className: this.statusFilter === 'pending' ? 'Button--primary' : '',
                                onclick: () => this.onStatusFilterChange('pending')
                            }, [
                                m('i.fas.fa-clock.GroupApplicationListPage-filterIcon'),
                                m('span.GroupApplicationListPage-filterText', '待审核')
                            ]),
                            m('button.Button.GroupApplicationListPage-filterButton', {
                                className: this.statusFilter === 'approved' ? 'Button--primary' : '',
                                onclick: () => this.onStatusFilterChange('approved')
                            }, [
                                m('i.fas.fa-check.GroupApplicationListPage-filterIcon'),
                                m('span.GroupApplicationListPage-filterText', '已批准')
                            ]),
                            m('button.Button.GroupApplicationListPage-filterButton', {
                                className: this.statusFilter === 'rejected' ? 'Button--primary' : '',
                                onclick: () => this.onStatusFilterChange('rejected')
                            }, [
                                m('i.fas.fa-times.GroupApplicationListPage-filterIcon'),
                                m('span.GroupApplicationListPage-filterText', '已拒绝')
                            ])
                        ])
                    ])
                ]),
                
                this.loading ? 
                    LoadingIndicator.component() : 
                    m('.GroupApplicationListPage-content', 
                        this.applications.length === 0 ? 
                            m('.GroupApplicationListPage-empty', emptyText) :
                            m('.GroupApplicationListPage-list', 
                                this.applications.map(application => 
                                    m(GroupApplicationItem, {
                                        key: application.id,
                                        application: application,
                                        includedData: this.includedData,
                                        onUpdate: () => this.loadApplications()
                                    })
                                )
                            )
                    )
            ])
        ]);
    }
} 