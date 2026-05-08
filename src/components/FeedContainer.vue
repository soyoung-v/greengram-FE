<script setup>
import loadingImg from '@/assets/loading.gif';
import FeedCard from '@/components/FeedCard.vue';
import { reactive, onMounted, onUnmounted, watch } from 'vue';
import { useFeedStore } from '@/stores/feed';
import { bindEvent, throttle } from '@/utils/commonUtils';
import { getFeedList, deleteFeed } from '@/services/feedService';

const feedStore = useFeedStore();

const props = defineProps({
    ynDel: Boolean
});

const state = reactive({
    isLoading: false,
    isFinish: false
});

const throttledScroll = throttle(() => { bindEvent(state, window, getData); }, 250);

onMounted(() => {    
    window.addEventListener('scroll', throttledScroll);    
});

onUnmounted(() => {
    window.removeEventListener('scroll', throttledScroll);
    feedStore.init();
});

const getData = async () => {
    if (state.isLoading || state.isFinish) {
        return;
    }

    state.isLoading = true;
    const params = {
        page: feedStore.page,
        size: feedStore.rowPerPage        
    }
    if(feedStore.profileUserId) {
        params.profile_user_id = feedStore.profileUserId
    }
    
    try {
        const res = await getFeedList(params);
        if(res.status === 200) {
            feedStore.setPage(feedStore.page + 1);
            const result = res.data.resultData;
            if(result && result.length > 0) {
                feedStore.addFeedList(result);                        
            }
            if(result.length < feedStore.rowPerPage) {
                state.isFinish = true
            }        
        }
    } finally {
        state.isLoading = false;
    }
};


//피드 삭제
const doDeleteFeed = async (feedId, idx) => {
    if(!confirm('삭제하시겠습니까?')) { return; }
    
    const params = { feed_id: feedId };

    const res = await deleteFeed(params);
    if(res.status === 200) {
        feedStore.deleteFeedByIdx(idx);
    }
};

watch(() => feedStore.reLoading, newVal => {
    if(newVal === true) {        
        state.isFinish = false;
        getData();
        feedStore.setReLoading(false);
    }
});
</script>

<template>
    <div class="feed-list">
        <template v-if="feedStore.feedList.length > 0">
            <feed-card
                v-for="(item, idx) in feedStore.feedList"
                :key="item.feedId"
                :item="item"
                :yn-del="props.ynDel"
                @on-delete-feed="doDeleteFeed(item.feedId, idx)" />
        </template>
        <div v-else-if="!state.isLoading && state.isFinish" class="feed-empty">
            아직 등록된 피드가 없습니다.
        </div>
        <div v-if="state.isLoading" class="loading feed-loading"><img :src="loadingImg"/></div>
    </div>
</template>

<style scoped>
</style>
