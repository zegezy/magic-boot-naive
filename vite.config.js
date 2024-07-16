import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteSvgIcons from 'vite-plugin-svg-icons'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
    base: './',
    plugins: [
        vue(),
        viteSvgIcons({
            iconDirs: [path.resolve(process.cwd(), 'src/icons')],
            symbolId: 'mb-icon-[name]'
        }),
        viteCompression({
            filter: /.(js|css|html|json|mjs|png|jpg|jpeg|svg)$/i  // 这些文件都要压缩
        })
    ],
    server: {
        host: '0.0.0.0'
    },
    resolve: {
        extensions: ['.vue', '.json', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    define: {
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    }
})
