import random

SUITS = ["♠", "♥", "♦", "♣"]
RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]


def new_deck():
    deck = [(rank, suit) for suit in SUITS for rank in RANKS]
    random.shuffle(deck)
    return deck


def card_value(rank):
    if rank in ("J", "Q", "K"):
        return 10
    if rank == "A":
        return 11
    return int(rank)


def hand_value(hand):
    total = sum(card_value(rank) for rank, _ in hand)
    aces = sum(1 for rank, _ in hand if rank == "A")
    # Count aces as 1 instead of 11 while we would bust
    while total > 21 and aces:
        total -= 10
        aces -= 1
    return total


def show_hand(name, hand, hide_first=False):
    if hide_first:
        cards = "[?] " + " ".join(f"{r}{s}" for r, s in hand[1:])
        print(f"{name}: {cards}")
    else:
        cards = " ".join(f"{r}{s}" for r, s in hand)
        print(f"{name}: {cards}  (total: {hand_value(hand)})")


def ask_bet(chips):
    while True:
        try:
            bet = int(input(f"You have {chips} chips. Place your bet: "))
            if 1 <= bet <= chips:
                return bet
            print(f"Bet must be between 1 and {chips}.")
        except ValueError:
            print("Please enter a whole number.")


def play_round(chips):
    deck = new_deck()
    bet = ask_bet(chips)

    player = [deck.pop(), deck.pop()]
    dealer = [deck.pop(), deck.pop()]

    print()
    show_hand("Dealer", dealer, hide_first=True)
    show_hand("You   ", player)

    # Check for natural blackjack
    if hand_value(player) == 21:
        if hand_value(dealer) == 21:
            show_hand("Dealer", dealer)
            print("Both have blackjack. Push!")
            return chips
        print("Blackjack! You win 1.5x your bet.")
        return chips + int(bet * 1.5)

    # Player's turn
    while True:
        choice = input("\n(h)it or (s)tand? ").strip().lower()
        if choice == "h":
            player.append(deck.pop())
            show_hand("You   ", player)
            if hand_value(player) > 21:
                print("Bust! You lose.")
                return chips - bet
        elif choice == "s":
            break
        else:
            print("Type h or s.")

    # Dealer's turn: hits until 17 or more
    print()
    show_hand("Dealer", dealer)
    while hand_value(dealer) < 17:
        dealer.append(deck.pop())
        print("Dealer hits...")
        show_hand("Dealer", dealer)

    p, d = hand_value(player), hand_value(dealer)
    if d > 21:
        print("Dealer busts! You win.")
        return chips + bet
    if p > d:
        print("You win!")
        return chips + bet
    if p < d:
        print("Dealer wins.")
        return chips - bet
    print("Push! Bet returned.")
    return chips


def main():
    chips = 100
    print("=== BLACKJACK ===")
    while chips > 0:
        chips = play_round(chips)
        if chips <= 0:
            print("\nYou're out of chips. Game over!")
            break
        again = input("\nPlay another round? (y/n) ").strip().lower()
        if again != "y":
            print(f"You walk away with {chips} chips.")
            break
        print("\n" + "-" * 30)


if __name__ == "__main__":
    main()