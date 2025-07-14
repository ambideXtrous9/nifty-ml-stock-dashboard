from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from StockScreener.screener import BreakoutVolume, scrapper, CompanyNews, nifty500_df, microcap250_df, get_yf_symbol, stock_node, analyze_financial_data, plotShareholding
from StockScreener.mlpchart.mlpchart import chart
import io

import logging

app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/stock-screener/nifty500")
async def get_nifty500_breakouts():
    return StreamingResponse(BreakoutVolume(list(nifty500_df['YFSYMBOL'])), media_type="application/json")

@app.get("/stock-screener/microcap250")
async def get_microcap250_breakouts():
    return StreamingResponse(BreakoutVolume(list(microcap250_df['YFSYMBOL'])), media_type="application/json")

@app.get("/stock-screener/details/{symbol}")
def get_stock_details(symbol: str):
    try:
        fundainfo, shareholdnres = scrapper(symbol)
        news = CompanyNews(fundainfo['Company Name'])
        analysis = stock_node(fundainfo, shareholdnres, news)
        financial_analysis = analyze_financial_data(shareholdnres)
        shareholding_chart = plotShareholding(shareholdnres)
        if shareholding_chart is None:
            logger.warning(f"Shareholding chart is None for {symbol}")
            shareholding_chart_json = None
        else:
            shareholding_chart_json = shareholding_chart.to_json()

        return {
            "fundamentals": fundainfo, 
            "shareholding": shareholdnres, 
            "news": news, 
            "analysis": analysis,
            "financial_analysis": financial_analysis,
            "shareholding_chart": shareholding_chart_json
        }
    except Exception as e:
        logger.error(f"Error fetching details for {symbol}: {e}", exc_info=True)
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/stock-screener/chart/{symbol}")
def get_stock_chart(symbol: str):
    try:
        img_buffer = chart(symbol)
        return StreamingResponse(io.BytesIO(img_buffer), media_type="image/png")
    except Exception as e:
        logger.error(f"Error fetching chart for {symbol}: {e}", exc_info=True)
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/stock-screener/candlestick-chart/{symbol}")
def get_candlestick_chart(symbol: str):
    try:
        logger.info(f"Attempting to generate candlestick chart using mplchart for {symbol}")
        img_buffer = chart(symbol) # Use the chart function from mlpchart
        if img_buffer is None:
            logger.warning(f"mplchart.chart returned None for {symbol}")
            raise HTTPException(status_code=404, detail="Candlestick chart not available for this stock.")
        logger.info(f"Generated mplchart image for {symbol}")
        return StreamingResponse(io.BytesIO(img_buffer), media_type="image/png")
    except Exception as e:
        logger.error(f"Error in get_candlestick_chart (mplchart) for {symbol}: {e}", exc_info=True)
        raise HTTPException(status_code=404, detail=f"Error generating candlestick chart: {e}")
