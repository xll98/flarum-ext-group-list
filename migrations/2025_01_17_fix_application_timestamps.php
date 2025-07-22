<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;
use Illuminate\Database\ConnectionInterface;

return [
    'up' => function (Builder $schema) {
        $connection = $schema->getConnection();
        
        // 修复created_at为null的记录
        $connection->table('mircle_group_applications')
            ->whereNull('created_at')
            ->update([
                'created_at' => $connection->raw('NOW()'),
                'updated_at' => $connection->raw('NOW()')
            ]);
    },
    'down' => function (Builder $schema) {
        // 不需要回滚操作
    },
]; 