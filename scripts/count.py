import sys
from collections import Counter

def main():
    if len(sys.argv) != 2:
        sys.exit(1)

    filename = sys.argv[1]

    try:
        with open(filename, 'r') as file:
            sequences = [line.strip() for line in file if not line.startswith('>')]
    except FileNotFoundError:
        sys.exit(1)

    counts = Counter(sequences)
    sorted_counts = sorted(counts.items(), key=lambda item: (-item[1], item[0]))

    for motif, count in sorted_counts:
        print(f"{count} {motif}")

if __name__ == '__main__':
    main()
