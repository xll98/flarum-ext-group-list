<?php

namespace Mircle\GroupList\Controllers;

use Mircle\GroupList\GroupApplication;
use Mircle\GroupList\Serializers\GroupApplicationSerializer;
use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Illuminate\Support\Arr;
use Carbon\Carbon;

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
        try {
            $actor = RequestUtil::getActor($request);
            $actor->assertCan('mircle-group-list.review-applications');

            $applicationId = Arr::get($request->getAttribute('routeParameters'), 'id');
            error_log("GroupApplicationReviewController: Processing application ID: " . $applicationId);
            
            $application = GroupApplication::findOrFail($applicationId);

            $data = Arr::get($request->getParsedBody(), 'data', []);
            $attributes = Arr::get($data, 'attributes', []);

            $status = Arr::get($attributes, 'status');
            $reviewComment = Arr::get($attributes, 'reviewComment');

            error_log("GroupApplicationReviewController: Status: " . $status . ", Comment: " . $reviewComment);

            if (!in_array($status, ['approved', 'rejected'])) {
                throw new \Exception('Invalid status. Must be approved or rejected');
            }

            $application->status = $status;
            $application->reviewed_by = $actor->id;
            $application->reviewed_at = Carbon::now();
            $application->review_comment = $reviewComment;

            // 如果批准申请，将用户添加到群组
            if ($status === 'approved') {
                // 检查用户是否已经在群组中
                $userInGroup = $application->user->groups()->where('group_id', $application->group_id)->exists();
                if (!$userInGroup) {
                    $application->user->groups()->attach($application->group_id);
                    error_log("GroupApplicationReviewController: Added user {$application->user_id} to group {$application->group_id}");
                } else {
                    error_log("GroupApplicationReviewController: User {$application->user_id} already in group {$application->group_id}");
                }
            }

            $application->save();
            error_log("GroupApplicationReviewController: Application saved successfully");

            $application->load([
                'user',
                'group',
                'reviewer',
            ]);

            return $application;
            
        } catch (\Exception $e) {
            error_log("GroupApplicationReviewController Error: " . $e->getMessage());
            error_log("GroupApplicationReviewController Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }
} 