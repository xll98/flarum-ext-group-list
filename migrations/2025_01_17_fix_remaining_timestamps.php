<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $connection = $schema->getConnection();
        
        // 修复所有created_at为null的记录
        $connection->table('mircle_group_applications')
            ->whereNull('created_at')
            ->orWhereNull('updated_at')
            ->update([
                'created_at' => $connection->raw('COALESCE(created_at, NOW())'),
                'updated_at' => $connection->raw('COALESCE(updated_at, NOW())')
            ]);
    },
    'down' => function (Builder $schema) {
        // 不需要回滚操作
    },
]; 