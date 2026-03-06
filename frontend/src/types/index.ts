export interface VitalReading {
    patient_id: number;
    heart_rate: number;
    bp_sys: number;
    bp_dia: number;
    spo2: number;
    temperature: number;
    resp_rate: number;
    ecg_value: number;
    timestamp?: string;
}

export interface Patient {
    id: number;
    name: string;
    age: number;
    gender: string;
    bed_number: string;
    status: 'Stable' | 'Critical' | 'Recovering';
    created_at: string;
}

export interface Alert {
    id: number;
    patient_id: number;
    type: string;
    severity: 'Low' | 'Medium' | 'High';
    message: string;
    acknowledged: boolean;
    timestamp: string;
}
