<script setup>
import '@/assets/main.css';
import HeaderComponent from './components/HeaderComponent.vue';
import loadingImg from '@/assets/loading.gif';
import { ref, reactive, watch, nextTick } from 'vue';
import { useMessageModalStore } from './stores/messageModal';
import { useAuthenticationStore } from './stores/authentication';
import { useFeedStore } from './stores/feed';
import { postFeed } from './services/feedService';
import { useCommentModalStore } from './stores/commentModal';
import FeedCommentCard from './components/FeedCommentCard.vue';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';
import { getCurrentTimestamp } from './utils/commonUtils';

const modalCloseButton = ref(null);
const commentListContainer = ref(null);

const messageModalStore = useMessageModalStore();
const authenticationStore = useAuthenticationStore();
const feedStore = useFeedStore();
const commentModalStore = useCommentModalStore();

const state = reactive({
    feed: {
        location: '',
        contents: '',
        pics: []
    },
    previewPics: []
});

const handlePicChanged = e => {
    for(let i=0; i<e.target.files.length; i++) {
        const pic = e.target.files[i];
        state.feed.pics.push(pic);
        state.previewPics.push(URL.createObjectURL(pic));
    }    
}

const deletePreviewPic = idx => {
    state.feed.pics.splice(idx, 1);
    state.previewPics.splice(idx, 1);
}

const saveFeed = async () => {
    const MAX_PIC_COUNT = 10;
    //사진 있는지 확인    
    if(state.feed.pics.length === 0) { 
        alert('사진을 선택해 주세요.');
        return;
    } else if(state.feed.pics.length > MAX_PIC_COUNT) {
        alert(`사진은 ${MAX_PIC_COUNT}장까지 선택 가능합니다.`);
        return;
    }

    const params = {
        contents: state.feed.contents.length === 0 ? null : state.feed.contents,
        location: state.feed.location.length === 0 ? null : state.feed.location
    }

    const formData = new FormData();
    formData.append('req', new Blob([JSON.stringify(params)], { type: 'application/json' }));
    for(let i=0; i<state.feed.pics.length; i++) {
        formData.append('pic', state.feed.pics[i])
    }

    const res = await postFeed(formData);
    if(res.status === 200) {
        const result = res.data.resultData;

        const item = {
            ...params,
            feedId: result.feedId,
            pics: result.pics,
            writerUserId: authenticationStore.state.signedUser.userId,
            writerNickName: authenticationStore.state.signedUser.nickName,
            writerPic: authenticationStore.state.signedUser.pic,
            createdAt: getCurrentTimestamp(),
            isLike: 0,
            likeCount: 0,
            comments: {
                moreComment: false,
                commentList: []
            }  
        };

        feedStore.addFeedUnshift(item);
        initInputs();
        modalCloseButton.value.click(); //모달창 닫기
    }
}

const initInputs = () => {
    state.feed.contents = '';
    state.feed.location = '';
    state.feed.pics = [];
    state.previewPics = [];
}


//메인 스크롤 방지 > 풀기 toggle
watch(() => commentModalStore.state.showModal,(isShown) => {
    document.body.classList.toggle('no-scroll', isShown);
});

const { check: checkInfiniteScroll } = useInfiniteScroll(commentListContainer, () => {
    commentModalStore.doGetCommentList();
});

