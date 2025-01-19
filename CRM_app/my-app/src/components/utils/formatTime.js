export function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    return new Intl.DateTimeFormat([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
    }).format(new Date(Date.UTC(1970, 0, 1, hours, minutes)));
}

export function add30Minutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newMinutes = minutes + 30;
    const newHours = hours + Math.floor(newMinutes / 60);
    const newMinutesNormalized = newMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutesNormalized.toString().padStart(2, '0')}`;
}