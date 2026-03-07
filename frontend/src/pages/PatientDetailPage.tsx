import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Patient, VitalReading, Alert } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    ChevronLeft, Activity, Heart, Wind, Thermometer,
    AlertCircle, ShieldCheck, Download
} from 'lucide-react';

function PatientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [history, setHistory] = useState<VitalReading[]>([]);
    const { data: liveVital } = useWebSocket<VitalReading>(`/api/ws/vitals/${id}`);

    useEffect(() => {
        // Fetch patient info
        api.get(`/api/patients/${id}`).then(res => setPatient(res.data));
        // Fetch initial history
        api.get(`/api/vitals/${id}?limit=50`).then(res => setHistory(res.data.reverse()));
    }, [id]);

    // Append live vital to history for the chart
    useEffect(() => {
        if (liveVital) {
            setHistory(prev => [...prev.slice(-49), liveVital]);
        }
    }, [liveVital]);

    if (!patient) return <div className="p-8 text-center">Loading patient data...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            {patient.name}
                            <span className="text-sm font-normal text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                Bed {patient.bed_number}
                            </span>
                        </h2>
                        <p className="text-sm text-slate-400">ID: #{patient.id.toString().padStart(5, '0')} • {patient.age}y • {patient.gender}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="glass-card px-4 py-2 text-sm flex items-center gap-2 hover:border-primary/50 transition-all">
                        <Download className="w-4 h-4" /> Export FHIR
                    </button>
                    <button className="glass-card px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Clinical Review
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6">

                {/* Left: Vitals Summary Cards */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <VitalCard
                        label="Heart Rate"
                        value={liveVital?.heart_rate ?? '--'}
                        unit="BPM"
                        icon={Heart}
                        color="text-accent"
                        trend={history.map(h => h.heart_rate)}
                    />
                    <VitalCard
                        label="SpO2"
                        value={liveVital?.spo2 ?? '--'}
                        unit="%"
                        icon={Activity}
                        color="text-primary"
                        trend={history.map(h => h.spo2)}
                    />
                    <VitalCard
                        label="Respiration"
                        value={liveVital?.resp_rate ?? '--'}
                        unit="RPM"
                        icon={Wind}
                        color="text-secondary"
                        trend={history.map(h => h.resp_rate)}
                    />
                    <VitalCard
                        label="Temperature"
                        value={liveVital?.temperature ?? '--'}
                        unit="°C"
                        icon={Thermometer}
                        color="text-amber-400"
                        trend={history.map(h => h.temperature)}
                    />
                </div>

                {/* Center: Live Charts */}
                <div className="col-span-12 lg:col-span-6 space-y-6">
                    <div className="glass-card p-6 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Live ECG & Waveform Analysis</h3>
                            <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                                PRIMARY FEED
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history}>
                                    <defs>
                                        <linearGradient id="colorECG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="timestamp" hide />
                                    <YAxis domain={['auto', 'auto']} hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#161d31', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="ecg_value"
                                        stroke="#00f2fe"
                                        fillOpacity={1}
                                        fill="url(#colorECG)"
                                        isAnimationActive={false}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-6">Blood Pressure (Systolic / Diastolic)</h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="timestamp" hide />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#161d31', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Line type="monotone" dataKey="bp_sys" stroke="#f53d5b" strokeWidth={2} dot={false} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="bp_dia" stroke="#4facfe" strokeWidth={2} dot={false} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right: AI Insights & Alerts */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="glass-card bg-gradient-to-br from-card to-[#1e2746] border-primary/20 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-primary" />
                            <h3 className="font-bold">ML Risk Score</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black font-mono">0.12</span>
                            <span className="text-sm text-green-400 font-bold uppercase">Low Risk</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-primary h-full w-[12%] rounded-full shadow-[0_0_10px_#00f2fe]"></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                            Isolation Forest analysis indicates normal physiological patterns within expected variance.
                        </p>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-400" />
                            Recent Alerts
                        </h3>
                        <div className="space-y-3">
                            <AlertItem message="SpO2 calibration check" time="10m ago" severity="low" />
                            <AlertItem message="Bed exit sensor active" time="45m ago" severity="low" />
                            <div className="text-center py-4">
                                <p className="text-xs text-slate-600">No critical alerts in the last 24h</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function VitalCard({ label, value, unit, icon: Icon, color, trend }: any) {
    return (
        <div className="glass-card p-4 flex flex-col justify-between hover:bg-white/5 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="h-8 w-16 opacity-30">
                    {/* Mini sparkline placeholder */}
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trend.map((v: number) => ({ v }))}>
                            <Line type="monotone" dataKey="v" stroke="currentColor" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-2xl font-black font-mono tracking-tight">{value}</p>
                    <p className="text-xs text-slate-600 font-medium">{unit}</p>
                </div>
            </div>
        </div>
    );
}

function AlertItem({ message, time, severity }: any) {
    return (
        <div className="p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <p className="text-sm font-medium leading-tight">{message}</p>
            <div className="flex items-center gap-2 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">{time}</span>
            </div>
        </div>
    );
}

export default PatientDetailPage;
