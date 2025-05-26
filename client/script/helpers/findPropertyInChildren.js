const defaultMap = {
    borderRadius: '0px',
    boxShadow: 'none',
};

const findPropertyInChildren = (element, property) => {
    if (!element) {
        return null;
    }

    const value = getComputedStyle(element)[property];
    const defaultValue = defaultMap[property] || null;

    if (value !== defaultValue) {
        return value;
    }

    if (element.childNodes.length > 1) {
        return null;
    }

    return findPropertyInChildren(element.firstChild, property);
};

export default findPropertyInChildren;
