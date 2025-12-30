
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './views/Home';
import { Wallet } from './views/Wallet';
import { Admin } from './views/Admin';
import { GamesList } from './views/GamesList';
import { Shop } from './views/Shop';
import { Leaders } from './views/Leaders';
import { MinesGame } from './views/games/MinesGame';
import { CrashGame } from './views/games/CrashGame';
import { SlotsGame } from './views/games/SlotsGame';
import { CoinFlipGame } from './views/games/CoinFlipGame';
import { DiceGame } from './views/games/DiceGame';
import { RouletteGame } from './views/games/RouletteGame';
import { KenoGame } from './views/games/KenoGame';
import { HiLoGame } from './views/games/HiLoGame';
import { View, GameSettings, ShopItem, Booster } from './types';
import { supabase } from './lib/supabase';
import { Smartphone, Zap } from 'lucide-react';
import { DiscordSDK } from "@discord/embedded-app-sdk";

// Telegram types workaround
declare global {
  interface Window {
    Telegram: any;
  }
}

const DISCORD_CLIENT_ID = "1455322242534736076";

function App() {
  const [balance, setBalance] = useState<number>(0);
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings[]>([]);
  
  // Inventory State (Frontend Mock for now)
  const [activeDecoration, setActiveDecoration] = useState<string>('');
  const [activeBooster, setActiveBooster] = useState<Booster | null>(null);

  const isDev = (import.meta as any).env?.DEV;

  useEffect(() => {
    const initApp = async () => {
      try {
        let userToSync = null;

        if (isDev) {
          userToSync = { 
            id: 1464327605, 
            first_name: 'DevAdmin', 
            username: 'admin',
            photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'
          };
          setIsAuthorized(true);
        } else if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();
          try { tg.expand(); } catch (e) {}
          tg.setHeaderColor('#000000');
          tg.setBackgroundColor('#000000');
          setIsAuthorized(true);
          
          if (tg.initDataUnsafe?.user) {
             userToSync = tg.initDataUnsafe.user;
          } else {
             let storedGuestId = localStorage.getItem('guest_id');
             if (!storedGuestId) {
                storedGuestId = Math.floor(Math.random() * 1000000).toString();
                localStorage.setItem('guest_id', storedGuestId);
             }
             userToSync = { id: Number(storedGuestId), first_name: 'Guest', username: 'guest', photo_url: '' };
          }
        }

        const isDiscord = document.referrer.includes('discord.com');
        if (isDiscord) {
            setIsAuthorized(true);
            try {
                const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);
                await discordSdk.ready();
                let storedId = localStorage.getItem('discord_dummy_id');
                if (!storedId) {
                    storedId = Math.floor(100000000 + Math.random() * 900000000).toString();
                    localStorage.setItem('discord_dummy_id', storedId);
                }
                userToSync = { id: Number(storedId), first_name: 'Discord Guest', username: `gamer_${storedId.slice(-4)}`, photo_url: '' };
            } catch (e) {
                userToSync = { id: 999999999, first_name: 'Discord User', username: 'discord_fallback', photo_url: '' };
            }
        }

        if (userToSync) {
            setUser(userToSync);
            const { data, error } = await supabase.rpc('init_user', {
                p_telegram_id: userToSync.id,
                p_username: userToSync.username || 'user',
                p_first_name: userToSync.first_name || 'Gamer',
                p_photo_url: userToSync.photo_url || ''
            });

            if (!error && data) {
                setBalance(Number(data.balance));
            } else {
                setBalance(1000); 
            }
        }

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('next') === 'admin') setCurrentView(View.ADMIN);
        
        fetchGameSettings();
        setLoading(false);

      } catch (err: any) {
        console.error("App Init Error:", err);
        setLoading(false);
        setIsAuthorized(true); 
      }
    };

    initApp();
  }, [isDev]);

  const fetchGameSettings = async () => {
      const { data } = await supabase.from('game_settings').select('*');
      if (data) setGameSettings(data);
  };

  const handleGameEnd = async (game: string, bet: number, win: number, coefficient: number) => {
    let finalWin = win;
    let finalCoeff = coefficient;

    // --- BOOSTER LOGIC ---
    if (activeBooster) {
        if (win > 0) {
            // If won, check for multiplier booster
            if (activeBooster.id === 'x2_win') {
                finalWin = win * 2;
                finalCoeff = coefficient * 2;
                setActiveBooster(null); // Consume
            } else if (activeBooster.id === 'x3_win') {
                finalWin = win * 3;
                finalCoeff = coefficient * 3;
                setActiveBooster(null); // Consume
            } else if (activeBooster.id === 'x5_win') {
                finalWin = win * 5;
                finalCoeff = coefficient * 5;
                setActiveBooster(null); // Consume
            }
        } else {
            // If lost, check for insurance
            if (activeBooster.id === 'insurance_50') {
                finalWin = bet * 0.5; // Return 50%
                setActiveBooster(null); // Consume
            } else if (activeBooster.id === 'insurance_100') {
                finalWin = bet; // Return 100%
                setActiveBooster(null); // Consume
            } else {
                // If it was a win booster, we keep it for next win (unless we want to burn it on loss?)
                // Let's decide: Win Boosters burn only on win. Insurance burns on loss.
                // Simplified: Win boosters burn on loss too? No, "In every game you choose".
                // Let's keep it simple: Booster stays until used successfully OR we can make it consumable per game attempt.
                // Prompt: "if win takes x3, if lose then no". Implies it's a gamble to USE the booster.
                // So we consume it regardless of result?
                // Let's consume it on ATTEMPT to prevent hoarding.
                setActiveBooster(null);
            }
        }
    }

    const predictedBalance = balance - bet + finalWin;
    setBalance(predictedBalance);

    if (user?.id) {
       const { data: newServerBalance } = await supabase.rpc('finish_game', {
          p_telegram_id: user.id,
          p_game: game,
          p_bet: bet,
          p_win: finalWin,
          p_coefficient: finalCoeff
       });
       if (newServerBalance !== null) setBalance(Number(newServerBalance));
    }
  };

  const handleBuy = (item: ShopItem) => {
      if (balance >= item.cost) {
          setBalance(prev => prev - item.cost);
          
          if (item.type === 'decoration') {
              setActiveDecoration(item.effect || '');
          } else if (item.type === 'booster') {
              setActiveBooster({
                  id: item.id,
                  label: item.name,
                  multiplier: item.id.includes('x2') ? 2 : item.id.includes('x3') ? 3 : 1,
                  saveOnLoss: false
              });
          }
          
          // Sync balance to server (fire and forget for now)
          if(user?.id) {
             supabase.rpc('finish_game', { 
                 p_telegram_id: user.id, p_game: 'Shop', p_bet: item.cost, p_win: 0, p_coefficient: 0 
             });
          }
      }
  };

  const getSettings = (id: string) => {
      return gameSettings.find(s => s.game_id === id) || { win_chance: 0.5, min_mult: 1, max_mult: 100, game_id: id };
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#000000] flex items-center justify-center">
        <Zap size={48} className="text-brand animate-bounce" />
      </div>
    );
  }

  if (!isAuthorized) {
    return <div className="h-screen bg-black text-white flex items-center justify-center">Mobile Only</div>;
  }

  const renderView = () => {
    switch (currentView) {
      case View.HOME:
        return <Home setView={setCurrentView} userId={user?.id} user={user} activeBooster={activeBooster} />;
      case View.GAMES_LIST:
        return <GamesList setView={setCurrentView} />;
      case View.SHOP:
        return <Shop balance={balance} onBuy={handleBuy} activeDecoration={activeDecoration} activeBooster={activeBooster} />;
      case View.LEADERS:
        return <Leaders />;
      case View.CRASH:
        return <CrashGame balance={balance} onGameEnd={handleGameEnd} settings={getSettings('crash')} />;
      case View.MINES:
        return <MinesGame balance={balance} onGameEnd={handleGameEnd} settings={getSettings('mines')} />;
      case View.SLOTS:
        return <SlotsGame balance={balance} onGameEnd={handleGameEnd} settings={getSettings('slots')} />;
      case View.COINFLIP:
        return <CoinFlipGame balance={balance} onGameEnd={handleGameEnd} settings={getSettings('coinflip')} />;
      case View.DICE:
        return <DiceGame balance={balance} onGameEnd={handleGameEnd} settings={getSettings('dice')} />;
      case View.ROULETTE:
        return <RouletteGame balance={balance} onGameEnd={handleGameEnd} settings={getSettings('roulette')} />;
      case View.KENO:
        return <KenoGame balance={balance} onGameEnd={handleGameEnd} settings={getSettings('keno')} />;
      case View.HILO:
        return <HiLoGame balance={balance} onGameEnd={handleGameEnd} settings={getSettings('hilo')} />;
      case View.WALLET:
        return <Wallet />;
      case View.ADMIN:
        return <Admin />;
      default:
        return <Home setView={setCurrentView} userId={user?.id} user={user} activeBooster={activeBooster} />;
    }
  };

  return (
    <Layout 
      balance={balance} 
      currentView={currentView} 
      setView={setCurrentView}
      user={user} 
      activeDecoration={activeDecoration}
    >
      {renderView()}
    </Layout>
  );
}

export default App;
