<script setup>
import ProfileImg from '@/components/ProfileImg.vue';
import FeedContainer from '@/components/FeedContainer.vue';
import { ref, reactive, onMounted } from 'vue';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
import { useFeedStore } from '@/stores/feed';
import { useAuthenticationStore } from '@/stores/authentication';
import {
    getUserProfile,
    patchUserProfilePic,
    deleteUserProfilePic,
} from '@/services/userService';
import { postUserFollow, deleteUserFollow } from '@/services/followService';

const feedStore = useFeedStore();
const fileInput = ref(null);
const authenticationStore = useAuthenticationStore();
const route = useRoute(); //PathVariable 데이터 가져오기 위한 용도

const state = reactive({
    isMyProfile: false,
    isLoading: false,
    isFinish: false,
    userProfile: null,
});

const init = (userId) => {
    const signedUserId = String(authenticationStore.state.signedUser.userId);
    const profileUserId = String(userId);

    state.isFinish = false;
    state.userProfile = {
        userId,
        uid: '',
        pic: '',
        nickName: '',
        createdAt: '',
        feedCount: 0,
        allFeedLikeCount: 0,
        followerCount: 0,
        followingCount: 0,
        followState: 0,
    };
    state.isMyProfile = profileUserId === signedUserId;
};

init(route.params.userId);

/*
팔로우 상태
0: 서로 팔로우 안 한 상태
1: 나만 상대방을 팔로우 한 상태
2: 상대방만 나를 팔로우 한 상태
3: 서로 팔로우 한 상태
*/
const getFollowStateText = (followState) => {
    switch (followState) {
        case 0: 
            return '팔로우';
        case 1: 
        case 3:
            return '팔로우 취소';
        case 2:
            return '맞팔로우';
    }
};

const getUserData = async () => {
    const params = {
        profile_user_id: state.userProfile.userId,
    };
    const res = await getUserProfile(params);

    if (res.status === 200) {
        const result = res.data.resultData;
        state.userProfile = result;
    }
};

const removeUserPic = async () => {
    const res = await deleteUserProfilePic();
    if (res.status === 200) {
        state.userProfile.pic = null;
        authenticationStore.setSigndUserPic(null);
    }
};

const onClickProfileImg = () => {
    if (state.isMyProfile) {
        fileInput.value.click();
    }
};

const handlePicChanged = async (e) => {
    if (!e.target.files[0]) {
        return;
    }

    const formData = new FormData();
    formData.append('pic', e.target.files[0]);

    const res = await patchUserProfilePic(formData);
    if (res.status === 200) {
        const changedPic = res.data.resultData;
        state.userProfile.pic = changedPic;

        authenticationStore.setSigndUserPic(changedPic);
    }
};

//팔로우 버튼 클릭시
const onClickFollow = async () => {
    switch (state.userProfile.followState) {
        case 0:
        case 2: //post
            const postRes = await postUserFollow({ toUserId: state.userProfile.userId });
            if (postRes.status === 200) {
                state.userProfile.followState += 1;
                state.userProfile.followerCount += 1;
            }
            break;
        default: //delete
            const deleteRes = await deleteUserFollow({
                to_user_id: state.userProfile.userId,
            });
            if (deleteRes.status === 200) {
                state.userProfile.followState -= 1;
                state.userProfile.followerCount -= 1;
            }
            break;
    }
};

const getData = (userId) => {
    getUserData();    
    feedStore.init();
    feedStore.setProfileUserId(userId);
    feedStore.setReLoading(true);
};

onMounted(() => {    
    getData(route.params.userId);
});

onBeforeRouteUpdate((to, from) => {
    const toUserId = to.params.userId;
    if (toUserId !== state.userProfile.userId) {
        init(toUserId);
        getData(toUserId);
    }
});
</script>

<template>
    <section class="profile-page">
        <div class="profile-container">
            <div class="profile-header-card">
                <div class="profile-avatar-column">
                    <div class="profile-avatar-wrap" @click="onClickProfileImg">
                        <profile-img
                            :clsValue="`profile-profile-img ${state.isMyProfile ? 'pointer' : ''}`"
                            :size="120"
                            :pic="state.userProfile.pic"
                            :userId="state.userProfile.userId" />
                    </div>
                    <div class="profile-avatar-actions" v-if="state.isMyProfile">
                        <button type="button" class="profile-secondary-button" @click="onClickProfileImg">
                            프로필 사진 변경
                        </button>
                        <button
                            v-if="state.userProfile.pic"
                            type="button"
                            class="profile-text-button color-red"
                            @click="removeUserPic">
                            사진 제거
                        </button>
                    </div>
                    <input hidden type="file" accept="image/*" ref="fileInput" @change="handlePicChanged" />
                </div>

                <div class="profile-info-column">
                    <div class="profile-user-top">
                        <div>
                            <h1 class="profile-name">
                                {{
                                    state.userProfile.nickName
                                        ? state.userProfile.nickName
                                        : state.userProfile.uid
                                }}
                            </h1>
                            <p class="profile-handle">@{{ state.userProfile.uid }}</p>
                        </div>

                        <button
                            v-if="!state.isMyProfile"
                            type="button"
                            class="profile-primary-button"
                            :value="getFollowStateText(state.userProfile.followState)"
                            @click="onClickFollow">
                            {{ getFollowStateText(state.userProfile.followState) }}
                        </button>
                    </div>

                    <div class="profile-stats">
                        <div class="profile-stat">
                            <strong>{{ state.userProfile.feedCount }}</strong>
                            <span>게시물</span>
                        </div>
                        <div class="profile-stat">
                            <strong>{{ state.userProfile.followerCount }}</strong>
                            <span>팔로워</span>
                        </div>
                        <div class="profile-stat">
                            <strong>{{ state.userProfile.followingCount }}</strong>
                            <span>팔로잉</span>
                        </div>
                        <div class="profile-stat">
                            <strong>{{ state.userProfile.allFeedLikeCount }}</strong>
                            <span>좋아요</span>
                        </div>
                    </div>

                    <div class="profile-meta">
                        <span>가입일</span>
                        <strong>{{ state.userProfile.createdAt }}</strong>
                    </div>
                </div>
            </div>

            <section class="profile-feed-section">
                <div class="profile-section-head">
                    <h2 class="profile-section-title">게시물</h2>
                </div>
                <div class="profile-feed-grid">
                    <FeedContainer :yn-del="state.isMyProfile" />
                </div>
            </section>
        </div>
    </section>
