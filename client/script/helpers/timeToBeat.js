export const formatTimeToBeat = (timeToBeat) => {
    const hours = Math.floor(timeToBeat);
    const minutes = Math.round((timeToBeat - hours) * 60);

    if (hours === 0 && minutes === 0) {
        return '';
    }

    if (minutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
};
