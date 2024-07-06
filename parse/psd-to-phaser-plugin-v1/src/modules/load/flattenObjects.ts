export function flattenObjects(objects: any[], prefix = ''): any[] {
    return objects.reduce((acc, obj) => {
        const path = prefix ? `${prefix}/${obj.name}` : obj.name;
        if (obj.lazyLoad) {
            // Handle lazy loading if needed
        } else if (!obj.children || obj.children.length === 0) {
            acc.push({ path, obj });
        }
        if (obj.children) {
            acc.push(...flattenObjects(obj.children, path));
        }
        return acc;
    }, []);
}