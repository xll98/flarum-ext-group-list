<?php

namespace Mircle\GroupList;

use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Extend;
use Flarum\Settings\SettingsRepositoryInterface;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/resources/less/forum.less')
        ->route('/groups', 'mircle-group-list')
        ->route('/group-applications', 'mircle-group-applications'),
    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/resources/less/admin.less'),
    new Extend\Locales(__DIR__ . '/resources/locale'),
    (new Extend\Routes('api'))
        ->get('/mircle-group-list', 'mircle-group-list.index', Controllers\GroupListController::class)
        ->post('/mircle-group-list-items', 'mircle-group-list.create', Controllers\ItemStoreController::class)
        ->patch('/mircle-group-list-items/{id:[0-9]+}', 'mircle-group-list.update', Controllers\ItemUpdateController::class)
        ->delete('/mircle-group-list-items/{id:[0-9]+}', 'mircle-group-list.delete', Controllers\ItemDeleteController::class)
        ->get('/mircle-group-applications', 'mircle-group-applications.index', Controllers\GroupApplicationController::class)
        ->post('/mircle-group-applications', 'mircle-group-applications.create', Controllers\GroupApplicationStoreController::class)
        ->patch('/mircle-group-applications/{id:[0-9]+}/review', 'mircle-group-applications.review', Controllers\GroupApplicationReviewController::class),
    (new Extend\ApiSerializer(ForumSerializer::class))
        ->attributes(function (ForumSerializer $serializer): array {
            /**
             * @var $settings SettingsRepositoryInterface
             */
            $settings = resolve(SettingsRepositoryInterface::class);
            $actor = $serializer->getActor();

            return [
                'mircle-group-list.showSideNavLink' => $settings->get('mircle-group-list.showSideNavLink') !== '0' && $actor->hasPermission('mircle-group-list.see'),
                'mircle-group-list.showAvatarBadges' => $settings->get('mircle-group-list.showAvatarBadges') === '1',
                'mircle-group-list.showOnlineStatus' => $settings->get('mircle-group-list.showOnlineStatus') === '1',
                'canApplyToGroups' => $actor->hasPermission('mircle-group-list.apply'),
                'canReviewApplications' => $actor->hasPermission('mircle-group-list.review-applications'),
            ];
        }),
];
