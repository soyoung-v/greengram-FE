<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { signUp } from '@/services/userService';
import { checkValidation } from '@/utils/validation';

const fileInput = ref(null);
const imageUrl = ref(null);

const router = useRouter();

const state = reactive({
    data: {
        nm: '',
        uid: '',
        upw: ''              
    },
    chkUpw: '',
    pic: null
});

const openFileSelector = () => {
    fileInput.value.click();
};

const handlePicChanged = e => {
    imageUrl.value = null;
    state.pic = e.target.files[0];
    if (state.pic) {
        const reader = new FileReader();
        reader.onload = (e) => {
        imageUrl.value = e.target.result; // Data URL로 변환하여 저장
        };
        reader.readAsDataURL(state.pic);
    }
};

const submit = async () => {
    //유효성 체크
    if (checkValidation()) { return; }

    //비밀번호, 확인 비밀번호 체크
    if (state.chkUpw !== state.data.upw) {
        alert( '비밀번호와 확인 비밀번호가 일치하지 않습니다.' );
        return;
    }


    const formData = new FormData();
    formData.append( 'req', new Blob([JSON.stringify(state.data)], { type: 'application/json' }) );
    if (state.pic) {
        formData.append( 'pic', state.pic );
    }

    const res = await signUp(formData);
    if (res) {
        alert('회원가입을 축하합니다.');
        await router.push('/sign-in');
    }
};
</script>

<template>
    <section class="auth-page">
        <div class="auth-card">
            <div class="auth-header">
                <h1 class="auth-title">Greengram</h1>
                <p class="auth-description">간단한 정보로 회원가입하고 피드를 공유해보세요.</p>
            </div>
            <form class="auth-form" @submit.prevent="submit">
                <div class="auth-field">
                    <label class="auth-label" for="uid">아이디</label>
                    <input
                        type="text"
                        class="auth-input valid"
                        id="uid"
                        placeholder="아이디"
                        v-model="state.data.uid"
                        not-null-message="아이디는 필수로 입력하셔야 합니다."
                        regexp="^[A-Za-z0-9_]{4,50}$"
                        regexp-message="아이디는 영어, 숫자, 언더바로만 구성되어야 하며 4~50자까지 작성할 수 있습니다." />
                </div>

                <div class="auth-field">
                    <label class="auth-label" for="upw">비밀번호</label>
                    <input
                        type="password"
                        class="auth-input valid"
                        id="upw"
                        placeholder="비밀번호"
                        v-model="state.data.upw"
                        not-null-message="비밀번호는 필수로 입력하셔야 합니다."
                        regexp="^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?])[A-Za-z\d!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?]{10,}$"
                        regexp-message="비밀번호는 영문자, 숫자, 특수기호로 구성되며 10자 이상이어야 합니다."
                        autocomplete="off" />
                </div>

                <div class="auth-field">
                    <label class="auth-label" for="chkUpw">비밀번호 확인</label>
                    <input
                        type="password"
                        class="auth-input"
                        id="chkUpw"
                        placeholder="비밀번호 확인"
                        v-model="state.chkUpw"
                        autocomplete="off" />
                </div>

                <div class="auth-field">
                    <label class="auth-label" for="nickName">닉네임</label>
                    <input
                        type="text"
                        class="auth-input valid"
                        id="nickName"
                        placeholder="닉네임"
                        v-model="state.data.nm"
                        not-null-message="닉네임은 필수로 입력하셔야 합니다."
                        regexp="^[가-힣]{2,10}$"
                        regexp-message="닉네임은 한글로 2~10자까지 가능합니다." />
                </div>

                <div class="auth-field">
                    <button type="button" class="auth-file-button" @click="openFileSelector">프로필 사진 선택</button>
                    <input
                        ref="fileInput"
                        hidden
                        id="pic"
                        type="file"
                        accept="image/*"
                        @change="handlePicChanged" />
                    <span class="auth-file-name" v-if="state.pic">{{ state.pic.name }}</span>
                </div>

                <img v-if="imageUrl" :src="imageUrl" alt="Selected" class="auth-preview" />

                <button class="auth-primary-button">회원가입</button>
            </form>

            <div class="auth-footer">
                <router-link to="/sign-in" class="auth-link">로그인으로 돌아가기</router-link>
            </div>
        </div>
    </section>
</template>

<style scoped>
</style>
