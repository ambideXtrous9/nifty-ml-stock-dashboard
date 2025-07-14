import yfinance as yf

from mplchart.chart import Chart
from mplchart.primitives import Candlesticks, Volume
from mplchart.indicators import ROC, SMA, EMA, RSI, MACD
from PIL import Image
import io 
import base64

def chart(ticker):

    prices = yf.Ticker(ticker).history(period="1y", interval="1d")

    if prices.empty:
        print(f"No data found for {ticker} from yfinance.")
        return None

    indicators = [
        Candlesticks(colordn='red',colorup='green'),SMA(10),SMA(20), SMA(50), SMA(200), Volume(),
        RSI(),
        MACD(),
    ]

    chart = Chart(title=ticker)
    chart.plot(prices, indicators)
    x = chart.render(format='png')
    return x



    