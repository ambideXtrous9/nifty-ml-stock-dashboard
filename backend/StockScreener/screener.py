import yfinance as yf
from ta.trend import sma_indicator
import requests
from bs4 import BeautifulSoup
import plotly.graph_objs as go
from plotly.subplots import make_subplots
from gnews import GNews
from langchain_core.messages import AIMessage
import pandas as pd
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os 
import re
import json

load_dotenv()

nifty500_df = pd.read_csv("StockScreener/ind_nifty500list.csv")
microcap250_df = pd.read_csv("StockScreener/ind_niftymicrocap250_list.csv") 

nifty500_df['YFSYMBOL'] = nifty500_df['Symbol'] + '.NS'
microcap250_df['YFSYMBOL'] = microcap250_df['Symbol'] + '.NS'

df500 = list(nifty500_df['YFSYMBOL'])
microcap250 = list(microcap250_df['YFSYMBOL'])

complist = list(nifty500_df['Company Name'])

def get_yf_symbol(company_name: str):
    match = nifty500_df.loc[nifty500_df['Company Name'] == company_name, 'YFSYMBOL']
    return match.iloc[0] if not match.empty else None

llm = ChatGroq(
    model_name="qwen/qwen3-32b",
    temperature=0.7
)


# Initialize the GNews object
google_news = GNews(language='en', period='30d',max_results=20)

from StockScreener.mlpchart.mlpchart import chart

from langgraph.prebuilt import create_react_agent

stock_agent = create_react_agent(
        model=llm,
        tools=[],
        prompt=(
            "You are an Expert Stock Reasearch Financial Analyst."
            "Analyze all the provided Fundamental, Yearly and Quarterly Profit/Loss data and Shareholding data and Latest News"
            "Follow the ReAct pattern: label each step as `Thought:`, `Action:`, `Observation:`, "
            "Write proper Report for User about 'Buy', 'Sell' or 'Hold' with proper reason and Target Price."
        )
    )

# 🧑‍🔬 Stock Researcher Agent
# ---------------------------
def stock_node(fundamentals,shareholding,news):
    # Prepare the prompt
    user_msg = {
        "role": "user",
        "content": (
            f"Do the research on the Stock based on provided data and latest news:\n\n"
            f"Fundamentals : {fundamentals}\n\nYearly and Quarterly Profit/Loss Data and Shareholding of FII and DIIs: {shareholding}\n\nNews: {news}"
        )
    }


    ai_content = ""
    try:
        for step in stock_agent.stream({"messages": [user_msg]}, stream_mode="values"):
            msg = step["messages"][-1]
            if isinstance(msg, AIMessage):
                ai_content = msg.content
    except Exception as e:
        print(f"Error during LLM call: {e}")
        ai_content = "AI analysis is currently unavailable due to an error."
            
    return ai_content


def BreakoutVolume(niftylist):
    stockList = []
    stock_cache = {}
    current_date = pd.Timestamp.now()
    current_week = current_date.strftime('%Y-%U')
    current_month = current_date.to_period('M')

    total_items = len(niftylist)
    for i, symbol in enumerate(niftylist):
        yield json.dumps({"progress": (i + 1) / total_items, "status": f"Scanning {symbol}..."}).encode('utf-8') + b'\n'
        try:
            if symbol in stock_cache:
                dt = stock_cache[symbol]
            else:
                stock = yf.Ticker(symbol)
                dt = stock.history(period="6mo", interval="1d")
                if dt.empty:
                    print(f"Skipping {symbol}: Empty DataFrame from yfinance")
                    continue
                dt = dt.reset_index()
                stock_cache[symbol] = dt

            if dt.empty:
                print(f"Skipping {symbol}: Empty DataFrame from yfinance")
                continue

            dt = dt.reset_index()
            stock_cache[symbol] = dt

            if len(dt) < 5:
                print(f"Skipping {symbol}: Not enough data points ({len(dt)} < 5) after reset_index")
                continue

            # Ensure columns exist before accessing
            required_cols = ['Close', 'Volume', 'Open', 'High', 'Low', 'Date']
            if not all(col in dt.columns for col in required_cols):
                print(f"Skipping {symbol}: Missing required columns: {', '.join([col for col in required_cols if col not in dt.columns])}")
                continue

            dt['50_SMA'] = sma_indicator(dt['Close'], window=50)
            dt['20_SMA'] = sma_indicator(dt['Close'], window=20)
            dt['Volume_EMA20'] = dt['Volume'].ewm(span=20, adjust=False).mean()

            dt.sort_values(by='Date', ascending=False, inplace=True)

            # Check if enough rows exist after sorting
            if len(dt) < 5:
                print(f"Skipping {symbol}: Not enough data points after sorting ({len(dt)} < 5)")
                continue

            daily_values = dt.iloc[0]
            prev_day_values = dt.iloc[1]
            two_days_ago_values = dt.iloc[2]
            three_days_ago_values = dt.iloc[3]
            four_days_ago_values = dt.iloc[4]

            if not all(col in daily_values.index for col in ['Volume', 'Volume_EMA20', 'Close', '50_SMA', '20_SMA', 'Open', 'High', 'Low']):
                print(f"Skipping {symbol}: Missing daily_values data after SMA/EMA calculation")
                continue

            # Temporarily commenting out strict filtering to diagnose
            # if daily_values['Volume'] < daily_values['Volume_EMA20'] or \
            #    daily_values['Close'] < daily_values['50_SMA'] or \
            #    daily_values['Close'] < daily_values['20_SMA']:
            #     print(f"Skipping {symbol}: Volume or SMA criteria not met")
            # continue

            # week_data_df = dt[dt['Date'].dt.strftime('%Y-%U') == current_week]
            # if week_data_df.empty:
            #     print(f"Skipping {symbol}: No data for current week")
            # continue
            # week_data = week_data_df.iloc[-1]

            # month_data_df = dt[dt['Date'].dt.to_period('M') == current_month]
            # if month_data_df.empty:
            #     print(f"Skipping {symbol}: No data for current month")
            # continue
            # month_data = month_data_df.iloc[-1]

            # if not all(col in week_data.index for col in ['Open']) or \
            #    not all(col in month_data.index for col in ['Open']):
            #     print(f"Skipping {symbol}: Missing week/month open data")
            # continue

            # daily_range = abs(daily_values['High'] - daily_values['Low'])
            # prev_range = abs(prev_day_values['High'] - prev_day_values['Low'])
            # two_day_range = abs(two_days_ago_values['High'] - two_days_ago_values['Low'])
            # three_day_range = abs(three_days_ago_values['High'] - three_days_ago_values['Low'])
            # four_day_range = abs(four_days_ago_values['High'] - four_days_ago_values['Low'])

            # if not (daily_range > prev_range and 
            #        daily_range > two_day_range and 
            #        daily_range > three_day_range and 
            #        daily_range > four_day_range):
            #     print(f"Skipping {symbol}: Price range criteria not met")
            # continue

            # if not (daily_values['Close'] > daily_values['Open'] and 
            #        daily_values['Close'] > week_data['Open'] and 
            #        daily_values['Close'] > month_data['Open']):
            #     print(f"Skipping {symbol}: Closing conditions not met")
            # continue

            # if daily_values['Low'] <= (prev_day_values['Close'] - abs(prev_day_values['Close'] / 222)):
            #     print(f"Skipping {symbol}: Low price criteria not met")
            # continue

            stockList.append(symbol)

        except Exception as e:
            print(f"Error processing data for {symbol}: {str(e)}")
            continue

    yield json.dumps({"progress": 1.0, "status": f"Scan complete. Found {len(stockList)} stocks."}).encode('utf-8') + b'\n'
    yield json.dumps({"stocks": stockList}).encode('utf-8') + b'\n'


