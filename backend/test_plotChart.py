import yfinance as yf
import plotly.graph_objs as go
import pandas as pd

def plotChart_test(symbol):
    stock = yf.Ticker(symbol)
    df = stock.history(period="1y", interval="1d")

    if df.empty:
        print(f"No data found for {symbol} from yfinance.")
        return None
    
    df = df.reset_index()
    print(f"Columns in DataFrame after reset_index(): {df.columns.tolist()}")

    required_cols = ['Date', 'Open', 'High', 'Low', 'Close']
    if not all(col in df.columns for col in required_cols):
        print(f"Missing required columns for chart for {symbol}: {', '.join([col for col in required_cols if col not in df.columns])}")
        return None

    fig = go.Figure(data=[go.Candlestick(x=df['Date'],
                        open=df['Open'],
                        high=df['High'],
                        low=df['Low'],
                        close=df['Close'])])
    
    return fig

# Test the function
symbol = "ASKAUTOLTD.NS"
fig = plotChart_test(symbol)

if fig:
    print(f"Figure generated successfully for {symbol}")
    # You can save the figure to a file to inspect it
    # fig.write_image("test_chart.png")
else:
    print(f"Failed to generate figure for {symbol}")
