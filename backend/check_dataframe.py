import yfinance as yf
import pandas as pd

symbol = "ASKAUTOLTD.NS"
stock = yf.Ticker(symbol)
df = stock.history(period="1y", interval="1d")

print(f"DataFrame columns before reset_index(): {df.columns.tolist()}")
print(f"DataFrame index name before reset_index(): {df.index.name}")

df_reset = df.reset_index()

print(f"DataFrame columns after reset_index(): {df_reset.columns.tolist()}")
print(f"Does 'Date' column exist after reset_index()?: {'Date' in df_reset.columns}")