'use client';

import { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, FileText, Trash2 } from 'lucide-react';
import { uploadDocument, deleteDocumentAction } from '@/lib/actions/documents';
import { DocumentType } from '@/types/documents';

interface DocumentUploadProps {
    type: DocumentType;
    label: string;
    description: string;
    existingDocs?: Array<{
        id: string;
        file_name: string;
        verified: boolean;
    }>;
    targetUserId?: string;
}

export default function DocumentUpload({ type, label, description, existingDocs = [], targetUserId }: DocumentUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const hasDocs = existingDocs.length > 0;
    const maxFiles = type === 'RESIDENCE_PERMIT' ? 2 : 1;
    const showUpload = existingDocs.length < maxFiles;
    const allDocsUploaded = existingDocs.length === maxFiles;

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Le fichier dépasse la limite de 5Mo.");
            return;
        }

        setUploading(true);
        setProgress(10);
        setError(null);

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 15;
            });
        }, 400);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        if (targetUserId) {
            formData.append('targetUserId', targetUserId);
        }

        try {
            const result = await uploadDocument(formData);
            clearInterval(interval);
            setProgress(100);

            if (result.error) {
                setError(result.error);
            }
        } catch (err) {
            clearInterval(interval);
            setError("Une erreur inattendue est survenue.");
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce document ?")) return;
        setUploading(true);
        setError(null);
        try {
            const result = await deleteDocumentAction(docId);
            if (result.error) {
                setError(result.error);
            }
        } catch (err) {
            setError("Erreur lors de la suppression du document.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`glass p-6 rounded-3xl border transition-all duration-300 ${
            allDocsUploaded ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-emerald-500/5 hover:border-emerald-500/20'
        }`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-main uppercase tracking-tight mb-1 flex items-center gap-2">
                        {label}
                        {allDocsUploaded && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </h3>
                    <p className="text-xs text-dim opacity-70 leading-relaxed">
                        {description}
                    </p>
                </div>
                {allDocsUploaded ? (
                    <div className="bg-emerald-500/10 p-3 rounded-2xl shrink-0 ml-4">
                        <FileText className="w-6 h-6 text-emerald-500" />
                    </div>
                ) : (
                    <div className="bg-emerald-500/5 p-3 rounded-2xl shrink-0 ml-4">
                        <Upload className="w-6 h-6 text-dim" />
                    </div>
                )}
            </div>

            {/* List of existing uploaded documents */}
            {hasDocs && (
                <div className="space-y-2 mb-4">
                    {existingDocs.map((doc) => (
                        <div key={doc.id} className="flex justify-between items-center bg-[#0b0f0d]/35 p-3 rounded-2xl border border-emerald-500/5">
                            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                                <div className="bg-emerald-500/10 p-2 rounded-xl shrink-0">
                                    <FileText className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="font-bold text-main block text-xs truncate" title={doc.file_name}>{doc.file_name}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-wider ${
                                        doc.verified ? 'text-emerald-500' : 'text-amber-500'
                                    }`}>
                                        {doc.verified ? "Vérifié" : "En attente"}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(doc.id)}
                                disabled={uploading}
                                className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50 shrink-0"
                                title="Supprimer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 text-[11px] text-red-500 font-bold uppercase tracking-widest bg-red-500/5 p-3 rounded-xl border border-red-500/10 mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* File Upload Dropzone / Button */}
            {showUpload && (
                <label className="block w-full">
                    <div className={`btn-premium py-4 flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {uploading && (
                            <div 
                                className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                style={{ width: `${progress}%` }} 
                            />
                        )}
                        {uploading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Envoi... {Math.round(progress)}%</span>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {hasDocs ? "Charger le deuxième fichier (Recto/Verso)" : "Télécharger le document"}
                                </span>
                            </>
                        )}
                    </div>
                    <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="application/pdf,image/*" />
                </label>
            )}
        </div>
    );
}
