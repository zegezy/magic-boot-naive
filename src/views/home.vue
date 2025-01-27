<template>
    <n-card>
        <div class="home-container">
            <div class="welcome-section">
                <h1>Magic Boot</h1>
                <p class="subtitle">基于 Vue3 的现代化后台管理系统，配套 MagicAPI 的最佳实践方案</p>
                <div class="version-badge">
                    <n-tag type="success" size="small">Version 1.0.0</n-tag>
                </div>
            </div>

            <div class="feature-section">
                <h2>核心特性</h2>
                <n-grid cols="4" responsive="screen" :x-gap="12" :y-gap="8">
                    <n-grid-item>
                        <n-card class="feature-card">
                            <template #header>
                                <div class="feature-header">
                                    <mb-icon icon="component" class="feature-icon" />
                                    <span>在线开发</span>
                                </div>
                            </template>
                            <p>基于 SFC 组件</p>
                            <p>浏览器中编写前端代码</p>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card class="feature-card">
                            <template #header>
                                <div class="feature-header">
                                    <mb-icon icon="interface" class="feature-icon" />
                                    <span>无缝集成</span>
                                </div>
                            </template>
                            <p>完美配合 MagicAPI</p>
                            <p>快速构建完整应用</p>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card class="feature-card">
                            <template #header>
                                <div class="feature-header">
                                    <mb-icon icon="settings" class="feature-icon" />
                                    <span>组件封装</span>
                                </div>
                            </template>
                            <p>丰富的业务组件</p>
                            <p>灵活的扩展机制</p>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card class="feature-card">
                            <template #header>
                                <div class="feature-header">
                                    <mb-icon icon="database" class="feature-icon" />
                                    <span>开箱即用</span>
                                </div>
                            </template>
                            <p>内置权限管理</p>
                            <p>完整的CRUD示例</p>
                        </n-card>
                    </n-grid-item>
                </n-grid>
            </div>

            <div class="quick-start">
                <h2>快速开始</h2>
                <n-card>
                    <n-steps :current="1" vertical>
                        <n-step 
                            title="环境准备" 
                            description="确保已安装并启动 MagicAPI 服务" 
                        />
                        <n-step 
                            title="获取项目" 
                            description="访问 MagicBoot 官网下载最新版本" 
                        />
                        <n-step 
                            title="开始开发" 
                            description="使用浏览器在线编写前端代码" 
                        />
                        <n-step 
                            title="部署上线" 
                            description="一键打包，轻松部署" 
                        />
                    </n-steps>
                </n-card>
            </div>

            <div class="links-section">
                <h2>相关资源</h2>
                <n-space>
                    <n-button 
                        type="primary" 
                        ghost
                        tag="a"
                        href="http://www.magicboot.net"
                        target="_blank"
                    >
                        <template #icon>
                            <mb-icon icon="component" />
                        </template>
                        官方文档
                    </n-button>
                    <n-button 
                        type="info" 
                        ghost
                        tag="a"
                        href="https://www.ssssssss.org"
                        target="_blank"
                    >
                        <template #icon>
                            <mb-icon icon="interface" />
                        </template>
                        MagicAPI
                    </n-button>
                    <n-button 
                        type="warning" 
                        ghost
                        tag="a"
                        href="http://www.magicboot.net/example"
                        target="_blank"
                    >
                        <template #icon>
                            <mb-icon icon="examples" />
                        </template>
                        在线示例
                    </n-button>
                </n-space>
            </div>
        </div>
    </n-card>
</template>

<script setup>
import { NCard, NGrid, NGridItem, NSpace, NButton, NTag, NSteps, NStep } from 'naive-ui'
</script>

<style scoped lang="less">
.home-container {
    padding: 20px;
    
    .welcome-section {
        text-align: center;
        margin-bottom: 40px;
        
        h1 {
            font-size: 36px;
            color: var(--primary-color);
            margin: 0;
        }
        
        .subtitle {
            font-size: 16px;
            color: #666;
            margin: 12px 0;
        }
        
        .version-badge {
            margin-top: 8px;
        }
    }
    
    h2 {
        font-size: 24px;
        color: #333;
        margin: 30px 0 20px;
    }
    
    .feature-section {
        margin-bottom: 40px;
        
        .feature-card {
            height: 100%;
            transition: all 0.3s ease;
            
            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .feature-header {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 16px;
                font-weight: 500;
                
                .feature-icon {
                    font-size: 20px;
                    color: var(--primary-color);
                }
            }
            
            p {
                margin: 8px 0;
                color: #666;
            }
        }
    }
    
    .quick-start {
        margin-bottom: 40px;
    }
    
    .links-section {
        text-align: center;
        
        .n-button {
            min-width: 120px;
        }
    }
}
</style>
