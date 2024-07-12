export function flattenObjects(objects: any[], prefix = '', parentLazyLoad = false): any[] {
    return objects.reduce((acc, obj) => {
        const path = prefix ? `${prefix}/${obj.name}` : obj.name;
        const isLazyLoaded = parentLazyLoad || obj.lazyLoad === true;

        if (!isLazyLoaded && (!obj.children || obj.children.length === 0)) {
            acc.push({ path, obj });
        }
        if (obj.children) {
            acc.push(...flattenObjects(obj.children, path, isLazyLoaded));
        }
        return acc;
    }, []);
}