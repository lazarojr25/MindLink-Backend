const today = new Date();
const currentDayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)

// Calculate the start date of the current week (assuming the week starts on Monday)
const startOfWeek = new Date(today);
const startOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek; // Adjust to the previous Monday if today is Sunday, otherwise the most recent Monday
startOfWeek.setDate(today.getDate() + startOffset);

// Get the end of the current week (Sunday)
const endOfWeek = new Date(startOfWeek);
endOfWeek.setDate(startOfWeek.getDate() + 6);

const week = {
    start: startOfWeek,
    end: endOfWeek,
    today: today
}

export default week