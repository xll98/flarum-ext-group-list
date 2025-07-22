<?php

namespace Mircle\GroupList\Controllers;

use Mircle\GroupList\GroupApplication;
use Mircle\GroupList\Serializers\GroupApplicationSerializer;
use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Illuminate\Support\Arr;

class GroupApplicationController extends AbstractListController
{
    public $serializer = GroupApplicationSerializer::class;

    public $include = [
        'user',
        'group',
        'reviewer',
    ];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        
        // 管理员可以查看所有申请，普通用户只能查看自己的申请
        if ($actor->isAdmin() || $actor->hasPermission('mircle-group-list.review-applications')) {
            $applications = GroupApplication::query();
        } else {
            $applications = GroupApplication::query()->where('user_id', $actor->id);
        }

        // 添加状态筛选
        $filters = Arr::get($request->getQueryParams(), 'filter', []);
        if (isset($filters['status'])) {
            $statusFilter = $filters['status'];
            if (in_array($statusFilter, ['pending', 'approved', 'rejected'])) {
                $applications = $applications->where('status', $statusFilter);
            }
        }

        $applications = $applications->orderBy('created_at', 'desc')->get();

        $applications->load([
            'user',
            'group',
            'reviewer',
        ]);

        return $applications;
    }
} 