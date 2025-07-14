import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const StockScreener: React.FC = () => {
  const [nifty500Stocks, setNifty500Stocks] = useState<string[]>([]);
  const [microcap250Stocks, setMicrocap250Stocks] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [stockDetails, setStockDetails] = useState<any>(null);
  const [candlestickChart, setCandlestickChart] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'nifty500' | 'microcap250'>('nifty500');
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchStocks = async (url: string, setStocks: React.Dispatch<React.SetStateAction<string[]>>) => {
    setLoading(true);
    setProgress(0);
    setStatus('Starting scan...');
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get reader from response body.');
      }
      const decoder = new TextDecoder();
      let receivedData = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (receivedData.trim() !== '') {
            try {
              const update = JSON.parse(receivedData);
              if (update.stocks) {
                setStocks(update.stocks);
              }
            } catch (parseError) {
              console.warn('Failed to parse final JSON chunk:', receivedData, parseError);
            }
          }
          break;
        }
        receivedData += decoder.decode(value, { stream: true });
        const lines = receivedData.split('\n');
        receivedData = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          try {
            const update = JSON.parse(line);
            if (update.progress !== undefined) {
              setProgress(update.progress);
              setStatus(update.status);
            } else if (update.stocks) {
              setStocks(update.stocks);
            }
          } catch (parseError) {
            console.warn('Failed to parse JSON line:', line, parseError);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch data: ${err instanceof Error ? err.message : String(err)}`);
    }
    setLoading(false);
    setProgress(0);
    setStatus('');
  };

  const fetchNifty500 = () => fetchStocks('/api/stock-screener/nifty500', setNifty500Stocks);
  const fetchMicrocap250 = () => fetchStocks('/api/stock-screener/microcap250', setMicrocap250Stocks);

  useEffect(() => {
    const fetchAllDetails = async (symbol: string) => {
      setLoadingDetails(true);
      setError(null);
      setStockDetails(null);
      setCandlestickChart(null);
      console.log(`Fetching details for ${symbol}...`);
      console.log("Starting fetchAllDetails...");

      try {
        console.log("Attempting to fetch stock details and candlestick chart...");
        const results = await Promise.allSettled([
          fetch(`/api/stock-screener/details/${symbol}`),
          fetch(`/api/stock-screener/candlestick-chart/${symbol}`)
        ]);
        console.log("Promise.allSettled results:", results);

        if (results[0].status === 'fulfilled' && results[0].value.ok) {
          console.log("Fetching details JSON...");
          const detailsData = await results[0].value.json();
          setStockDetails(detailsData);
          console.log('Stock details fetched:', detailsData);
        } else {
          const errorReason = results[0].status === 'rejected' ? results[0].reason : `HTTP Error: ${results[0].value.status} ${results[0].value.statusText}`;
          console.error('Failed to fetch stock details:', errorReason);
          setError(`Failed to fetch stock details: ${errorReason}`);
        }

        if (results[1].status === 'fulfilled' && results[1].value.ok) {
          console.log("Fetching candlestick chart Blob...");
          const candlestickBlob = await results[1].value.blob();
          setCandlestickChart(URL.createObjectURL(candlestickBlob));
          console.log('Candlestick chart Blob and URL:', candlestickBlob, URL.createObjectURL(candlestickBlob));
        } else {
          const reason = results[1].status === 'rejected' ? results[1].reason : 'Candlestick endpoint failed';
          console.error('Failed to fetch candlestick chart:', reason);
          setError(`Failed to fetch candlestick chart: ${reason}`); // Add error setting for chart fetch
        }

      } catch (err) {
        console.error('Error in Promise.allSettled block:', err);
        setError('An unexpected error occurred while fetching data.');
      } finally {
        console.log("Finished fetchAllDetails. Setting loadingDetails to false.");
        setLoadingDetails(false);
      }
    };

    if (selectedStock) {
      fetchAllDetails(selectedStock);
    }
  }, [selectedStock]);

  const safeParseJson = (jsonString: string | null | undefined) => {
    if (typeof jsonString !== 'string') {
      return { data: [], layout: {} };
    }
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return { data: [], layout: {} };
    }
  };

  const metricIcons: Record<string, JSX.Element> = {
    'Current Price': <span className="inline-block mr-2 text-violet-400">₹</span>,
    'Market Cap': <span className="inline-block mr-2 text-emerald-400">🏢</span>,
    'PE': <span className="inline-block mr-2 text-blue-400">📈</span>,
    'ROE': <span className="inline-block mr-2 text-pink-400">💡</span>,
    'ROCE': <span className="inline-block mr-2 text-yellow-400">⭐</span>,
  };

  const renderDetails = () => {
    if (loadingDetails) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-violet-500/30 to-slate-700/30 blur-xl mb-6"></div>
          <div className="w-2/3 h-8 bg-slate-700/60 rounded mb-4"></div>
          <div className="w-1/2 h-6 bg-slate-700/50 rounded mb-2"></div>
          <div className="w-1/3 h-6 bg-slate-700/40 rounded"></div>
          <p className="text-violet-400 text-lg mt-8 animate-pulse">Loading Stock Details...</p>
        </div>
      );
    }

    if (error && !stockDetails) {
      return (
        <div className="text-center mt-8">
          <p className="text-red-500 text-lg font-semibold bg-slate-800/80 rounded-lg p-6 shadow-xl border border-red-700/30 inline-block">{error}</p>
        </div>
      );
    }

    if (!stockDetails) {
      return (
        <div className="text-center mt-8">
          <p className="text-slate-400 text-lg">No details available for the selected stock.</p>
        </div>
      );
    }

    return (
      <motion.div 
        className="relative mt-8 rounded-3xl p-1 bg-gradient-to-br from-violet-700/60 via-slate-800/80 to-slate-900/80 shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="backdrop-blur-xl bg-slate-900/80 rounded-3xl p-8">
          <h2 className="text-5xl font-extrabold mb-8 text-violet-400 text-center tracking-tight drop-shadow-lg">
            {selectedStock}
          </h2>

          {/* Candlestick Chart */}
          <motion.div 
            className="mb-10 bg-gradient-to-br from-violet-800/40 to-slate-800/60 rounded-2xl shadow-xl flex items-center justify-center min-h-[320px] border border-violet-700/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {candlestickChart ? (
              <img src={candlestickChart} alt={`${selectedStock} candlestick chart`} className="max-w-full h-auto rounded-xl shadow-lg border border-slate-700/40" />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full py-12">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500/30 to-slate-700/30 blur-xl mb-4 animate-pulse"></div>
                <p className="text-slate-400 text-lg">Candlestick chart not available.</p>
              </div>
            )}
          </motion.div>

          {/* Fundamentals */}
          {stockDetails.fundamentals && typeof stockDetails.fundamentals === 'object' && (
            <motion.div 
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-3xl font-bold mb-6 text-slate-100 flex items-center gap-2">
                <span className="inline-block w-2 h-8 bg-gradient-to-b from-violet-500 to-violet-800 rounded-full mr-3"></span>
                Fundamentals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {Object.entries(stockDetails.fundamentals).filter(([key]) => 
                  ['Company Name', 'Current Price', 'Market Cap', 'PE', 'ROE', 'ROCE'].includes(key)
                ).map(([key, value]) => (
                  <motion.div 
                    key={key} 
                    className="bg-slate-800/80 p-6 rounded-2xl shadow-md border border-slate-700/40 flex flex-col items-start gap-2 hover:shadow-violet-700/30 transition-shadow duration-300"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + Object.keys(stockDetails.fundamentals).indexOf(key) * 0.05 }}
                  >
                    <span className="text-2xl">
                      {metricIcons[key] || null}
                    </span>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-slate-50 text-2xl font-bold">
                      {String(value)}
                    </p>
                  </motion.div>
                ))}
              </div>
              {stockDetails.fundamentals['About'] && (
                <motion.div
                  className="bg-slate-800/80 p-6 rounded-2xl shadow-md border border-slate-700/40 mt-4 prose prose-invert max-w-none"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + Object.keys(stockDetails.fundamentals).length * 0.05 }}
                >
                  <h4 className="text-xl font-bold mb-2 text-violet-300">About</h4>
                  <p className="text-slate-50 text-lg font-medium">{String(stockDetails.fundamentals['About'])}</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Shareholding Analysis */}
          {stockDetails.shareholding_chart && (
            <motion.div 
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-3xl font-bold mb-6 text-slate-100 flex items-center gap-2">
                <span className="inline-block w-2 h-8 bg-gradient-to-b from-emerald-400 to-violet-700 rounded-full mr-3"></span>
                Shareholding Analysis
              </h3>
              <div className="bg-slate-800/80 rounded-2xl p-6 shadow-inner flex justify-center border border-slate-700/40">
                <Plot
                  data={safeParseJson(stockDetails.shareholding_chart).data}
                  layout={safeParseJson(stockDetails.shareholding_chart).layout}
                  style={{ width: '100%', height: 'auto' }}
                  useResizeHandler={true}
                  config={{ displayModeBar: false }}
                />
              </div>
            </motion.div>
          )}

          {/* News */}
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-3xl font-bold mb-6 text-slate-100 flex items-center gap-2">
              <span className="inline-block w-2 h-8 bg-gradient-to-b from-yellow-400 to-violet-700 rounded-full mr-3"></span>
              Latest News
            </h3>
            {Array.isArray(stockDetails.news) && stockDetails.news.length > 0 ? (
              <div className="bg-slate-800/80 rounded-2xl p-6 max-h-80 overflow-y-auto custom-scrollbar shadow-inner">
                <ul className="space-y-4">
                  {stockDetails.news.map((article: any, index: number) => (
                    <motion.li 
                      key={index} 
                      className="border-b border-slate-700/40 pb-4 last:border-b-0 hover:bg-slate-700/40 rounded-lg transition-colors duration-200 px-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    >
                      <a 
                        href={String(article.url)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-violet-300 hover:text-violet-400 font-semibold text-lg flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {String(article.title)}
                      </a>
                      <div className="flex gap-2 mt-1">
                        <span className="bg-violet-700/30 text-violet-200 text-xs px-2 py-1 rounded-full font-medium">
                          {String(article.publisher)}
                        </span>
                        <span className="bg-slate-700/40 text-slate-300 text-xs px-2 py-1 rounded-full font-medium">
                          {new Date(String(article.publishedDate)).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-slate-400">No news available for this stock.</p>
            )}
          </motion.div>

          {/* AI Analysis */}
          {stockDetails.analysis && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-8"
            >
              <h3 className="text-4xl font-extrabold mb-8 text-pink-400 flex items-center gap-3 tracking-tight drop-shadow-lg">
                <span className="inline-block w-2 h-10 bg-gradient-to-b from-pink-400 to-violet-700 rounded-full mr-2"></span>
                AI Analysis
              </h3>
              <div className="bg-gradient-to-br from-pink-900/40 via-violet-900/60 to-slate-900/80 rounded-3xl p-8 shadow-2xl border border-pink-500/30 prose prose-invert max-w-none relative overflow-hidden">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => {
                      if (
                        props.children &&
                        Array.isArray(props.children) &&
                        typeof props.children[0] === 'string' &&
                        props.children[0].startsWith('<think>')
                      ) {
                        const content = props.children[0].replace(/^<think>|<\/think>$/g, '');
                        return (
                          <details className="group bg-pink-900/30 border border-pink-400/30 rounded-xl p-4 my-4 transition-all duration-300 shadow-lg">
                            <summary className="flex items-center gap-2 cursor-pointer font-semibold text-pink-300 text-lg select-none outline-none focus:ring-2 focus:ring-pink-400/50 transition-all duration-200">
                              <svg className="w-5 h-5 text-pink-300 group-open:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                              Thought Process
                            </summary>
                            <div className="mt-3 text-pink-100 text-base leading-relaxed">
                              {content}
                            </div>
                          </details>
                        );
                      }
                      return <p {...props} />;
                    },
                  }}
                >
                  {stockDetails.analysis}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 py-20">
      <div className="container mx-auto px-6">
        <motion.h1 
          className="text-5xl font-bold mb-12 text-center text-slate-50"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Stock Screener
        </motion.h1>

        {/* Show global error if present */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        {loading && (
          <div className="relative z-10 mb-4">
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div 
                className="bg-violet-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
            <p className="text-center text-violet-400 text-sm mt-2">{status}</p>
          </div>
        )}

        

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setActiveTab('nifty500')}
            className={`px-6 py-3 rounded-l-lg font-medium transition-colors duration-300
              ${activeTab === 'nifty500' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            NIFTY 500 Breakouts
          </button>
          <button
            onClick={() => setActiveTab('microcap250')}
            className={`px-6 py-3 rounded-r-lg font-medium transition-colors duration-300
              ${activeTab === 'microcap250' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            NIFTY Microcap 250 Breakouts
          </button>
        </div>

        {/* Main content and sidebar: sidebar on the right wall */}
        <div className="flex flex-col lg:flex-row-reverse gap-8">
          {/* Right Sidebar for Scan button and Stock List - stick to far right */}
          <motion.div
            className="order-last lg:order-none lg:w-1/3 bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-700/60 lg:h-[calc(100vh-180px)] flex flex-col lg:ml-auto lg:mr-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Always show heading at the top of sidebar */}
            <div className="mb-4">
              <h2 className="text-2xl font-extrabold text-violet-400 tracking-tight drop-shadow-lg">
                {activeTab === 'nifty500' ? 'NIFTY 500 Stocks' : 'NIFTY Microcap 250 Stocks'}
              </h2>
            </div>
            {/* Scan button below heading */}
            <div className="mb-6 flex justify-center">
              <button
                onClick={activeTab === 'nifty500' ? fetchNifty500 : fetchMicrocap250}
                className="bg-gradient-to-r from-violet-600 to-violet-800 text-white px-8 py-2 rounded-xl shadow-md hover:from-violet-700 hover:to-violet-900 transition-all duration-300 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50"
                disabled={loading}
              >
                {loading ? 'Scanning...' : 'Scan'}
              </button>
            </div>
            {/* Beautiful stock list below scan button */}
            <div className="flex-grow overflow-y-auto custom-scrollbar lg:max-h-[calc(100vh-300px)]">
              <div className="bg-slate-900/60 rounded-2xl shadow-inner border border-slate-700/40 p-4">
                {(activeTab === 'nifty500' ? nifty500Stocks : microcap250Stocks).length > 0 ? (
                  <ul className="space-y-3">
                    {(activeTab === 'nifty500' ? nifty500Stocks : microcap250Stocks).map((stock) => (
                      <motion.li
                        key={stock}
                        onClick={() => setSelectedStock(stock)}
                        className={`cursor-pointer px-4 py-3 rounded-xl flex items-center font-semibold text-lg transition-all duration-200 border border-transparent shadow-sm backdrop-blur-md
                          ${selectedStock === stock
                            ? 'bg-gradient-to-r from-violet-700/80 to-violet-900/80 text-white border-violet-500/60 shadow-lg scale-105'
                            : 'bg-slate-800/60 text-violet-200 hover:bg-violet-700/30 hover:text-white hover:scale-105 border-slate-700/40'}
                        `}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="truncate w-full">{stock}</span>
                        {selectedStock === stock && (
                          <span className="ml-2 w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                ) : !loading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-500/30 to-slate-700/30 blur-xl mb-4"></div>
                    <p className="text-slate-400 text-lg">No stocks found matching the criteria.</p>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>

          {/* Main Content Area for Stock Details */}
          <div className="lg:w-2/3">
            {selectedStock ? renderDetails() : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockScreener;