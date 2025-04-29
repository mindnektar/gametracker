import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import useEffectWithoutMount from 'hooks/useEffectWithoutMount';

const Collapsible = (props) => {
    const rootRef = useRef();
    const timeoutRef = useRef();
    const contentRef = useRef();
    const [height, setHeight] = useState(props.collapsed ? 0 : null);
    const [isContentVisible, setIsContentVisible] = useState(!props.collapsed);

    const show = () => {
        window.requestAnimationFrame(() => {
            if (!contentRef.current) {
                return;
            }

            setHeight(contentRef.current.offsetHeight);

            timeoutRef.current = window.setTimeout(() => {
                // After the show animation is done, we need to remove the height again, because while the component is uncollapsed, the
                // height of its content might change. And if it does, a fixed height for the parent will break the layout.
                setHeight(null);
            }, 300);
        });
    };

    const hide = () => {
        if (!contentRef.current) {
            return;
        }

        // Because we removed the height after the show animation was done, we need to put it back before we can animate the height to 0.
        // If we don't, the height will simply snap to 0, because CSS can't transition from auto to 0. And in order for the animation to
        // work, we need to render the component with its correct height, and immediately afterwards we can set it to 0 as an effect on
        // `height` and `props.collapsed`.
        setHeight(contentRef.current.offsetHeight);

        timeoutRef.current = window.setTimeout(() => {
            // Remove the content from the DOM after the hide animation is done.
            setIsContentVisible(false);
        }, 300);
    };

    useEffectWithoutMount(() => {
        if (props.collapsed) {
            hide();
        } else if (isContentVisible) {
            // If the component is uncollapsed while it is in the process of collapsing, simply trigger the show animation again.
            show();
            window.clearTimeout(timeoutRef.current);
        } else {
            // If the component is uncollapsed while it is at rest, first render the content. The show animation will be triggered as an
            // effect on `isContentVisible`. This is necessary because in order to animate to the content's height, we first need to wait
            // for the content to be rendered, after which we can learn its height.
            setIsContentVisible(true);
        }

        return () => {
            window.clearTimeout(timeoutRef.current);
        };
    }, [props.collapsed]);

    useEffectWithoutMount(() => {
        if (isContentVisible) {
            show();
        }
    }, [isContentVisible]);

    useEffect(() => {
        if (height === contentRef.current?.offsetHeight && props.collapsed) {
            // If the component is collapsed, set the height to 0 immediately after the height was set to the content height, so the CSS
            // transition works.
            setHeight(0);
        }
    }, [height, props.collapsed]);

    return (
        <div
            ref={rootRef}
            className={classnames(
                'ui-collapsible',
                { 'ui-collapsible--collapsed': props.collapsed },
            )}
            style={{ height }}
        >
            {isContentVisible && (
                <div
                    ref={contentRef}
                    className="ui-collapsible__content"
                >
                    {props.children}
                </div>
            )}
        </div>
    );
};

Collapsible.defaultProps = {
    children: null,
};

Collapsible.propTypes = {
    children: PropTypes.node,
    collapsed: PropTypes.bool.isRequired,
};

export default Collapsible;
