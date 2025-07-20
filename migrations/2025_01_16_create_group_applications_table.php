<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->create('mircle_group_applications', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('group_id');
            $table->text('content');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->unsignedInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_comment')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
            $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
            
            // 确保同一用户对同一群组只能有一个待处理的申请
            $table->unique(['user_id', 'group_id', 'status'], 'unique_pending_application');
        });
    },
    'down' => function (Builder $schema) {
        $schema->dropIfExists('mircle_group_applications');
    },
]; 