def results(soup):

    yearly_values = []
    quarter_values = []

    # Find the section with id "profit-loss"
    section = soup.find('section', id='profit-loss')

    if section:
        # Extract rows from this section
        rows = section.find_all('tr')

        for row in rows:
            # Check if the row contains the text "Net Profit"
            if 'Net Profit' in row.get_text():
                # Find all <td> elements in the row, skipping the first <td> which contains the button
                columns = row.find_all('td')[1:]
                yearly_values = [col.get_text(strip=True) for col in columns]
                break  # Exit loop once we find the correct row



          # Find the section with id "profit-loss"
    section = soup.find('section', id='quarters')

    if section:
        # Extract rows from this section
        rows = section.find_all('tr')

        for row in rows:
            # Check if the row contains the text "Net Profit"
            if 'Net Profit' in row.get_text():
                # Find all <td> elements in the row, skipping the first <td> which contains the button
                columns = row.find_all('td')[1:]
                quarter_values = [col.get_text(strip=True) for col in columns]
                break  # Exit loop once we find the correct row


    return  quarter_values, yearly_values


def shareholding(soup):

    Promoters = []
    DII = []
    FII = []
    Public = []

          # Find the section with id "profit-loss"
    section = soup.find('section', id='shareholding')

    if section:
        # Extract rows from this section
        rows = section.find_all('tr')

        for row in rows:
            # Check if the row contains the text "Net Profit"
            if 'Promoters' in row.get_text():
                # Find all <td> elements in the row, skipping the first <td> which contains the button
                columns = row.find_all('td')[1:]
                Promoters = [col.get_text(strip=True) for col in columns]
                break  # Exit loop once we find the correct row

        for row in rows:
            # Check if the row contains the text "Net Profit"
            if 'DIIs' in row.get_text():
                # Find all <td> elements in the row, skipping the first <td> which contains the button
                columns = row.find_all('td')[1:]
                DII = [col.get_text(strip=True) for col in columns]
                break  # Exit loop once we find the correct row

        for row in rows:
            # Check if the row contains the text "Net Profit"
            if 'FIIs' in row.get_text():
                # Find all <td> elements in the row, skipping the first <td> which contains the button
                columns = row.find_all('td')[1:]
                FII = [col.get_text(strip=True) for col in columns]
                break  # Exit loop once we find the correct row

        for row in rows:
            # Check if the row contains the text "Net Profit"
            if 'Public' in row.get_text():
                # Find all <td> elements in the row, skipping the first <td> which contains the button
                columns = row.find_all('td')[1:]
                Public = [col.get_text(strip=True) for col in columns]
                break  # Exit loop once we find the correct row

    return Promoters, DII, FII, Public
  
def extract_key_insights(soup):
    company_name_tag = soup.find('h1', class_='margin-0 show-from-tablet-landscape')
    company_name = company_name_tag.text.strip() if company_name_tag else "N/A"

    current_price_tag = soup.find('div', class_='font-size-18 strong line-height-14')
    current_price = current_price_tag.find('span').text.strip() if current_price_tag and current_price_tag.find('span') else "N/A"

    market_cap_tag = soup.find('li', {'data-source': 'default'})
    market_cap = market_cap_tag.find('span', class_='number').text.strip() if market_cap_tag and market_cap_tag.find('span', class_='number') else "N/A"

    about_section_tag = soup.find('div', class_='company-profile')
    about_section = about_section_tag.find('div', class_='sub show-more-box about').text.strip() if about_section_tag and about_section_tag.find('div', class_='sub show-more-box about') else "N/A"

    pe_value_tag = soup.find('span', class_='name', string=lambda t: t and "Stock P/E" in t)
    pe_value = pe_value_tag.find_next('span', class_='number').string if pe_value_tag and pe_value_tag.find_next('span', class_='number') else "N/A"

    roe_tag = soup.find('span', class_='name', string=lambda t: t and "ROE" in t)
    roe = roe_tag.find_next('span', class_='number').string if roe_tag and roe_tag.find_next('span', class_='number') else "N/A"

    roce_tag = soup.find('span', class_='name', string=lambda t: t and "ROCE" in t)
    roce = roce_tag.find_next('span', class_='number').string if roce_tag and roce_tag.find_next('span', class_='number') else "N/A"

    quarter_values, yearly_values = results(soup)
    Promoters, DII, FII, Public = shareholding(soup)

    fundainfo = {
        "Company Name": company_name,
        "Current Price": current_price,
        "Market Cap": market_cap,
        "About": about_section,
        "PE" : pe_value,
        "ROE" : roe,
        "ROCE" : roce,}

    shareholdnres = {"Quarter" : quarter_values,
        "Yearly" : yearly_values,
        "Promoters" : Promoters,
        "DII" : DII,
        "FII" : FII,
        "Public" : Public
    }

    return fundainfo, shareholdnres 


