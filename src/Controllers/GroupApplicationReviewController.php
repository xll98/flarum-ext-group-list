<?php

namespace Mircle\GroupList\Controllers;

use Mircle\GroupList\GroupApplication;
use Mircle\GroupList\Serializers\GroupApplicationSerializer;
use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Illuminate\Support\Arr;

class GroupApplicationReviewController extends AbstractShowController
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
        $actor->assertCan('mircle-group-list.review-applications');

        $applicationId = Arr::get($request->getAttribute('routeParameters'), 'id');
        $application = GroupApplication::findOrFail($applicationId);

        $data = Arr::get($request->getParsedBody(), 'data', []);
        $attributes = Arr::get($data, 'attributes', []);

        $status = Arr::get($attributes, 'status');
        $reviewComment = Arr::get($attributes, 'reviewComment');

        if (!in_array($status, ['approved', 'rejected'])) {
            throw new \Exception('Invalid status. Must be approved or rejected');
        }

        $application->status = $status;
        $application->reviewed_by = $actor->id;
        $application->reviewed_at = now();
        $application->review_comment = $reviewComment;

        // 如果批准申请，将用户添加到群组
        if ($status === 'approved') {
            $application->user->groups()->attach($application->group_id);
        }

        $application->save();

        $application->load([
            'user',
            'group',
            'reviewer',
        ]);

        return $application;
    }
} 