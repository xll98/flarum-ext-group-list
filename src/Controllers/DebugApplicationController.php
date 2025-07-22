<?php

namespace Mircle\GroupList\Controllers;

use Mircle\GroupList\GroupApplication;
use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Illuminate\Database\Capsule\Manager as DB;

class DebugApplicationController extends AbstractListController
{
    public $serializer = \Mircle\GroupList\Serializers\GroupApplicationSerializer::class;

    public $include = [
        'user',
        'group',
        'reviewer',
    ];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        
        // 调试信息
        $debug = [
            'actor_id' => $actor->id,
            'actor_is_admin' => $actor->isAdmin(),
            'actor_permissions' => [],
        ];
        
        // 获取所有权限
        $permissions = DB::table('group_permission')
            ->join('group_user', 'group_permission.group_id', '=', 'group_user.group_id')
            ->where('group_user.user_id', $actor->id)
            ->pluck('permission')
            ->toArray();
        $debug['actor_permissions'] = $permissions;
        
        // 检查表是否存在
        try {
            $tableExists = DB::select("SHOW TABLES LIKE 'mircle_group_applications'");
            $debug['table_exists'] = count($tableExists) > 0;
        } catch (\Exception $e) {
            $debug['table_error'] = $e->getMessage();
        }
        
        // 直接查询数据库
        try {
            $rawApplications = DB::table('mircle_group_applications')->get();
            $debug['raw_count'] = $rawApplications->count();
            $debug['raw_data'] = $rawApplications->toArray();
        } catch (\Exception $e) {
            $debug['raw_error'] = $e->getMessage();
        }
        
        // 使用模型查询并加载关联数据
        try {
            $applications = GroupApplication::all();
            $applications->load([
                'user',
                'group',
                'reviewer',
            ]);
            $debug['model_count'] = $applications->count();
            $debug['model_data'] = $applications->toArray();
        } catch (\Exception $e) {
            $debug['model_error'] = $e->getMessage();
        }
        
        // 记录到日志
        error_log("DebugApplicationController: " . json_encode($debug, JSON_PRETTY_PRINT));
        
        // 返回加载了关联数据的申请
        return $applications;
    }
} 