//댓글에서 스크롤이 내려간 상태에서 댓글을 쓰면 댓글 스크롤이 상단으로 이동
watch(() => commentModalStore.state.commentList, async (newList) => {
    // newList의 첫번째 항목이 방금 사용자가 작성한 댓글인지 확인 (isSelf 속성으로 확인)
    if (newList.length > 0 && newList[0].isSelf) {
        // Vue가 DOM을 새 댓글을 포함해 다시 그릴 때까지 기다림
        await nextTick();

        if (commentListContainer.value) {
            commentListContainer.value.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        // isSelf 플래그는 일회성으로만 사용하는 것이 좋으므로, 확인 후 제거하거나 false로 변경
        // 여기서는 unshift로 추가된 새 댓글이므로, 다음 DOM 업데이트 사이클에서 isSelf를 false로 바꿔 오동작을 방지
        await nextTick();
        newList[0].isSelf = false;
    }

    // 댓글 리스트 변경 후 (삭제 포함) 스크롤 상태를 다시 확인
    await nextTick();
    checkInfiniteScroll(); //댓글 삭제를 하면 다음 페이지 호출
}, { deep: true }); //deep: true는 리스트 item의 값 변경까지도 watch하겠다는 의미
</script>

<template>
    <header-component />    
    <router-view />
    
    <b-modal
        v-model="messageModalStore.state.isShow"
        ok-only
        ok-title="확인"
        modal-class="gg-modal gg-message-modal"
        content-class="gg-modal-content"
        body-class="gg-message-modal-body"
        footer-class="gg-modal-footer">
        <div class="gg-message-content">
            <p class="gg-message-text">{{ messageModalStore.state.message }}</p>
        </div>
    </b-modal>

    <b-modal v-model="commentModalStore.state.showModal" size="lg" 
            no-close-on-backdrop hide-footer 
            modal-class="gg-modal gg-comment-modal"
            content-class="gg-modal-content gg-comment-modal-content"
            body-class="gg-comment-modal-body"
            @close="commentModalStore.close">
        <div class="gg-comment-shell">
            <div class="gg-comment-header">
                <h5 class="gg-modal-title">댓글</h5>
            </div>
            <div ref="commentListContainer" class="comment-list gg-comment-list overflow-y-auto">
                <FeedCommentCard
                    v-for="item in commentModalStore.state.commentList"
                    :key="item.feedCommentId"
                    :item="item" />
                <div v-if="commentModalStore.state.isLoading" class="loading display-none gg-comment-loading">
                    <img :src="loadingImg" />
                </div>
            </div>
            <div class="gg-comment-input-wrap">
                <input
                    type="text"
                    name="commentValue"
                    class="flex-grow-1 gg-modal-input"
                    placeholder="댓글을 입력하세요..."
                    v-model="commentModalStore.state.comment"
                    @keyup.enter="commentModalStore.doPostComment" />

                <button class="gg-modal-primary-button gg-comment-submit" @click="commentModalStore.doPostComment">
                    등록
                </button>
            </div>
        </div>
        
    </b-modal>

    <div class="modal fade" id="newFeedModal" tabIndex="-1" aria-labelledby="newFeedModalLabel" aria-hidden="false">
        <div class="modal-dialog modal-dialog-centered modal-xl gg-feed-modal-dialog">
            <div class="modal-content gg-modal-content gg-feed-modal-content" id="newFeedModalContent">
                <div class="modal-header gg-modal-header">
                    <h5 class="modal-title gg-modal-title" id="newFeedModalLabel">새 게시물 만들기</h5>
                    <button type="button" class="btn-close gg-modal-close" data-bs-dismiss="modal" aria-label="Close" ref="modalCloseButton"></button>
                </div>
                <div class="modal-body gg-feed-modal-body" id="id-modal-body">
                    <div class="gg-modal-field">
                        <label class="gg-modal-label" for="feed-location">위치</label>
                        <input id="feed-location" class="gg-modal-input" type="text" name="location" placeholder="위치" v-model="state.feed.location"/>
                    </div>
                    <div class="gg-modal-field">
                        <label class="gg-modal-label" for="feed-contents">내용</label>
                        <textarea id="feed-contents" class="gg-modal-textarea" name="contents" placeholder="내용을 입력하세요" v-model="state.feed.contents"></textarea>
                    </div>
                    <div class="gg-modal-field">
                        <label class="gg-modal-label gg-upload-label">
                            <span class="gg-modal-border-button">이미지 선택</span>
                            <input class="gg-file-input" name="pics" type="file" multiple accept="image/*" @change="handlePicChanged" />
                        </label>
                    </div>
                    <div class="gg-preview-grid" :class="{ 'gg-preview-grid-empty': state.previewPics.length === 0 }">
                        <div class="preview-container" v-for="(item, idx) in state.previewPics" :key="idx">
                            <img class="preview-img" :src="item" />                            
                            <font-awesome-icon icon="fa fa-trash" class="pointer preview-img-delete" @click="deletePreviewPic(idx)" />
                        </div>
                        <div v-if="state.previewPics.length === 0" class="gg-preview-empty">
                            업로드한 이미지가 여기에 표시됩니다.
                        </div>
                    </div>
                    <div class="gg-feed-modal-actions">
                        <button class="gg-modal-primary-button" @click="saveFeed">등록</button>
                    </div>
                </div>
            </div>
        </div>                
    </div>


</template>

<style>
.gg-modal .modal-dialog,
.gg-feed-modal-dialog {
    width: calc(100% - 24px);
    max-width: 720px;
}

.gg-modal .modal-content,
.gg-feed-modal-content {
    border: 1px solid var(--gg-border);
    border-radius: var(--gg-radius-lg);
    background: var(--gg-surface);
    box-shadow: 0 14px 28px rgba(43, 36, 48, 0.08);
    overflow: hidden;
}

.gg-modal .modal-backdrop,
.modal-backdrop.show {
    background: rgba(43, 36, 48, 0.45);
}

.gg-modal .modal-header,
.gg-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px 0;
    border-bottom: 0;
}

