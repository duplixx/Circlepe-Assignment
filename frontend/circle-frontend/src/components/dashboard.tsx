import { useEffect, useState } from 'react';
import { Button } from './ui/button';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trades', {
        headers: {
          'x-auth-token': localStorage.getItem('token') || '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTrades(data);
      } else {
        console.error('Failed to fetch trades');
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
      {trades.length > 0 ? (
        <ul>
          {trades.map((trade: any) => (
            <li key={trade.TradeID} className="mb-2">
              Trade ID: {trade.TradeID}, Date: {new Date(trade.Date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No trades found.</p>
      )}
      <Button onClick={onLogout} className="mt-4">Logout</Button>
    </div>
  );
}