import { Link } from 'react-router-dom';
import { Patient, VitalReading } from '../types';
import { useSSE } from '../hooks/useSSE';
import { Activity, Heart, Thermometer, Wind } from 'lucide-react';
import { clsx } from 'clsx';

function PatientCard({ patient }: { patient: Patient }) {
    const { data: latestVitals } = useSSE<VitalReading>(`/api/stream/vitals/${patient.id}`);

    const statusColors = {
        Stable: 'bg-green-500/10 text-green-400 border-green-500/20',
        Critical: 'bg-accent/10 text-accent border-accent/20',
        Recovering: 'bg-primary/10 text-primary border-primary/20',
    };

    return (
        <Link
            to={`/patient/${patient.id}`}
            className="glass-card group hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="p-5">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className={clsx("text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border", statusColors[patient.status])}>
                            {patient.status}
                        </span>
                        <h3 className="text-xl font-bold mt-2 group-hover:text-primary transition-colors">{patient.name}</h3>
                        <p className="text-sm text-slate-500">Bed {patient.bed_number} • {patient.age} yrs • {patient.gender}</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                        <Activity className="w-5 h-5 text-slate-400" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Heart className="w-3.5 h-3.5 text-accent" />
                            <span className="text-[10px] font-bold uppercase">Heart Rate</span>
                        </div>
                        <p className="text-2xl font-mono font-bold">
                            {latestVitals?.heart_rate ?? '--'} <span className="text-sm font-normal text-slate-600">BPM</span>
                        </p>
                    </div>

                    <div className="space-y-1 text-right">
                        <div className="flex items-center gap-1.5 text-slate-500 justify-end">
                            <Activity className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-bold uppercase">SpO2</span>
                        </div>
                        <p className="text-2xl font-mono font-bold">
                            {latestVitals?.spo2 ?? '--'}%
                        </p>
                    </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Wind className="w-3.5 h-3.5" />
                        <span>{latestVitals?.resp_rate ?? '--'} rpm</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Thermometer className="w-3.5 h-3.5" />
                        <span>{latestVitals?.temperature ?? '--'}°C</span>
                    </div>
                </div>
            </div>

            {/* Real-time pulse indicator */}
            <div className="h-1 w-full bg-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-primary/40 w-1/3 animate-[shimmer_2s_infinite]"></div>
            </div>
        </Link>
    );
}

export default PatientCard;
