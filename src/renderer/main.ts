import { createApp } from 'vue'
import App from './App.vue'
import {useElectron} from "./use/electron";

const {globalConfig} = useElectron()

console.log('获取store: ', globalConfig.get('a'))

createApp(App).mount('#app')
