'use client';

import { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react';
import { uploadDocument } from '@/lib/actions/documents';
import { DocumentType } from '@/types/documents';

interface DocumentUploadProps {
    type: DocumentType;
    label: string;
    description: string;
    existingDoc?: {
        file_name: string;
        verified: boolean;
    };
}

export default function DocumentUpload({ type, label, description, existingDoc }: DocumentUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(!!existingDoc);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Le fichier dépasse la limite de 5Mo.");
            return;
        }

        setUploading(true);
        setProgress(10); // Start progress
        setError(null);

        // Simulated progress interval
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 15;
            });
        }, 400);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            const result = await uploadDocument(formData);
            clearInterval(interval);
            setProgress(100);

            if (result.error) {
                setError(result.error);
                setSuccess(false);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            clearInterval(interval);
            setError("Une erreur inattendue est survenue.");
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    return (
        <div className={`glass p-6 rounded-3xl border transition-all duration-300 ${
            success ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-emerald-500/5 hover:border-emerald-500/20'
        }`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-main uppercase tracking-tight mb-1 flex items-center gap-2">
                        {label}
                        {success && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </h3>
                    <p className="text-xs text-dim opacity-70 leading-relaxed">
                        {description}
                    </p>
                </div>
                {success ? (
                    <div className="bg-emerald-500/10 p-3 rounded-2xl">
                        <FileText className="w-6 h-6 text-emerald-500" />
                    </div>
                ) : (
                    <div className="bg-emerald-500/5 p-3 rounded-2xl">
                        <Upload className="w-6 h-6 text-dim" />
                    </div>
                )}
            </div>

            {success ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                        {existingDoc?.verified ? "Document Vérifié" : "En attente de vérification"}
                    </div>
                    <label className="block w-full">
                        <span className="btn-premium py-2 text-[10px] cursor-pointer block text-center opacity-70 hover:opacity-100">
                            {existingDoc?.verified ? "Mettre à jour le document vérifié" : "Modifier le document"}
                            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="application/pdf,image/*" />
                        </span>
                    </label>
                </div>
            ) : (
                <div className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 text-[11px] text-red-500 font-bold uppercase tracking-widest bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                    <label className="block w-full">
                        <div className={`btn-premium py-4 flex flex-col items-center justify-center gap-3 cursor-pointer relative overflow-hidden ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {uploading && (
                                <div 
                                    className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                    style={{ width: `${progress}%` }} 
                                />
                            )}
                            {uploading ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">Envoi... {Math.round(progress)}%</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Télécharger le document
                                </>
                            )}
                        </div>
                        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="application/pdf,image/*" />
                    </label>
                </div>
            )}
        </div>
    );
}
