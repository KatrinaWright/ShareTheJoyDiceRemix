import random
import matplotlib.pyplot as plt
from collections import Counter

class WinterDiceGame:
    def __init__(self, num_players, dice_per_player):
        self.num_players = num_players
        self.player_dice = {f"Player {i+1}": dice_per_player for i in range(num_players)}
        self.total_dice = num_players * dice_per_player
        self.turn_count = 0
        self.dice_faces = ['Blank'] * 3 + ['Present'] + ['Snowflake'] + ['Candy Cane'] + ['Star']
        self.roll_distribution = Counter()
        self.player_turns = Counter()

    def roll_dice(self, num_dice):
        rolls = [random.choice(self.dice_faces) for _ in range(num_dice)]
        self.roll_distribution.update(rolls)
        return Counter(rolls)

    def handle_candy_cane_challenge(self, challenger, defender, num_candy_canes):
        defender_roll = self.roll_dice(self.player_dice[defender])
        defender_candy_canes = defender_roll['Candy Cane']
        
        if defender_candy_canes >= num_candy_canes:
            # Defender wins, challenger takes excess
            excess = defender_candy_canes - num_candy_canes
            self.player_dice[challenger] += excess
            self.player_dice[defender] -= excess
        else:
            # Challenger wins, defender takes unblocked
            unblocked = num_candy_canes - defender_candy_canes
            self.player_dice[defender] += unblocked
            self.player_dice[challenger] -= unblocked

    def play_turn(self, player):
        self.player_turns[player] += 1
        dice_count = self.player_dice[player]
        if dice_count <= 0:
            return

        roll_result = self.roll_dice(dice_count)
        
        # Handle presents
        presents = roll_result['Present']
        if presents:
            other_players = [p for p in self.player_dice if p != player]
            for _ in range(presents):
                recipient = random.choice(other_players)
                self.player_dice[player] -= 1
                self.player_dice[recipient] += 1

        # Handle snowflakes
        snowflakes = roll_result['Snowflake']
        self.player_dice[player] -= snowflakes
        self.total_dice -= snowflakes

        # Handle candy canes
        candy_canes = roll_result['Candy Cane']
        if candy_canes:
            next_player_index = (list(self.player_dice.keys()).index(player) + 1) % self.num_players
            next_player = list(self.player_dice.keys())[next_player_index]
            self.handle_candy_cane_challenge(player, next_player, candy_canes)

        # Handle stars (you can define a special action here)
        stars = roll_result['Star']
        # Example: remove extra dice for each star
        if stars:
            self.player_dice[player] -= stars
            self.total_dice -= stars

    def play_game(self):
        while len([p for p in self.player_dice.values() if p > 0]) > 1:
            self.turn_count += 1
            for player in list(self.player_dice.keys()):
                if self.player_dice[player] <= 0:
                    continue
                
                print(f"\nTurn {self.turn_count} - {player}'s turn:")
                print(f"Dice counts: {self.player_dice}")
                print(f"Total dice: {self.total_dice}")
                
                self.play_turn(player)
                
                if self.player_dice[player] <= 0:
                    print(f"{player} is out of dice!")
                
                if sum(1 for d in self.player_dice.values() if d > 0) == 1:
                    winner = [p for p, d in self.player_dice.items() if d > 0][0]
                    print(f"\nGame Over! {winner} wins on turn {self.turn_count}!")
                    self.display_statistics()
                    return

    def display_statistics(self):
        print("\nGame Statistics:")
        print(f"Total turns: {self.turn_count}")
        print("Player turns:", dict(self.player_turns))
        
        # Dice roll distribution graph
        plt.figure(figsize=(10, 6))
        plt.bar(self.roll_distribution.keys(), self.roll_distribution.values())
        plt.title("Dice Roll Distribution")
        plt.xlabel("Dice Face")
        plt.ylabel("Number of Rolls")
        plt.show()

# Run the simulation
num_players = 5
dice_per_player = 5

game = WinterDiceGame(num_players, dice_per_player)
game.play_game()