const creditText = document.querySelector(".profile-credit strong");
const gameMessage = document.querySelector("#blackjack-message");
const betInput = document.querySelector("#blackjack-bet");
const dealButton = document.querySelector("#deal-button");
const hitButton = document.querySelector("#hit-button");
const standButton = document.querySelector("#stand-button");
const addCreditsButton = document.querySelector("#add-credits");

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const creditKey = "golden-dice-credits";

let credits = loadCredits();
let deck = [];
let playerCards = [];
let dealerCards = [];
let currentBet = 0;
let roundIsPlaying = false;

function loadCredits() {
    try {
        const savedCredits = localStorage.getItem(creditKey);
        const numberOfCredits = Number(savedCredits);

        if (savedCredits !== null && Number.isSafeInteger(numberOfCredits) && numberOfCredits >= 0) {
            return numberOfCredits;
        }
    } catch {
        gameMessage.textContent = "A kredit csak a lap bezárásáig marad meg ebben a böngészőben.";
    }

    return 100;
}

function saveCredits() {
    creditText.textContent = credits;

    try {
        localStorage.setItem(creditKey, credits);
    } catch {
        gameMessage.textContent = "A kredit csak a lap bezárásáig marad meg ebben a böngészőben.";
    }
}

function createDeck() {
    const cards = [];

    for (const suit of suits) {
        for (const rank of ranks) {
            cards.push({ suit: suit, rank: rank });
        }
    }

    for (let i = cards.length - 1; i > 0; i--) {
        const otherIndex = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[otherIndex]] = [cards[otherIndex], cards[i]];
    }

    return cards;
}

function getCardValue(card) {
    if (card.rank === "A") {
        return 11;
    }

    if (["J", "Q", "K"].includes(card.rank)) {
        return 10;
    }

    return Number(card.rank);
}

function getHandTotal(cards) {
    let total = 0;
    let aces = 0;

    for (const card of cards) {
        total += getCardValue(card);
        if (card.rank === "A") {
            aces++;
        }
    }

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}

function showCards(elementId, cards, hideDealerCard = false) {
    const cardArea = document.querySelector(elementId);
    cardArea.replaceChildren();

    cards.forEach((card, index) => {
        const cardElement = document.createElement("span");
        cardElement.classList.add("card");

        if (hideDealerCard && index === 1) {
            cardElement.classList.add("hidden-card");
            cardElement.textContent = "?";
        } else {
            cardElement.textContent = card.rank + card.suit;

            if (card.suit === "♥" || card.suit === "♦") {
                cardElement.classList.add("red-card");
            }
        }

        cardArea.append(cardElement);
    });
}

function updateTable() {
    showCards("#player-cards", playerCards);
    showCards("#dealer-cards", dealerCards, roundIsPlaying);

    document.querySelector("#player-total").textContent = playerCards.length
        ? "Érték: " + getHandTotal(playerCards)
        : "";
    document.querySelector("#dealer-total").textContent = dealerCards.length
        ? roundIsPlaying
            ? "A második lap rejtve"
            : "Érték: " + getHandTotal(dealerCards)
        : "";

    dealButton.disabled = roundIsPlaying || credits === 0;
    hitButton.disabled = !roundIsPlaying;
    standButton.disabled = !roundIsPlaying;
}

function finishRound(message, winnings) {
    credits += winnings;
    roundIsPlaying = false;
    saveCredits();
    gameMessage.textContent = message;
    updateTable();
}

function playDealerTurn() {
    while (getHandTotal(dealerCards) < 17) {
        dealerCards.push(deck.pop());
    }

    const playerTotal = getHandTotal(playerCards);
    const dealerTotal = getHandTotal(dealerCards);

    if (dealerTotal > 21 || playerTotal > dealerTotal) {
        finishRound("Nyertél! A tét kétszeresét kapod vissza.", currentBet * 2);
    } else if (playerTotal === dealerTotal) {
        finishRound("Döntetlen. A tét visszajár.", currentBet);
    } else {
        finishRound("Az osztó nyert. A tét elveszett.", 0);
    }
}

document.querySelector("#blackjack-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const bet = Number(betInput.value);
    if (!Number.isSafeInteger(bet) || bet < 1 || bet > credits) {
        gameMessage.textContent = "A tét legyen legalább 1, és ne legyen több a kreditednél.";
        return;
    }

    currentBet = bet;
    credits -= bet;
    deck = createDeck();
    playerCards = [deck.pop(), deck.pop()];
    dealerCards = [deck.pop(), deck.pop()];
    roundIsPlaying = true;
    saveCredits();

    const playerHasBlackjack = getHandTotal(playerCards) === 21;
    const dealerHasBlackjack = getHandTotal(dealerCards) === 21;

    if (playerHasBlackjack && dealerHasBlackjack) {
        finishRound("Mindkettőtöknek blackjackje van. Döntetlen!", currentBet);
    } else if (playerHasBlackjack) {
        finishRound("Blackjack! Nyertél.", currentBet + Math.floor(currentBet * 1.5));
    } else if (dealerHasBlackjack) {
        finishRound("Az osztónak blackjackje van. A tét elveszett.", 0);
    } else {
        gameMessage.textContent = "Te következel: kérj lapot, vagy állj meg.";
        updateTable();
    }
});

hitButton.addEventListener("click", function () {
    if (!roundIsPlaying) {
        return;
    }

    playerCards.push(deck.pop());

    if (getHandTotal(playerCards) > 21) {
        finishRound("Túllépted a 21-et. Az osztó nyert.", 0);
    } else {
        gameMessage.textContent = "Kérhetsz még lapot, vagy megállhatsz.";
        updateTable();
    }
});

standButton.addEventListener("click", function () {
    if (roundIsPlaying) {
        playDealerTurn();
    }
});

addCreditsButton.addEventListener("click", function () {
    credits += 100;
    saveCredits();
    gameMessage.textContent = "Hozzáadtunk 100 kreditet. Jó játékot!";
});

creditText.textContent = credits;
updateTable();
