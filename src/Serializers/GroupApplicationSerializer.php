<?php

namespace Mircle\GroupList\Serializers;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\BasicUserSerializer;
use Flarum\Api\Serializer\GroupSerializer;

class GroupApplicationSerializer extends AbstractSerializer
{
    protected $type = 'mircle-group-applications';

    protected function getDefaultAttributes($application)
    {
        return [
            'id' => $application->id,
            'content' => $application->content,
            'status' => $application->status,
            'reviewComment' => $application->review_comment,
            'reviewedAt' => $this->formatDate($application->reviewed_at),
            'createdAt' => $this->formatDate($application->created_at),
            'updatedAt' => $this->formatDate($application->updated_at),
        ];
    }

    protected function user($application)
    {
        return $this->hasOne($application, BasicUserSerializer::class);
    }

    protected function group($application)
    {
        return $this->hasOne($application, GroupSerializer::class);
    }

    protected function reviewer($application)
    {
        return $this->hasOne($application, BasicUserSerializer::class);
    }
} 