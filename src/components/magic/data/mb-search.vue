<template>
    <n-form :size="$global.uiSize.value"  inline label-placement="left" @keyup.enter="search" style="flex-wrap:wrap">
        <template v-for="(it, i) in where">
            <n-form-item v-if="formItemIf(it)" :label="it.label" :key="i" :show-feedback="false">
                <component
                    :is="!it.component ? 'mb-input' : it.component.startsWith('n-') || 'mb-' + it.component"
                    v-model="it.value"
                    :item-label="it.label"
                    v-bind="it.componentProps || it.props"
                />
            </n-form-item>
        </template>
        <n-form-item :show-feedback="false">
            <n-space>
                <n-button :size="$global.uiSize.value"  type="primary" @click="search">
                    <mb-icon icon="Search" />
                    搜索
                </n-button>
                <n-button :size="$global.uiSize.value"  @click="reset">
                    <mb-icon icon="TrashOutline" />
                    清空
                </n-button>
                <slot name="buttons"/>
            </n-space>
        </n-form-item>
    </n-form>
</template>

<script setup>
import {nextTick, watch} from 'vue'

const props = defineProps({
	where: {
		type: Object,
		default: () => {
		}
	},
	notReset: {
		type: String,
		default: ''
	}
})

function formItemIf(it){
    if(it && it instanceof Object){
        it.show = it.show === undefined ? !!it.label : it.show
        return it.show
    }
    return false
}

function reRenderComponent(key){
    props.where[key].show = false
    nextTick(() => {
        props.where[key].show = true
    })
}

for (let key in props.where) {
	if (props.where[key] instanceof Object) {
		if (props.where[key].value === undefined) {
			props.where[key].value = null
		}
        watch(() => props.where[key].value, (value) => {
            props.where[key].valueChange && props.where[key].valueChange({value, reRenderComponent, where: props.where})
        })
		if (props.where[key].component === 'date') {
			let isResetValue = false
			for (let k in props.where[key]) {
				if (k === 'resetValue') {
					isResetValue = true
				}
			}
			if (!isResetValue) {
				// date 组件 要reset为 null 
				props.where[key].resetValue = null
			}
		}
	}
}

const emit = defineEmits(['search'])

function input(input) {
	if (input) {
		emit('search')
	}
}

function search() {
	for (let key in props.where) {
		if (props.where[key] instanceof Object) {
			if (props.where[key].component && props.where[key].component.startsWith('date') && props.where[key].value instanceof Array && props.where[key].value.join(',')) {
				props.where[key].value = props.where[key].value.join(',')
			}
		}
	}
	nextTick(() => {
		emit('search')
	})
}

function reset() {
	for (let key in props.where) {
		if (props.notReset.indexOf(key) === -1) {
			if (props.where[key] instanceof Object) {
				let isResetValue = false
				for (let k in props.where[key]) {
					if (k === 'resetValue') {
						isResetValue = true
					}
				}
				if (isResetValue) {
					props.where[key].value = props.where[key].resetValue
				} else {
					if (props.where[key].value instanceof Array) {
						props.where[key].value = []
					} else {
						props.where[key].value = null
					}
				}
			} else {
				if (props.where[key] instanceof Array) {
					props.where[key] = []
				} else {
					props.where[key] = null
				}
			}
		}
	}
	nextTick(() => emit('search'))
}

defineExpose({ reRenderComponent })

</script>