def scrapper(stock_ticker):
    
    stock_ticker = stock_ticker.replace('.NS', '')

    url = f"https://www.screener.in/company/{stock_ticker}/"

    response = requests.get(url)

    if response.status_code == 200:
        print("Successfully fetched the webpage")
    else:
        print(f"Failed to fetch the webpage. Status code: {response.status_code}")

    soup = BeautifulSoup(response.content, 'html.parser')
    
    
    fundainfo, shareholdnres = extract_key_insights(soup)
    
    return fundainfo, shareholdnres

def CompanyNews(name):
    # Fetch news articles
    news = google_news.get_news(name)
    return news
    



# Helper function to convert percentage strings to floats
def convert_to_float(data):
    if not data or not isinstance(data, list):
        return []
    
    if all(isinstance(item, str) for item in data):
        # Remove commas and convert percentages
        if all('%' in item for item in data):
            return [float(value.replace(',', '').strip('%')) for value in data]
        # Remove commas and convert numeric strings
        else:
            return [float(value.replace(',', '')) for value in data]
    return []

def analyze_financial_data(data):
    # Function to check and return the status with appropriate coloring
    data = {key: convert_to_float(value) for key, value in data.items()}
    
    return data

def plotShareholding(shareholdnres):

    # Convert percentages in each list where necessary
    converted_data = {key: convert_to_float(value) for key, value in shareholdnres.items()}

    # Filter out empty lists
    filtered_data = {key: value for key, value in converted_data.items() if value}

    if not filtered_data:
        print("No valid data to plot shareholding chart.")
        return None

    # Determine the number of subplots
    num_plots = len(filtered_data)
    rows = (num_plots + 2) // 3 # For 2x3 grid, ensure enough rows

    # Create subplots based on the number of non-empty data lists
    fig = make_subplots(
        rows=rows, cols=3,
        subplot_titles=list(filtered_data.keys())
    )

    # Plot each non-empty dataset
    for i, (key, values) in enumerate(filtered_data.items(), start=1):
        row = (i - 1) // 3 + 1
        col = (i - 1) % 3 + 1

        fig.add_trace(
            go.Scatter(x=list(range(1, len(values) + 1)), y=values, mode='lines+markers',
                    name=key, line=dict(width=2)),
            row=row, col=col
        )

        fig.update_xaxes(title_text=key, row=row, col=col)
        fig.update_yaxes(title_text="Net Profit" if key in ["Quarter", "Yearly"] else "Holding (%)", row=row, col=col)

    # Update layout
    fig.update_layout(
        height=rows * 400,
        title_text="Financial Data Analysis",
        title_x=0.5,
        showlegend=False,
        template='plotly_white',
        margin=dict(l=0, r=0, t=50, b=0),
        xaxis=dict(automargin=True),
        yaxis=dict(automargin=True)
    )
    
    return fig