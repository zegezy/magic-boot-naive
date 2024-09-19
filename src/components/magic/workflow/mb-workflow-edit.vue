<!--
    流程图拖拽绘制组件
    @author Yean (clarence@lightwing.net)
-->
<template>
    <div class="container-box">
        <div ref="canvas" class="canvas"></div>
        <div ref="properties" class="properties"></div>
    </div>

</template>

<script setup>
import {onMounted, ref} from "vue";
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';

import 'bpmn-js/dist/assets/bpmn-js.css';
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import '@bpmn-io/properties-panel/assets/properties-panel.css'

import customTranslate from '@/scripts/bpmn-js/i18n/customTranslate'


const canvas = ref();
const properties = ref();

const props = defineProps({
    /**
     * Camunda 流程定义ID
     */
    processDefinitionId: {
        type: String,
        default: ''
    },
})


onMounted(()=>{

    const modeler = new BpmnModeler({
        container: canvas.value,
        //属性面板
        propertiesPanel: {
            parent: properties.value,
        },
        additionalModules: [
            BpmnPropertiesPanelModule,
            BpmnPropertiesProviderModule,
            {
                translate: ['value',customTranslate]
            }
        ],
    });

    modeler.createDiagram();
})
</script>

<style scoped>
.container-box {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
}

.canvas{
    height:100%;
    flex:1;
}

.properties{
    width:20%;
    height:100%;
}
</style>