<?php

namespace Mircle\GroupList\Controllers;

use Mircle\GroupList\GroupApplication;
use Mircle\GroupList\Serializers\GroupApplicationSerializer;
use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Illuminate\Support\Arr;

class GroupApplicationStoreController extends AbstractCreateController
{
    public $serializer = GroupApplicationSerializer::class;

    public $include = [
        'user',
        'group',
    ];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertCan('mircle-group-list.apply');

        $data = Arr::get($request->getParsedBody(), 'data', []);
        $attributes = Arr::get($data, 'attributes', []);

        $groupId = Arr::get($attributes, 'groupId');
        $content = Arr::get($attributes, 'content');

        if (!$groupId || !$content) {
            throw new \Exception('Group ID and content are required');
        }

        // 检查是否已经有待处理的申请
        $existingApplication = GroupApplication::where('user_id', $actor->id)
            ->where('group_id', $groupId)
            ->where('status', 'pending')
            ->first();

        if ($existingApplication) {
            throw new \Exception('You already have a pending application for this group');
        }

        $application = new GroupApplication();
        $application->user_id = $actor->id;
        $application->group_id = $groupId;
        $application->content = $content;
        $application->status = 'pending';
        
        // 明确设置时间戳
        $now = now();
        $application->created_at = $now;
        $application->updated_at = $now;
        
        // 确保审核相关字段为null
        $application->reviewed_by = null;
        $application->reviewed_at = null;
        $application->review_comment = null;
        
        $application->save();

        $application->load([
            'user',
            'group',
        ]);

        return $application;
    }
} 