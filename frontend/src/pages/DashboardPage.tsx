import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Patient } from '../types';
import PatientCard from '../components/PatientCard';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';

function DashboardPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/patients')
            .then(res => setPatients(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const stats = [
        { label: 'Total Patients', value: patients.length, icon: Activity, color: 'text-primary' },
        { label: 'Critical Care', value: patients.filter(p => p.status === 'Critical').length, icon: AlertTriangle, color: 'text-accent' },
        { label: 'Stable', value: patients.filter(p => p.status === 'Stable').length, icon: CheckCircle, color: 'text-green-400' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Clinical Overview</h2>
                    <p className="text-slate-400 mt-1">Real-time monitoring for all active ICU beds.</p>
                </div>
                <div className="flex gap-4">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="glass-card flex items-center gap-4 px-6 py-4">
                                <div className={`${stat.color} bg-white/5 p-3 rounded-xl`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{stat.label}</p>
                                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {patients.map((patient) => (
                    <PatientCard key={patient.id} patient={patient} />
                ))}
            </div>
        </div>
    );
}

export default DashboardPage;
