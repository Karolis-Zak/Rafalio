const selectWinner = () => {
    // Select raffles where the end_time is past, and no winner is selected yet
    const selectRafflesQuery = `
        SELECT raffle_id FROM raffles
        WHERE end_time < NOW() AND winner_id IS NULL
    `;
    
    db.query(selectRafflesQuery, (err, raffles) => {
        if (err) {
            return console.error('Error selecting raffles for winner assignment:', err);
        }

        raffles.forEach((raffle) => {
            // Select a random winner from raffle_entries
            const selectWinnerQuery = `
                SELECT user_id FROM raffle_entries
                WHERE raffle_id = ?
                ORDER BY RAND()
                LIMIT 1
            `;
            
            db.query(selectWinnerQuery, [raffle.raffle_id], (err, winners) => {
                if (err) {
                    return console.error('Error selecting winner for raffle:', raffle.raffle_id, err);
                }

                // If we have at least one entry, we set the winner
                if (winners.length > 0) {
                    const winnerId = winners[0].user_id;
                    const updateRaffleQuery = `
                        UPDATE raffles
                        SET winner_id = ?
                        WHERE raffle_id = ?
                    `;

                    db.query(updateRaffleQuery, [winnerId, raffle.raffle_id], (err, result) => {
                        if (err) {
                            return console.error('Error updating raffle with winner:', raffle.raffle_id, err);
                        }
                        console.log(`Winner selected for raffle ${raffle.raffle_id}: user ${winnerId}`);
                    });
                } else {
                    // No entries in the raffle, maybe log this situation as it's unusual
                    console.log(`No entries found for raffle ${raffle.raffle_id}. No winner selected.`);
                }
            });
        });
    });
};

// Set this up to run with node-cron or a similar scheduling library
// Example: run every hour (this needs to be set up in the main server file or a separate worker script)
const cron = require('node-cron');
cron.schedule('0 * * * *', selectWinner);
