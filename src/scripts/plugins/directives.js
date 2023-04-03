import permission from '@/scripts/directives/permission'

export function setupDirectives(app) {
    app.directive('permission', permission)
}