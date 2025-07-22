<?php

namespace Mircle\GroupList;

use Flarum\Database\AbstractModel;
use Flarum\Group\Group;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Relations;

/**
 * @property int $id
 * @property int $user_id
 * @property int $group_id
 * @property string $content
 * @property string $status
 * @property int $reviewed_by
 * @property \Carbon\Carbon $reviewed_at
 * @property string $review_comment
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property User $user
 * @property Group $group
 * @property User $reviewer
 */
class GroupApplication extends AbstractModel
{
    protected $table = 'mircle_group_applications';

    protected $casts = [
        'reviewed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function group(): Relations\BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function reviewer(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
} 