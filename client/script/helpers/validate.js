export default {
    required: () => ({ value }) => {
        if (Array.isArray(value)) {
            return value.length > 0;
        }

        if (typeof value === 'string') {
            return !!value.trim();
        }

        return !!value;
    },
};
