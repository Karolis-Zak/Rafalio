

document.addEventListener('DOMContentLoaded', function() {
    cleanUpExpiredRaffles();
});

function cleanUpExpiredRaffles() {
    let raffles = JSON.parse(localStorage.getItem('raffles')) || [];
    const now = new Date().getTime();
    
    // Filter out raffles that have been expired for more than 24 hours
    const activeOrRecentRaffles = raffles.filter(raffle => {
        const endTime = new Date(raffle.endTime).getTime();
        return !(raffle.status === 'completed' && now - endTime > 24 * 60 * 60 * 1000);
    });

    // Optionally, here you can implement a backup mechanism before cleanup
    // backupRaffles(raffles);

    localStorage.setItem('raffles', JSON.stringify(activeOrRecentRaffles));
}

// Example function for backing up raffles before cleanup (to be implemented as needed)
function backupRaffles(raffles) {
    // Placeholder: Implement backup logic, e.g., saving to a different localStorage key or external storage
    console.log('Backup raffles (to be implemented):', raffles);
}

// Optionally, implement additional safety or data integrity checks
function checkDataIntegrity() {
    // Placeholder: Implement any necessary checks to ensure the integrity of the raffle data
    console.log('Check data integrity (to be implemented)');
}
