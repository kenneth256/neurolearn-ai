/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm Implementation
 * 
 * Based on the algorithm defined by Piotr Wozniak.
 * Given a previous state of a Flashcard/ReviewItem and a grade (0-5),
 * returns the newly calculated interval, repetition count, and easiness factor.
 */

export interface SM2Result {
    interval: number; // Interval in days
    repetitionCount: number; // Times successfully reviewed in a row
    easinessFactor: number; // How easy the concept is (1.3 to 2.5+)
    dueDate: Date; // The exact date this should be reviewed next
}

/**
 * Calculates the next Spaced Repetition interval using SM-2
 * 
 * @param quality 0-5 (0=Complete blackout, 5=Perfect response, trivial)
 * @param currentRepetition Current times reviewed in a row (0 for new)
 * @param currentEasinessFactor Current EF (default 2.5)
 * @param currentInterval Current interval in days (0 for new)
 * @returns SM2Result
 */
export function calculateNextReview(
    quality: number,
    currentRepetition: number,
    currentEasinessFactor: number,
    currentInterval: number
): SM2Result {
    let newInterval = 0;
    let newRepetition = 0;
    let newEasinessFactor = currentEasinessFactor;

    // Bound the quality to 0-5
    const boundedQuality = Math.max(0, Math.min(5, Math.round(quality)));

    if (boundedQuality >= 3) {
        // Correct response (>= 3)
        if (currentRepetition === 0) {
            newInterval = 1;
        } else if (currentRepetition === 1) {
            newInterval = 6;
        } else {
            newInterval = Math.round(currentInterval * currentEasinessFactor);
        }

        newRepetition = currentRepetition + 1;
    } else {
        // Incorrect response (< 3), reset repetition
        newRepetition = 0;
        newInterval = 1;
    }

    // Calculate new Easiness Factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    newEasinessFactor = currentEasinessFactor +
        (0.1 - (5 - boundedQuality) * (0.08 + (5 - boundedQuality) * 0.02));

    // The EF shouldn't fall below 1.3
    if (newEasinessFactor < 1.3) {
        newEasinessFactor = 1.3;
    }

    // Calculate exact due date by adding interval in days to current time
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + newInterval);

    return {
        interval: newInterval,
        repetitionCount: newRepetition,
        easinessFactor: newEasinessFactor,
        dueDate: nextDueDate
    };
}
