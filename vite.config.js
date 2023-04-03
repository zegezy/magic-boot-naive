import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteSvgIcons from 'vite-plugin-svg-icons'

export default defineConfig({
    base: './',
    plugins: [
        vue(),
        viteSvgIcons({
            iconDirs: [path.resolve(process.cwd(), 'src/icons')],
            symbolId: 'mb-icon-[name]'
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
    }
})
