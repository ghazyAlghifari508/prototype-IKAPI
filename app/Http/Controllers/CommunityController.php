<?php

namespace App\Http\Controllers;

use App\Support\Fixtures;
use Illuminate\Contracts\View\View;

/**
 * P07 - Community Literasi: directory, profile, discussion room, topic and the reply-to-comment page.
 *
 * Frontend-only, like the prototype: the seed rows come from resources/data/ikapi/community-seed.json and every
 * mutation (join/leave, topics, replies, reports) stays in localStorage through the ported community core.
 * IDs are validated here so an unknown or mismatched id renders a 404 instead of silently reusing the first row.
 */
class CommunityController extends Controller
{
    public function index(): View
    {
        return view('buyer.community.index', [
            'communities' => Fixtures::get('community-seed')['communities'],
        ]);
    }

    public function show(string $community): View
    {
        $row = $this->community($community);

        return view('buyer.community.show', [
            'community' => $row,
            'communityId' => $row['id'],
            'topicCount' => count($this->topicsOf($row['id'])),
        ]);
    }

    public function discussion(string $community): View
    {
        $row = $this->community($community);

        return view('buyer.community.discussion', [
            'community' => $row,
            'communityId' => $row['id'],
            'topics' => $this->topicsOf($row['id']),
        ]);
    }

    /**
     * One topic inside one community. A topic id that exists in a different community is a 404 on purpose:
     * the prototype would open it under the wrong heading.
     */
    public function topic(string $community, string $topic): View
    {
        $row = $this->community($community);
        $topicRow = $this->topicOf($row['id'], $topic);

        return view('buyer.community.topic', [
            'community' => $row,
            'communityId' => $row['id'],
            'topic' => $topicRow,
            'topicId' => $topic,
        ]);
    }

    /**
     * Reply-to-comment page: the target reply must belong to the topic in the URL, otherwise 404. `reply` is
     * optional because the same page also serves the "target comment is gone" state (no parent, no composer).
     */
    public function reply(string $community, string $topic, ?string $reply = null): View
    {
        $row = $this->community($community);
        $topicRow = $this->topicOf($row['id'], $topic);

        $replyRow = null;
        if ($reply !== null) {
            $replies = Fixtures::get('community-seed')['replies'];
            foreach ($replies as $candidate) {
                if (is_array($candidate) && ($candidate['id'] ?? null) === $reply) {
                    $replyRow = $candidate;
                    break;
                }
            }

            if ($replyRow !== null) {
                // Seeded reply: it must belong to this topic, otherwise the URL points at the wrong discussion.
                abort_if($replyRow['topicId'] !== $topic, 404);
            } else {
                // Replies created in the browser only exist in localStorage (demo state), so a well-formed id is
                // rendered and the page script decides between the real parent and the "parent is gone" state.
                abort_unless((bool) preg_match('/^RPL-[A-Za-z0-9-]+$/', $reply), 404);
            }
        }

        return view('buyer.community.reply', [
            'community' => $row,
            'communityId' => $row['id'],
            'topic' => $topicRow,
            'topicId' => $topicRow['id'],
            'replyId' => $reply !== null ? $reply : null,
            'parentReply' => $replyRow,
        ]);
    }

    /**
     * @return array<mixed>
     */
    private function community(string $community): array
    {
        foreach (Fixtures::get('community-seed')['communities'] as $candidate) {
            if (is_array($candidate) && ($candidate['id'] ?? null) === $community) {
                return $candidate;
            }
        }

        abort(404);
    }

    /**
     * @return array<int, array<mixed>>
     */
    private function topicsOf(string $communityId): array
    {
        $rows = [];
        foreach (Fixtures::get('community-seed')['topics'] as $topic) {
            if (is_array($topic) && ($topic['communityId'] ?? null) === $communityId) {
                $rows[] = $topic;
            }
        }

        return $rows;
    }

    /**
     * A topic must either be one of the seeded rows of this community, or a well-formed id created in the browser
     * (localStorage). A seeded topic that belongs to a different community is a 404: it would render under the
     * wrong heading, and "invalid id" must not fall back to a sample row.
     *
     * @return array<mixed>
     */
    private function topicOf(string $communityId, string $topicId): array
    {
        foreach ($this->topicsOf($communityId) as $candidate) {
            if (($candidate['id'] ?? null) === $topicId) {
                return $candidate;
            }
        }

        foreach (Fixtures::get('community-seed')['topics'] as $candidate) {
            if (is_array($candidate) && ($candidate['id'] ?? null) === $topicId) {
                // The id exists, but in another community: opening it here would show the wrong heading.
                abort(404);
            }
        }

        abort_unless((bool) preg_match('/^TPC-[A-Za-z0-9-]+$/', $topicId), 404);

        return [
            'id' => $topicId,
            'communityId' => $communityId,
            'title' => '',
            'body' => '',
        ];
    }
}
