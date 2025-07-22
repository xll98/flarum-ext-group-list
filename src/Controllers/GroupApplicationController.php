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
        
        // 添加用户筛选
        if (isset($filters['user'])) {
            $userId = $filters['user'];
            if (is_numeric($userId)) {
                // 如果是管理员或有审核权限的用户，可以查看任何用户的申请
                if ($actor->isAdmin() || $actor->hasPermission('mircle-group-list.review-applications')) {
                    $applications = $applications->where('user_id', $userId);
                } else {
                    // 普通用户只能查看自己的申请
                    if ($userId == $actor->id) {
                        $applications = $applications->where('user_id', $userId);
                    }
                    // 如果尝试查看其他用户的申请，忽略此筛选
                }
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