import pandas as pd

try:
    df = pd.read_excel('data/payment_lines.xlsx')
    print("Columns:", df.columns.tolist())
    print(df.head())
except Exception as e:
    print(f"Error: {e}")
