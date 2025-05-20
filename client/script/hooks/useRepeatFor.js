import moment from 'moment';

export default (duration) => (
    (onStep, onDone) => {
        const start = moment();

        const step = () => {
            onStep();

            if (moment(start).diff() > -duration) {
                window.requestAnimationFrame(step);
            } else {
                onDone?.();
            }
        };

        window.requestAnimationFrame(step);
    }
);
