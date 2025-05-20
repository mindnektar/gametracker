import animateScrollTo from 'animated-scroll-to';

const recursiveFindScrollParent = (element) => {
    if (!element || element === document) {
        return window;
    }

    const { overflowY } = window.getComputedStyle(element);
    const isScrollable = overflowY === 'auto' || overflowY === 'scroll';

    if (isScrollable) {
        return element;
    }

    return recursiveFindScrollParent(element.parentNode);
};

const findScrollParent = (element) => {
    const scrollParent = recursiveFindScrollParent(element);

    return {
        height: () => (scrollParent.offsetHeight || scrollParent.innerHeight),
        width: () => (scrollParent === window ? window.innerWidth : scrollParent.getBoundingClientRect().width),
        top: () => (scrollParent === window ? 0 : scrollParent.getBoundingClientRect().top),
        bottom: () => (scrollParent === window ? window.scrollMaxY : scrollParent.getBoundingClientRect().bottom),
        scroll: (distance) => {
            if (scrollParent.scrollBy) {
                scrollParent.scrollBy(0, distance);
            } else {
                scrollParent.scrollTop += distance;
            }
        },
        scrollTo: (position, { instant = false, offset = 0 } = {}) => {
            if (instant) {
                if (scrollParent === window) {
                    scrollParent.scrollTo(0, position);
                } else {
                    scrollParent.scrollTop = position;
                }
            } else {
                animateScrollTo(position, {
                    elementToScroll: scrollParent,
                    verticalOffset: offset,
                });
            }
        },
        resetScrollPosition: () => {
            if (scrollParent === window) {
                scrollParent.scrollTo(0, 0);
            } else {
                scrollParent.scrollTop = 0;
            }
        },
        scrollPosition: () => (scrollParent === window ? scrollParent.scrollY : scrollParent.scrollTop),
        addEventListener: (...data) => scrollParent.addEventListener(...data),
        removeEventListener: (...data) => scrollParent.removeEventListener(...data),
    };
};

export default findScrollParent;
