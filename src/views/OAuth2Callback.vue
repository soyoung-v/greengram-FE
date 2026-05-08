<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthenticationStore } from '@/stores/authentication'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthenticationStore()

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/user/me', {
      withCredentials: true
    })

    // resultData에 실제 정보가 들어있음
    authStore.setSignedUser(res.data.resultData)

    router.replace('/')
  } catch {
    router.replace('/sign-in')
  }
})
</script>

<template>
  <div>소셜 로그인 처리중...</div>
</template>
