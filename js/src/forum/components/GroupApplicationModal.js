import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import withAttr from 'flarum/common/utils/withAttr';

/* global m */

export default class GroupApplicationModal extends Modal {
    oninit(vnode) {
        super.oninit(vnode);
        this.group = this.attrs.group;
        this.reason = Stream(''); // 申请理由
        this.uploadedFiles = []; // 图片数组
        this.loading = false;
    }

    className() {
        return 'GroupApplicationModal Modal--small';
    }

    title() {
        return app.translator.trans('mircle-group-list.forum.apply.title', { group: this.group.nameSingular() });
    }

    content() {
        return (
            <div className="Modal-body">
                <div className="Form">
                    <div className="Form-group">
                        <label>{app.translator.trans('mircle-group-list.forum.apply.content_label')}</label>
                        <textarea
                            className="FormControl"
                            rows="4"
                            placeholder={app.translator.trans('mircle-group-list.forum.apply.content_placeholder')}
                            value={this.reason()}
                            oninput={withAttr('value', this.reason)}
                        />
                    </div>
                    <div className="Form-group">
                        <label>{app.translator.trans('mircle-group-list.forum.apply.images_label')}</label>
                        <input
                            type="file"
                            className="FormControl"
                            multiple
                            accept="image/*"
                            onchange={this.uploadFiles.bind(this)}
                        />
                        <div className="helpText">
                            {app.translator.trans('mircle-group-list.forum.apply.upload_images')}
                        </div>
                        {this.uploadedFiles.length > 0 && (
                            <div style="margin-top:10px;">
                                {this.uploadedFiles.map((file, idx) => (
                                    <span style="display:inline-block;margin-right:8px;position:relative;" key={idx}>
                                        <img src={file.url} style="max-width:80px;max-height:80px;border-radius:4px;" />
                                        <span
                                            style="position:absolute;top:0;right:0;background:#f44;color:#fff;border-radius:50%;width:18px;height:18px;line-height:18px;text-align:center;cursor:pointer;font-size:12px;"
                                            onclick={() => { this.removeImage(idx); }}
                                        >×</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="Form-group">
                        <Button
                            className="Button Button--primary"
                            type="submit"
                            loading={this.loading}
                            disabled={!this.reason().trim()}
                        >
                            {app.translator.trans('mircle-group-list.forum.apply.submit')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    uploadFiles(event) {
        const files = Array.from(event.target.files);
        files.forEach(file => {
            const formData = new FormData();
            formData.append('files[]', file);
            app.request({
                method: 'POST',
                url: app.forum.attribute('apiUrl') + '/fof/upload',
                body: formData,
                headers: {
                    'Authorization': 'Token ' + app.session.token,
                },
                serialize: raw => raw
            }).then(response => {
                // 修复：响应数据是数组，需要访问第一个元素
                const fileData = response.data[0];
                this.uploadedFiles.push({
                    url: fileData.attributes.url,
                    name: file.name,
                });
                m.redraw();
            }).catch(error => {
                console.error('Upload failed:', error);
                // 修复：移除未定义的response引用
                app.alerts.show({ type: 'error' }, app.translator.trans('mircle-group-list.forum.apply.upload_error'));
            });
        });
    }

    removeImage(idx) {
        this.uploadedFiles.splice(idx, 1);
        m.redraw();
    }

    onsubmit(e) {
        e.preventDefault();
        if (this.loading) return;
        if (!this.reason().trim()) {
            app.alerts.show({ type: 'error' }, app.translator.trans('mircle-group-list.forum.apply.content_required'));
            return;
        }
        this.loading = true;
        const imagesHtml = this.uploadedFiles.map(file => `<img src="${file.url}" alt="img" style="max-width:200px;margin:5px;" />`).join('');
        const fullContent = this.reason() + (imagesHtml ? '<br><br>' + imagesHtml : '');
        app.request({
            method: 'POST',
            url: app.forum.attribute('apiUrl') + '/mircle-group-applications',
            body: {
                data: {
                    type: 'mircle-group-applications',
                    attributes: {
                        groupId: this.group.id(),
                        content: fullContent,
                    },
                },
            },
        }).then(() => {
            this.loading = false;
            app.alerts.show({ type: 'success' }, app.translator.trans('mircle-group-list.forum.apply.success'));
            this.hide();
        }).catch(() => {
            this.loading = false;
            app.alerts.show({ type: 'error' }, app.translator.trans('mircle-group-list.forum.apply.error'));
        });
    }
} 