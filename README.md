# Group List

![License](https://img.shields.io/badge/license-MIT-blue.svg) [![Latest Stable Version](https://img.shields.io/packagist/v/mircle/flarum-ext-group-list.svg)](https://packagist.org/packages/mircle/flarum-ext-group-list) [![Total Downloads](https://img.shields.io/packagist/dt/mircle/flarum-ext-group-list.svg)](https://packagist.org/packages/mircle/flarum-ext-group-list) [![Donate](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.me/mircle)


# 群组申请功能安装说明

## 功能概述

本插件在原有群组列表功能基础上，新增了用户申请加入群组的功能，包括：

1. **用户申请功能**：用户可以申请加入特定群组，提交文字说明和图片
2. **图片上传**：使用 fof/upload 扩展进行图片上传
3. **管理员审核**：管理员可以在后台审核申请，批准或拒绝
4. **申请状态跟踪**：用户可以查看自己的申请状态

## 安装步骤

### 1. 安装依赖

确保已安装 `fof/upload` 扩展：

```bash
composer require fof/upload
```

### 2. 安装本插件

```bash
composer require mircle/flarum-ext-group-list
```

### 3. 运行数据库迁移

```bash
php flarum migrate
```

### 4. 清理缓存
```bash
php flarum cache:clear
```

### 5. 设置权限

在管理后台中，为相关用户组分配以下权限：

- `mircle-group-list.apply` - 申请加入群组
- `mircle-group-list.review-applications` - 审核群组申请

## 功能使用

### 用户申请群组

1. 访问群组列表页面 (`/groups`)
2. 在想要加入的群组下方点击"申请加入"按钮
3. 填写申请内容并上传相关图片
4. 提交申请，等待管理员审核

### 管理员审核申请

1. 在侧边栏点击"群组申请"链接
2. 查看待审核的申请列表
3. 点击"审核申请"按钮
4. 选择批准或拒绝，并填写审核意见
5. 提交审核结果

## 数据库结构

新增的 `mircle_group_applications` 表包含以下字段：

- `id` - 主键
- `user_id` - 申请用户ID
- `group_id` - 目标群组ID
- `content` - 申请内容
- `status` - 申请状态 (pending/approved/rejected)
- `reviewed_by` - 审核人ID
- `reviewed_at` - 审核时间
- `review_comment` - 审核意见
- `created_at` - 创建时间
- `updated_at` - 更新时间

## 注意事项

1. 同一用户对同一群组只能有一个待处理的申请
2. 申请被批准后，用户会自动加入该群组
3. 图片上传需要确保 fof/upload 扩展正常工作
4. 建议定期清理已处理的申请记录以优化数据库性能

## 故障排除

### 常见问题

1. **申请按钮不显示**
   - 检查用户是否有 `mircle-group-list.apply` 权限
   - 确认用户不在目标群组中

2. **图片上传失败**
   - 检查 fof/upload 扩展是否正确安装
   - 确认上传目录权限设置正确

3. **审核功能无法使用**
   - 检查管理员是否有 `mircle-group-list.review-applications` 权限


## Links

- [GitHub](https://github.com/mircle/flarum-ext-group-list)
- [Packagist](https://packagist.org/packages/mircle/flarum-ext-group-list)
- [Discuss](https://discuss.flarum.org/d/25386)
