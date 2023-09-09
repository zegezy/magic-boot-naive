import {useUserStore} from "@/store/modules/userStore";
import { isEmpty } from 'lodash-es'

const permission = {
    mounted(el, binding) {
        if (binding.value) {
            const permissionList = useUserStore().getAuths
            if (!isEmpty(permissionList) && !permissionList.includes(binding.value)) {
                el.remove()
            }
        }
    }
}

export default permission
