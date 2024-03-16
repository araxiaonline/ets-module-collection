// A function that will take a min and a max and return a random number between them
export function rollDice(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}