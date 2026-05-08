<script setup>
import ProfileImg from './ProfileImg.vue';
import { useAuthenticationStore } from '@/stores/authentication';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { reactive } from 'vue';
import { toggleFeedLike } from '@/services/feedLikeService';
import { useCommentModalStore } from '@/stores/commentModal';
import { getDateTimeInfo } from '@/utils/commonUtils';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

const commentModalStore = useCommentModalStore();
const authenticationStore = useAuthenticationStore();
const emit = defineEmits(['onDeleteFeed']);

const props = defineProps({
  item: {
    feedId: String,
    writerUserId: String,
    writerPic: String,
    writerNm: String,
    location: String,
    pics: Array,
    contents: String,
    isLike: Boolean,
    likeCount: Number,
    commentCount: Number,
  },
  ynDel: Boolean,
});

const state = reactive({
  modules: [Navigation, Pagination, Scrollbar, A11y],
  isLike: props.item.isLike,
  likeCount: props.item.likeCount
});

const toggleLike = async () => {
  const data = { feedId: props.item.feedId };
  const res = await toggleFeedLike(data);
  if (res.status === 200) {
    state.isLike = res.data.resultData;
    state.likeCount = state.isLike ? state.likeCount + 1 : state.likeCount - 1;
  }
};

const showCommentModel = () => {
  commentModalStore.setFeedId(props.item.feedId);
}
</script>

<template>
  <article class="feed-card">
    <div class="feed-card-header">
      <div class="feed-card-profile">
        <router-link :to="`/profile/${props.item.writerUserId}`">
          <ProfileImg
            :userId="props.item.writerUserId"
            :pic="props.item.writerPic"
            :size="32"
            :clsValue="'pointer profile feed-card-avatar'" />
        </router-link>
      </div>
      <div class="feed-card-meta">
        <div class="feed-card-author-row">
          <router-link :to="`/profile/${props.item.writerUserId}`">
             <span class="pointer feed-card-author">
              {{
                props.item.writerNickName
                  ? props.item.writerNickName
                  : props.item.writerUid
              }}
            </span>
          </router-link>
        </div>
        <div class="feed-card-sub">
          <span>{{ getDateTimeInfo(props.item.createdAt) }}</span>
          <span v-if="props.item.location">· {{ props.item.location }}</span>
        </div>
      </div>
      <div v-if=" props.ynDel && props.item.writerUserId === authenticationStore.state.signedUser.userId" class="feed-card-delete">
        <button type="button" class="feed-card-icon-button" @click="emit('onDeleteFeed')" aria-label="피드 삭제">
          <font-awesome-icon icon="fa fa-trash" class="pointer color-red" />
        </button>
      </div>
    </div>

    <swiper
      class="feed-card-swiper"
      :loop="true"
      navigation
      :modules="state.modules"
      :pagination="{ clickable: true, dynamicBullets: true }"
      :slides-per-view="1"
      :space-between="50">
      <swiper-slide
        v-for="(item, idx) in props.item.pics"
        :virtualIndex="idx"
        :key="idx">
        <img
          :src="`/pic/feed/${props.item.feedId}/${item}`"
          :alt="`이미지`"
          :aria-label="`이미지`"
          class="feed-card-image" />
      </swiper-slide>
    </swiper>
    <div class="feed-card-actions">
      <button type="button" class="feed-card-action-button" @click="toggleLike">
        <font-awesome-icon :icon="`${state.isLike ? 'fas' : 'far'} fa-heart`" class="pointer" :class="{ 'color-red': state.isLike }" />
        <span>{{ state.likeCount }}</span>
      </button>

      <button type="button" class="feed-card-action-button" @click="showCommentModel">
        <font-awesome-icon icon="fa-regular fa-comment" class="pointer" />
        <span>{{ props.item.commentCount }}</span>
      </button>
    </div>
    <div class="feed-card-body">
      <div class="feed-card-caption" v-if="props.item.contents">
        <span class="feed-card-caption-author">
          {{
            props.item.writerNickName
              ? props.item.writerNickName
              : props.item.writerUid
          }}
        </span>
        <span>{{ props.item.contents }}</span>
      </div>
      <div class="feed-card-sub feed-card-comment-summary">
        댓글 {{ props.item.commentCount }}개
      </div>
    </div>
  </article>
</template>

<style scoped>
.feed-card {
  width: 100%;
  margin-bottom: 20px;
  overflow: hidden;
  border: 1px solid var(--gg-border);
  border-radius: var(--gg-radius-md);
  background: var(--gg-surface);
  box-shadow: 0 4px 14px rgba(43, 36, 48, 0.04);
}

.feed-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
}

.feed-card-profile {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.feed-card-meta {
  min-width: 0;
  flex: 1;
}

.feed-card-author-row {
  display: flex;
  align-items: center;
}

.feed-card-author {
  font-size: 14px;
  font-weight: 600;
  color: var(--gg-text);
}

.feed-card-sub {
  font-size: 13px;
  color: var(--gg-text-sub);
}

.feed-card-delete {
  margin-left: auto;
}

.feed-card-icon-button,
.feed-card-action-button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.feed-card-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.feed-card-icon-button:hover {
  background: var(--gg-soft-pink);
}

.feed-card-swiper {
  width: 100%;
  background: var(--gg-surface);
}

.feed-card-image {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.feed-card-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
}

.feed-card-action-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 14px;
  color: var(--gg-text);
}

.feed-card-action-button:hover {
  background: var(--gg-soft-purple);
}

.feed-card-body {
  padding: 0 14px 12px;
}

.feed-card-caption {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--gg-text);
}

.feed-card-caption-author {
  font-weight: 600;
}

.feed-card-comment-summary {
  margin-top: 6px;
}

:deep(.feed-card-swiper .swiper-button-prev),
:deep(.feed-card-swiper .swiper-button-next) {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.86);
  color: var(--gg-text);
}

:deep(.feed-card-swiper .swiper-button-prev::after),
:deep(.feed-card-swiper .swiper-button-next::after) {
  font-size: 13px;
  font-weight: 700;
}

:deep(.feed-card-swiper .swiper-pagination-bullet) {
  background: rgba(142, 122, 146, 0.35);
  opacity: 1;
}

:deep(.feed-card-swiper .swiper-pagination-bullet-active) {
  background: var(--gg-accent);
}

@media (max-width: 768px) {
  .feed-card {
    border-radius: 12px;
  }
}
</style>
