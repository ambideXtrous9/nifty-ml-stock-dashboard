import yfinance as yf

symbol = "ASKAUTOLTD.NS"
stock = yf.Ticker(symbol)
df = stock.history(period="1y", interval="1d")

if df.empty:
    print(f"DataFrame is empty for {symbol}")
else:
    print(f"DataFrame is NOT empty for {symbol}. Head:\n{df.head()}")

