import { Bell, Search, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

function Navbar() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-card/10 backdrop-blur-sm z-10 sticky top-0">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search patients, beds, or alerts..."
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-400 font-mono text-sm border-r border-white/10 pr-6">
                    <Clock className="w-4 h-4" />
                    {time.toLocaleTimeString()}
                </div>

                <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-background animate-pulse"></span>
                </button>

                <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                    <div className="text-right">
                        <p className="text-sm font-medium">ICU Unit A</p>
                        <p className="text-xs text-primary font-medium uppercase">Active Shift</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
