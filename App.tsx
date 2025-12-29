
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './views/Home';
import { Wallet } from './views/Wallet';
import { Admin } from './views/Admin';
import { GamesList } from './views/GamesList';
import { MinesGame } from './views/games/MinesGame';
import { CrashGame } from './views/games/CrashGame';
import { SlotsGame } from './views/games/SlotsGame';
import { CoinFlipGame } from './views/games/CoinFlipGame';
import { DiceGame } from './views/games/DiceGame';
import { RouletteGame } from './views/games/RouletteGame';
import { KenoGame } from './views/games/KenoGame';
import { HiLoGame } from './views/games/HiLoGame';
import { View, GameSettings } from './types';
import { supabase } from './lib/supabase';
import { Smartphone, Zap } from 'lucide-react';
import { DiscordSDK } from "@discord/embedded-app-sdk";

// Telegram types workaround
declare global {
  interface Window {
    Telegram: any;
  }
}

// Твой Client ID из Discord Developer Portal
const DISCORD_CLIENT_ID = "1455322242534736076";

function App() {
  const [balance, setBalance] = useState<number>(0);
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings[]>([]);
  const [isDiscordEnv, setIsDiscordEnv] = useState(false);

  // Проверка: запущен ли сайт локально
  const isDev = (import.meta as any).env?.DEV;

  useEffect(() => {
    const initApp = async () => {
      try {
        let userToSync = null;

        // --- 1. ЛОКАЛЬНЫЙ РЕЖИМ (DEV) ---
        if (isDev) {
          console.log("🚀 Running in DEV mode");
          userToSync = { 
            id: 1464327605, // ID Админа
            first_name: 'DevAdmin', 
            username: 'admin',
            photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'
          };
          setIsAuthorized(true);
        } 
        
        // --- 2. РЕЖИМ TELEGRAM (ИСПРАВЛЕНО) ---
        else if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();
          try { tg.expand(); } catch (e) {}
          tg.setHeaderColor('#050505');
          tg.setBackgroundColor('#050505');

          // Мы всегда считаем, что мы в Телеграме, если есть объект WebApp.
          // Не блокируем по платформе, так как она может быть 'unknown' в вебе.
          setIsAuthorized(true);

          if (tg.initDataUnsafe?.user) {
             userToSync = tg.initDataUnsafe.user;
          } else {
             // Если данных пользователя нет (например, открыто по прямой ссылке в браузере),
             // создаем гостевой профиль, чтобы игра не ломалась.
             console.warn("Telegram User data missing, using Guest");
             let storedGuestId = localStorage.getItem('guest_id');
             if (!storedGuestId) {
                storedGuestId = Math.floor(Math.random() * 1000000).toString();
                localStorage.setItem('guest_id', storedGuestId);
             }
             userToSync = {
                id: Number(storedGuestId),
                first_name: 'Guest Player',
                username: 'guest',
                photo_url: ''
             };
          }
        }

        // --- 3. РЕЖИМ DISCORD ---
        const isDiscord = document.referrer.includes('discord.com');
        if (isDiscord) {
            setIsDiscordEnv(true);
            setIsAuthorized(true); // Разрешаем доступ сразу
            
            try {
                const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);
                await discordSdk.ready();
                
                let storedId = localStorage.getItem('discord_dummy_id');
                if (!storedId) {
                    storedId = Math.floor(100000000 + Math.random() * 900000000).toString();
                    localStorage.setItem('discord_dummy_id', storedId);
                }

                userToSync = {
                    id: Number(storedId), 
                    first_name: 'Discord Guest',
                    username: `gamer_${storedId.slice(-4)}`,
                    photo_url: '' 
                };
            } catch (e) {
                console.error("Discord Auth Failed", e);
                // Fallback для Дискорда
                userToSync = {
                    id: 999999999,
                    first_name: 'Discord User',
                    username: 'discord_fallback',
                    photo_url: ''
                };
            }
        }

        // --- СИНХРОНИЗАЦИЯ С БАЗОЙ ---
        if (userToSync) {
            setUser(userToSync);
            
            // Вызываем RPC функцию init_user
            const { data, error } = await supabase.rpc('init_user', {
                p_telegram_id: userToSync.id,
                p_username: userToSync.username || 'user',
                p_first_name: userToSync.first_name || 'Gamer',
                p_photo_url: userToSync.photo_url || ''
            });

            if (error) {
                console.error("Auth Error:", error);
                setBalance(1000); // Даем стартовый баланс если база недоступна
            } else if (data) {
                setBalance(Number(data.balance));
            }
        } else if (!isDev && !window.Telegram?.WebApp && !isDiscord) {
            // Если мы вообще не в приложении, то авторизации нет
            setIsAuthorized(false);
        }

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('next') === 'admin') {
            setCurrentView(View.ADMIN);
        }
        
        // Грузим настройки тихо, не блокируя UI
        fetchGameSettings();
        setLoading(false);

      } catch (err: any) {
        console.error("App Init Error:", err);
        setError(err.message);
        setLoading(false);
        // В случае критической ошибки инициализации все равно пускаем в игру
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
    const predictedBalance = balance - bet + win;
    setBalance(predictedBalance);

    if (user?.id) {
       const { data: newServerBalance, error } = await supabase.rpc('finish_game', {
          p_telegram_id: user.id,
          p_game: game,
          p_bet: bet,
          p_win: win,
          p_coefficient: coefficient
       });

       if (!error && newServerBalance !== null) {
           setBalance(Number(newServerBalance));
       }
    }
  };

  const getSettings = (id: string) => {
      return gameSettings.find(s => s.game_id === id) || { win_chance: 0.5, min_mult: 1, max_mult: 100, game_id: id };
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Zap size={48} className="text-brand animate-bounce" fill="currentColor" />
           <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-brand animate-[loading_1s_ease-in-out_infinite] w-1/2"></div>
           </div>
        </div>
      </div>
    );
  }

  // Экран "Только мобилка" показываем ТОЛЬКО если мы точно не в контексте приложения
  if (!isAuthorized) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(220,38,38,0.4)] animate-pulse">
          <Smartphone size={48} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-display font-black mb-2 uppercase tracking-tighter">Mobile Only</h1>
        <p className="text-gray-400 max-w-xs mx-auto mb-8">
          Откройте приложение через Telegram бот или Discord Activity.
        </p>
        <button 
          onClick={() => window.location.href = 'https://t.me/VihtGameBot'}
          className="bg-brand hover:bg-brand-dark px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand/20"
        >
           Запустить Бота
        </button>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case View.HOME:
        return <Home setView={setCurrentView} userId={user?.id} />;
      case View.GAMES_LIST:
        return <GamesList setView={setCurrentView} />;
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
        return <Home setView={setCurrentView} userId={user?.id} />;
    }
  };

  return (
    <Layout 
      balance={balance} 
      currentView={currentView} 
      setView={setCurrentView}
      user={user} 
    >
      {renderView()}
    </Layout>
  );
}

export default App;
