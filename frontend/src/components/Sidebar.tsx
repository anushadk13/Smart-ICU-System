import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Bell, BarChart2, Settings, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
    { label: 'Dashboard', icon: Home, path: '/' },
    { label: 'Patients', icon: Users, path: '/patients' },
    { label: 'Alerts', icon: Bell, path: '/alerts' },
    { label: 'Analytics', icon: BarChart2, path: '/analytics' },
    { label: 'Settings', icon: Settings, path: '/settings' },
];

function Sidebar() {
    const location = useLocation();

    return (
        <aside className="w-64 bg-card border-r border-white/5 flex flex-col h-full">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg">
                    <Activity className="text-primary w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Smart ICU
                </h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={twMerge(
                                clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                )
                            )}
                        >
                            <Icon className={clsx("w-5 h-5", isActive ? "text-primary" : "group-hover:text-white")} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Logged in as</p>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-white">
                            DR
                        </div>
                        <div>
                            <p className="text-sm font-medium">Dr. Anusha</p>
                            <p className="text-xs text-slate-500">Chief Physician</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
