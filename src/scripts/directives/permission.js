import {useUserStore} from "@/store/modules/userStore";

const permission = {
    mounted(el, binding) {
        if (binding.value) {
            const permissionList = useUserStore().getAuths
            if (!$xe.isEmpty(permissionList) && !permissionList.includes(binding.value)) {
                el.remove()
            }
        }
    }
}

export default permission