<script setup>
import logo from '@/assets/logo.png';
import ProfileImg from './ProfileImg.vue';
import { useAuthenticationStore } from '@/stores/authentication';
import { reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { signOut } from '@/services/userService';
import { getKeywordList } from '@/services/feedService';
import { useFeedStore } from '@/stores/feed';

const route = useRoute();
const router = useRouter();
const authenticationStore = useAuthenticationStore();
const feedStore = useFeedStore();

const state = reactive({
    search: '',
    searchList: []
});

const doSignOut = async () => {    
    const res = await signOut();
    if(res.status === 200) {
        await authenticationStore.signOut();
    }
};

let debounceTimer = null;
const onTyping = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        getSearchKeyword();
    }, 400);
};

const getSearchKeyword = async () => {
    state.searchList = [];
    if(!state.search) { return; }

    const params = {
        keyword: state.search
    }
    const res = await getKeywordList(params);
    if(res.status === 200) {
        state.searchList = res.data.resultData ?? res.data.result ?? [];
    }
};

const getFeedData = async () => {
    const keyword = state.search.trim();
    feedStore.clearList();
    feedStore.setPage(1);
    feedStore.setReLoading(false);

    if (route.path !== '/') {
        await router.push('/');
    }

    feedStore.setKeyword(keyword);
    feedStore.setReLoading(true);
};

//메인 화면으로 이동
const moveToMain = () => {
    // 현재 주소가 '/'이면 아무 작업도 안 한다. 
    if(route.path === '/') { return; }
     // feedStore.init 초기화해주어야 메인화면에서 모든 사용자의 피드 리스트가 뜬다. 
    feedStore.init();  
    router.push('/');
};

watch(() => route.fullPath, () => {    
    state.search = '';    
    state.searchList = [];
});
</script>

<template>
<header class="header-shell" v-if="authenticationStore.state.isSigned">
    <div class="header-inner">
        <div class="header-brand">
            <button type="button" class="header-logo-button" @click="moveToMain" aria-label="홈으로 이동">
                <img :src="logo" class="h24 w24" alt="Greengram 로고" />
            </button>
        </div>
        <div class="header-search">
            <b-form-input
                list="search-list-id"
                class="header-search-input"
                @input="onTyping"
                @keyup.enter="getFeedData"
                v-model="state.search" />
                <datalist id="search-list-id">                    
                    <option v-for="item in state.searchList" :key="item">{{ item }}</option>
                </datalist>
            <button type="button" class="header-search-button" @click="getFeedData">Search</button>
        </div>
        <div class="header-actions">
            <nav class="header-nav">
                <div class="header-action-item">
                    <button
                        type="button"
                        class="header-icon-button"
                        id="newFeedModalBtn"
                        data-bs-toggle="modal"
                        data-bs-target="#newFeedModal"
                        aria-label="새 게시물 만들기">
                            <svg aria-label="새로운 게시물"  class="_8-yf5" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                                <path d="M2 12v3.45c0 2.849.698 4.005 1.606 4.944.94.909 2.098 1.608 4.946 1.608h6.896c2.848 0 4.006-.7 4.946-1.608C21.302 19.455 22 18.3 22 15.45V8.552c0-2.849-.698-4.006-1.606-4.945C19.454 2.7 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.547 2 5.703 2 8.552z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"  strokeWidth="2">
                                </path>
                                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"  strokeWidth="2" x1="6.545" x2="17.455" y1="12.001" y2="12.001">
                                </line>
                                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"  strokeWidth="2" x1="12.003" x2="12.003" y1="6.545" y2="17.455">
                                </line>
                            </svg>
                    </button>
                </div>
                <div class="header-action-item dropdown">
                    <button type="button" id="navDropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false" class="header-profile-button">
                        <profile-img :userId="authenticationStore.state.signedUser.userId" :pic="authenticationStore.state.signedUser.pic" :size="24" :clsValue="'pointer profile'" />
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navDropdownMenuLink">
                            <li>
                                <router-link :to="`/profile/${authenticationStore.state.signedUser.userId}`">
                                    <span class="dropdown-item">
                                        <span>
                                            <svg aria-label="프로필"  class="_8-yf5 " color="#262626" fill="#262626" height="16" role="img" viewBox="0 0 24 24" width="16">
                                                <circle cx="12.004" cy="12.004" fill="none" r="10.5" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10"  strokeWidth="2"></circle><path d="M18.793 20.014a6.08 6.08 0 00-1.778-2.447 3.991 3.991 0 00-2.386-.791H9.38a3.994 3.994 0 00-2.386.791 6.09 6.09 0 00-1.779 2.447" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2"></path><circle cx="12.006" cy="9.718" fill="none" r="4.109" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10"  strokeWidth="2">
                                                </circle>
                                            </svg>
                                        </span>&nbsp;
                                        <span>프로필</span>
                                    </span>
                                </router-link>
                            </li>          
                            <li><hr class="dropdown-divider"></hr></li>
                            <li><span class="dropdown-item pointer" @click="doSignOut">Sign out</span></li>
                    </ul>
                </div>
            </nav>
        </div>
    </div>
</header>
</template>

<style scoped>
.header-shell {
    position: sticky;
    top: 0;
    z-index: 50;
    height: var(--gg-header-height);
    background: var(--gg-surface);
    border-bottom: 1px solid var(--gg-border);
}

.header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    max-width: 960px;
    height: 100%;
    margin: 0 auto;
    padding: 0 16px;
}

.header-brand,
.header-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.header-search {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    max-width: 360px;
    margin: 0 auto;
}

.header-search-input {
    min-width: 0;
}

:deep(.header-search-input.form-control) {
    height: 36px;
    border: 1px solid var(--gg-border);
    border-radius: var(--gg-radius-md);
    background: var(--gg-surface);
    color: var(--gg-text);
    box-shadow: none;
}

:deep(.header-search-input.form-control:focus) {
    border-color: var(--gg-border);
    box-shadow: none;
}

.header-search-button,
.header-icon-button,
.header-profile-button,
.header-logo-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    background: transparent;
    color: var(--gg-text);
    transition: background-color 0.2s ease;
}

.header-search-button:hover,
.header-icon-button:hover,
.header-profile-button:hover,
.header-logo-button:hover {
    background: #f2f2f2;
}

.header-search-button {
    height: 36px;
    padding: 0 12px;
    border-radius: 8px;
    font-size: 14px;
    color: var(--gg-primary);
}

.header-logo-button,
.header-icon-button,
.header-profile-button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
}

.header-nav {
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-action-item {
    display: flex;
    align-items: center;
}

:deep(.dropdown-item:active) {
    background: var(--gg-soft-pink);
    color: var(--gg-text);
}

@media (max-width: 768px) {
    .header-inner {
        gap: 12px;
        padding: 0 12px;
    }

    .header-search {
        max-width: none;
    }

    .header-search-button {
        padding: 0 10px;
        color: var(--gg-secondary);
    }
}
</style>