.gg-modal .modal-footer,
.gg-modal-footer {
    border-top: 0;
    padding: 0 20px 20px;
}

.gg-modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--gg-text);
}

.gg-modal-close,
.gg-modal .btn-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border-radius: 50%;
    background-color: transparent;
    opacity: 1;
}

.gg-modal-close:hover,
.gg-modal .btn-close:hover {
    background-color: var(--gg-soft-pink);
}

.gg-modal-input,
.gg-modal-textarea {
    width: 100%;
    border: 1px solid var(--gg-border);
    border-radius: 10px;
    background: var(--gg-surface);
    color: var(--gg-text);
    font-size: 14px;
}

.gg-modal-input {
    height: 42px;
    padding: 0 12px;
}

.gg-modal-textarea {
    min-height: 112px;
    padding: 12px;
    resize: none;
}

.gg-modal-input:focus,
.gg-modal-textarea:focus {
    outline: none;
    border-color: var(--gg-primary);
    box-shadow: 0 0 0 3px rgba(217, 70, 239, 0.12);
}

.gg-modal-label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--gg-text);
}

.gg-modal-primary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 92px;
    height: 42px;
    padding: 0 16px;
    border: 0;
    border-radius: 10px;
    background: var(--gg-primary);
    color: #fff;
    font-size: 14px;
    font-weight: 600;
}

.gg-modal-primary-button:hover {
    background: var(--gg-primary-hover);
}

.gg-modal-border-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 0 16px;
    border: 1px solid var(--gg-border);
    border-radius: 10px;
    background: var(--gg-surface);
    color: var(--gg-text);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.gg-modal-border-button:hover {
    background: var(--gg-soft-pink);
}

.gg-message-modal-body {
    padding: 6px 20px 18px;
}

.gg-message-content {
    padding-top: 4px;
}

.gg-message-text {
    margin: 0;
    color: var(--gg-text);
    font-size: 15px;
    line-height: 1.6;
    white-space: pre-wrap;
}

.gg-comment-modal .modal-dialog {
    display: flex;
    align-items: center;
    min-height: calc(100% - 1rem);
}

.gg-comment-modal-content {
    max-height: min(78vh, 720px);
}

.gg-comment-modal-body {
    padding: 18px 20px 20px;
}

.gg-comment-shell {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
}

.gg-comment-header {
    padding-bottom: 4px;
    border-bottom: 1px solid var(--gg-border);
}

.comment-list.gg-comment-list {
    flex: 1;
    max-height: 48vh;
    padding-right: 4px;
}

.gg-comment-loading {
    min-height: 72px;
}

.gg-comment-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 16px;
    border-top: 1px solid var(--gg-border);
}

.gg-comment-submit {
    flex-shrink: 0;
}

.gg-feed-modal-content {
    max-height: min(84vh, 820px);
}

.gg-feed-modal-body {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 20px;
}

.gg-modal-field {
    display: flex;
    flex-direction: column;
}

.gg-upload-label {
    margin-bottom: 0;
}

.gg-file-input {
    display: none;
}

.gg-preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 12px;
    min-height: 134px;
    padding: 14px;
    border: 1px solid var(--gg-border);
    border-radius: 14px;
    background: var(--gg-surface);
}

.gg-preview-grid-empty {
    background: linear-gradient(180deg, var(--gg-soft-pink) 0%, var(--gg-soft-purple) 100%);
}

.gg-preview-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 104px;
    color: var(--gg-text-sub);
    font-size: 14px;
    text-align: center;
}

.preview-img {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 12px;
}

.gg-feed-modal-actions {
    display: flex;
    justify-content: flex-end;
}

@media (max-width: 768px) {
    .gg-modal .modal-dialog,
    .gg-feed-modal-dialog {
        width: calc(100% - 24px);
        margin: 12px auto;
    }

    .gg-comment-modal-content,
    .gg-feed-modal-content {
        max-height: calc(100vh - 24px);
    }

    .gg-comment-modal-body,
    .gg-feed-modal-body {
        padding: 18px 16px;
    }

    .gg-comment-input-wrap {
        flex-direction: column;
        align-items: stretch;
    }

    .gg-comment-submit,
    .gg-feed-modal-actions .gg-modal-primary-button {
        width: 100%;
    }

    .gg-feed-modal-actions {
        justify-content: stretch;
    }

    .gg-preview-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
