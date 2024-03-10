import {useUserStore} from "@/store/modules/userStore";
import { isEmpty } from 'lodash-es'

const permission = {
    mounted(el, binding) {
        if (binding.value) {
            const permissionList = useUserStore().getAuths
            if (!isEmpty(permissionList) && !permissionList.includes(binding.value) && import.meta.env.MODE != 'demo') {
                el.remove()
            }
        }
    }
}

export default permission