</template>

<style scoped>
.profile-page {
    display: flex;
    justify-content: center;
    padding: 32px 16px;
}

.profile-container {
    width: 100%;
    max-width: 960px;
}

.profile-header-card {
    display: flex;
    align-items: center;
    gap: 36px;
    padding: 28px 32px;
    border: 1px solid var(--gg-border);
    border-radius: var(--gg-radius-lg);
    background: var(--gg-surface);
    box-shadow: 0 10px 24px rgba(43, 36, 48, 0.04);
}

.profile-avatar-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
}

.profile-avatar-wrap {
    display: inline-flex;
}

.profile-avatar-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
}

.profile-info-column {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
}

.profile-user-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}

.profile-name {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--gg-text);
}

.profile-handle {
    margin: 6px 0 0;
    font-size: 14px;
    color: var(--gg-text-sub);
}

.profile-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
}

.profile-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.profile-stat strong {
    font-size: 18px;
    font-weight: 700;
    color: var(--gg-text);
}

.profile-stat span {
    font-size: 13px;
    color: var(--gg-text-sub);
}

.profile-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--gg-text-sub);
}

.profile-meta strong {
    color: var(--gg-text);
    font-weight: 600;
}

.profile-primary-button,
.profile-secondary-button,
.profile-text-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 38px;
    padding: 0 14px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.profile-primary-button {
    border: 0;
    background: var(--gg-primary);
    color: #fff;
}

.profile-primary-button:hover {
    background: var(--gg-primary-hover);
}

.profile-secondary-button {
    border: 1px solid var(--gg-border);
    background: var(--gg-surface);
    color: var(--gg-text);
}

.profile-secondary-button:hover,
.profile-text-button:hover {
    background: var(--gg-soft-pink);
}

.profile-text-button {
    border: 0;
    background: transparent;
}

.profile-feed-section {
    margin-top: 28px;
}

.profile-section-head {
    margin-bottom: 14px;
    padding-top: 18px;
    border-top: 1px solid var(--gg-border);
}

.profile-section-title {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: var(--gg-text);
}

.profile-feed-grid {
    width: 100%;
}

:deep(.profile-profile-img.circleimg) {
    border: 2px solid var(--gg-border);
}

:deep(.profile-feed-grid .feed-list) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    width: 100%;
    max-width: none;
    margin: 0;
}

:deep(.profile-feed-grid .feed-card) {
    position: relative;
    margin-bottom: 0;
    border-radius: 14px;
    box-shadow: none;
}

:deep(.profile-feed-grid .feed-card:hover) {
    opacity: 0.92;
}

:deep(.profile-feed-grid .feed-card-header),
:deep(.profile-feed-grid .feed-card-actions),
:deep(.profile-feed-grid .feed-card-body) {
    display: none;
}

:deep(.profile-feed-grid .feed-card-swiper) {
    height: 100%;
}

:deep(.profile-feed-grid .feed-card-image) {
    aspect-ratio: 1 / 1;
}

:deep(.profile-feed-grid .feed-card-swiper .swiper-button-prev),
:deep(.profile-feed-grid .feed-card-swiper .swiper-button-next),
:deep(.profile-feed-grid .feed-card-swiper .swiper-pagination) {
    display: none;
}

:deep(.profile-feed-grid .feed-empty) {
    grid-column: 1 / -1;
    padding: 56px 24px;
}

:deep(.profile-feed-grid .feed-loading) {
    grid-column: 1 / -1;
}

@media (max-width: 768px) {
    .profile-page {
        padding: 20px 12px;
    }

    .profile-header-card {
        flex-direction: column;
        gap: 24px;
        padding: 24px 20px;
        text-align: center;
    }

    .profile-info-column {
        align-items: center;
    }

    .profile-user-top {
        justify-content: center;
        flex-direction: column;
    }

    .profile-stats {
        width: 100%;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
        text-align: center;
    }

    .profile-meta {
        justify-content: center;
        flex-wrap: wrap;
    }

    .profile-avatar-actions {
        width: 100%;
        max-width: 220px;
    }

    :deep(.profile-profile-img.w120) {
        width: 96px;
    }

    :deep(.profile-profile-img.h120) {
        height: 96px;
    }

    :deep(.profile-feed-grid .feed-list) {
        gap: 4px;
    }
}
</style>
