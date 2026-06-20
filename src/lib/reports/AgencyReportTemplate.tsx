import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
        borderBottom: '2pt solid #10b981',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#052e16',
    },
    subtitle: {
        fontSize: 10,
        color: '#10b981',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    dateText: {
        fontSize: 9,
        color: '#6b7280',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#052e16',
        backgroundColor: '#f0fdf4',
        padding: 5,
        marginBottom: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    col: {
        flex: 1,
        border: '1pt solid #e5e7eb',
        borderRadius: 6,
        padding: 10,
        marginRight: 8,
        marginBottom: 8,
    },
    label: {
        fontSize: 8,
        color: '#6b7280',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    value: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottom: '1pt solid #f3f4f6',
    },
    textLeft: {
        fontSize: 9,
        color: '#374151',
    },
    textRight: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#111827',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#9ca3af',
        borderTop: '1pt solid #f3f4f6',
        paddingTop: 10,
    }
});

export const AgencyReportDocument = ({ data }: { data: any }) => {
    const today = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>OMRAYANAIR</Text>
                        <Text style={styles.subtitle}>Rapport Général de l'Agence</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={styles.dateText}>Généré le {today}</Text>
                        <Text style={{ fontSize: 8, color: '#6b7280' }}>Statut: Actif</Text>
                    </View>
                </View>

                {/* Section: Synthèse Métriques */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. INDICATEURS DE PERFORMANCE</Text>
                    <View style={styles.grid}>
                        {data.kpis.map((kpi: any, idx: number) => (
                            <View key={idx} style={styles.col}>
                                <Text style={styles.label}>{kpi.label}</Text>
                                <Text style={styles.value}>{kpi.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Section: Logistique */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. ÉTAT LOGISTIQUE (Ratios de complétion)</Text>
                    <View style={{ padding: 5 }}>
                        {data.logistics.map((item: any, idx: number) => (
                            <View key={idx} style={styles.row}>
                                <Text style={styles.textLeft}>{item.label}</Text>
                                <Text style={styles.textRight}>{item.val}%</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Section: Finances */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. ÉTAT FINANCIER GLOBAL</Text>
                    <View style={styles.grid}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Collecté</Text>
                            <Text style={[styles.value, { color: '#10b981' }]}>{data.finance.received}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>En attente</Text>
                            <Text style={[styles.value, { color: '#fbbf24' }]}>{data.finance.pending}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Objectif Global</Text>
                            <Text style={styles.value}>{data.finance.totalRevenue}</Text>
                        </View>
                    </View>
                </View>

                {/* Section: Activités Récentes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. HISTORIQUE & FLUX D'ACTIVITÉS RÉCENTES</Text>
                    <View style={{ padding: 5 }}>
                        {data.activities.map((act: any, idx: number) => (
                            <View key={idx} style={styles.row}>
                                <View>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#1f2937' }}>{act.msg}</Text>
                                    <Text style={{ fontSize: 7, color: '#6b7280' }}>{act.subgroup}</Text>
                                </View>
                                <Text style={{ fontSize: 8, color: '#9ca3af' }}>{act.time}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Ce document confidentiel contient des données personnelles et financières de l'agence.
                    © 2026 OMRAYANAIR - Sécurité et excellence au service de votre foi.
                </Text>
            </Page>
        </Document>
    );
};
