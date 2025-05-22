import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import bigDecimal from 'js-big-decimal';
import Draggable from 'Draggable';

const Slider = (props) => {
    const sliderRef = useRef();
    const left = (props.value - props.min) / (props.max - props.min);

    const onDrag = (event) => {
        const sliderRect = sliderRef.current.getBoundingClientRect();
        const mouseLeft = event.clientX - sliderRect.left;
        const rounder = 100 / props.stepSize;
        const leftWithinBar = Math.round((mouseLeft / sliderRect.width) * rounder) / rounder;
        const value = Math.max(
            props.min,
            Math.min(
                props.max,
                bigDecimal.add(
                    bigDecimal.multiply(
                        bigDecimal.subtract(props.max, props.min),
                        leftWithinBar,
                    ),
                    props.min,
                ),
            ),
        );

        props.onChange(bigDecimal.multiply(bigDecimal.divide(value, props.stepSize, 0), props.stepSize));
    };

    return (
        <div
            className="ui-slider"
            ref={sliderRef}
        >
            <Draggable
                onDragStart={onDrag}
                onDrag={onDrag}
            >
                <div className="ui-slider__bar">
                    <div
                        className="ui-slider__bar-inner"
                        style={{ transform: `translateX(${-100 + (left * 100)}%)` }}
                    />
                </div>

                <div
                    className="ui-slider__draggable"
                    style={{ left: `${left * 100}%` }}
                >
                    <div className="ui-slider__point" />

                    <div className="ui-slider__value">
                        {props.value}
                    </div>
                </div>
            </Draggable>
        </div>
    );
};

Slider.propTypes = {
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    stepSize: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default Slider;
