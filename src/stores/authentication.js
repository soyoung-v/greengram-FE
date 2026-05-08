import { reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import router from '@/router'

export const useAuthenticationStore = defineStore(
    "authentication", 
    () => {
        const state = reactive({            
            signedUser: {
                userId: 0,
                nickName: '',
                pic: null
            },            
            isSigned: false
        });

        const setSignedUser = signedUser => {
            state.isSigned = true;
            const user = {
                userId: signedUser.signedUserId,
                nickName: signedUser.nm,
                pic: signedUser.pic
            }

            state.signedUser = user;
        }

        const setSigndUserPic = pic => {
            state.signedUser.pic = pic;
        }

        const signOut = async () => {
            state.isSigned = false;
            state.signedUser = {
                userId: 0,
                nickName: '',
                pic: null
            };
            await router.push('/sign-in')
        }

        return { state, setSignedUser, setSigndUserPic, signOut };
    }, 
    { persist: true }
);
