import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import withAttr from 'flarum/common/utils/withAttr';

/* global m */

export default class GroupApplicationModal extends Modal {
    oninit(vnode) {
        super.oninit(vnode);
        
        console.log('GroupApplicationModal oninit called');
        console.log('Group:', this.attrs.group);
        
        this.group = this.attrs.group;
        //this.content = Stream('');
        this.uploadedFiles = [];
        this.loading = false;
    }

    className() {
        console.log('GroupApplicationModal className called');
        return 'GroupApplicationModal Modal--small';
    }

    title() {
        console.log('GroupApplicationModal title called');
        const title = app.translator.trans('mircle-group-list.forum.apply.title', { group: this.group.nameSingular() });
        console.log('Modal title:', title);
        return title;
    }

    content() {
        console.log('GroupApplicationModal content called');
        console.log('Creating simple test content...');
        
        try {
            // 最简单的测试内容
            const content_test = (
                <div className="Modal-body">
                    <h3>测试模态框内容</h3>
                    <p>如果您能看到这个内容，说明模态框正常工作</p>
                    <p>群组名称: {this.group.nameSingular()}</p>
                    <button 
                        className="Button Button--primary"
                        onclick={() => {
                            console.log('测试按钮被点击');
                            this.hide();
                        }}
                    >
                        关闭模态框
                    </button>
                </div>
            );
            
            console.log('Content created successfully:', content_test);
            return content_test;
        } catch (error) {
            console.error('Error in content method:', error);
            console.error('Error stack:', error.stack);
            return <div className="Modal-body">Error: {error.message}</div>;
        }
    }

    // view() {
    //     console.log('GroupApplicationModal view called');
    //     const result = super.view();
    //     console.log('View result:', result);
    //     return result;
    // }

    onsubmit(e) {
        e.preventDefault();
        console.log('onsubmit called');
        this.hide();
    }
} 