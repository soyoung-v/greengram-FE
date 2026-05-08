<script setup>
import ProfileImg from './ProfileImg.vue';
import { useAuthenticationStore } from '@/stores/authentication';
import { useCommentModalStore } from '@/stores/commentModal';
import { getDateTimeInfo } from '@/utils/commonUtils';

const authenticationStore = useAuthenticationStore();
const commentModalStore = useCommentModalStore();

const props = defineProps({
  item: Object
});
</script>

<template>
  <div class="comment-card-wrapper">
    <div class="gg-comment-card">
      <div class="gg-comment-avatar">
        <router-link :to="`/profile/${props.item.writerUserId}`">
          <profile-img
            :clsValue="'profile pointer'"
            :size="24"
            :pic="props.item.writerPic"
            :userId="props.item.writerUserId" />
        </router-link>      
      </div>
      <div class="gg-comment-main">
        <div class="gg-comment-top">
          <router-link :to="`/profile/${props.item.writerUserId}`">
            <div class="pointer gg-comment-author">
              {{
                props.item.writerNickName
                  ? props.item.writerNickName
                  : props.item.writerUid
              }}
            </div>
          </router-link>
          <div class="gg-comment-date">{{ getDateTimeInfo(props.item.createdAt) }}</div>
          <button
            v-if="authenticationStore.state.signedUser.userId === props.item.writerUserId"
            type="button"
            class="gg-comment-delete"
            @click="commentModalStore.doDeleteComment(props.item)">
            삭제
          </button>
        </div>
        <div class="gg-comment-text">{{ props.item.comment }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gg-comment-card {
  display: flex;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--gg-border);
}

.gg-comment-avatar {
  display: flex;
  flex-shrink: 0;
  padding-top: 2px;
}

.gg-comment-main {
  flex: 1;
  min-width: 0;
}

.gg-comment-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.gg-comment-author {
  font-size: 14px;
  font-weight: 600;
  color: var(--gg-text);
}

.gg-comment-date {
  font-size: 12px;
  color: var(--gg-text-sub);
}

.gg-comment-delete {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: var(--gg-like);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.gg-comment-text {
  margin-top: 6px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--gg-text);
  word-break: break-word;
}

.comment-card-wrapper:last-child .gg-comment-card {
  border-bottom: 0;
}
</style>
