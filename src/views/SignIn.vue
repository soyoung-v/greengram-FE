<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { signIn } from '@/services/userService';
import { useAuthenticationStore } from '@/stores/authentication';
import { checkValidation } from '@/utils/validation';

const router = useRouter();

const authentication = useAuthenticationStore();

const state = reactive({
    form: {
        uid: '',
        upw: '',
    },
});

const submit = async () => {
  //유효성 체크
    if (checkValidation()) { return; }

    const res = await signIn(state.form);
    if (res.status === 200) {
        const signedUser = res.data.resultData;
        authentication.setSignedUser(signedUser);
        await router.push('/');
    }
};

// 소셜 로그인 (백엔드 OAuth2 엔드포인트로 리다이렉트)
function socialLogin(provider) {
  window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`
}

</script>

<template>
<section class="auth-page">
    <div class="auth-card">
        <div class="auth-header">
            <h1 class="auth-title">Greengram</h1>
            <p class="auth-description">감성적인 이미지 기록을 시작해보세요.</p>
        </div>
        <form class="auth-form" @submit.prevent="submit">
            <div class="auth-field">
                <label class="auth-label" for="uid">아이디</label>
                <input
                    type="text"
                    class="auth-input valid"
                    id="uid"
                    placeholder="아이디"
                    v-model="state.form.uid"
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
                    v-model="state.form.upw"
                    autocomplete="off"
                    not-null-message="비밀번호는 필수로 입력하셔야 합니다."
                    regexp="^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?])[A-Za-z\d!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?]{10,}$"
                    regexp-message="비밀번호는 영문자, 숫자, 특수기호로 구성되며 10자 이상이어야 합니다." />
            </div>

            <button class="auth-primary-button">로그인</button>

            <div class="auth-social-buttons">
                <button type="button" @click="socialLogin('google')" class="auth-social-button">
                  Google 로그인
                </button>
                <button type="button" @click="socialLogin('kakao')" class="auth-social-button">
                  Kakao 로그인
                </button>
                <button type="button" @click="socialLogin('naver')" class="auth-social-button">
                  Naver 로그인
                </button>
            </div>
        </form>

        <div class="auth-footer">
            <router-link to="/sign-up" class="auth-link">회원가입</router-link>
        </div>
    </div>
</section>
</template>

<style scoped>
</style>
