import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Note: In a real app, we would register fonts for Arabic support here.
// Font.register({ family: 'Inter', src: '...' });

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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#052e16',
    },
    subtitle: {
        fontSize: 10,
        color: '#10b981',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#052e16',
        backgroundColor: '#f0fdf4',
        padding: 5,
        marginBottom: 10,
    },
    card: {
        border: '1pt solid #e5e7eb',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    label: {
        fontSize: 9,
        color: '#6b7280',
    },
    value: {
        fontSize: 10,
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
    },
    activityRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    timeCol: {
        width: 60,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fbbf24',
    },
    contentCol: {
        flex: 1,
        borderLeft: '1pt solid #10b981',
        paddingLeft: 15,
    },
    activityTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    activityDesc: {
        fontSize: 9,
        color: '#4b5563',
        lineHeight: 1.4,
    }
});

function cleanText(text: string): string {
    if (!text) return '';
    return text
        // Clean Arabic transliteration characters to standard Latin equivalents
        .replace(/[ḥḤ]/g, 'h')
        .replace(/[īĪ]/g, 'i')
        .replace(/[āĀ]/g, 'a')
        .replace(/[ūŪ]/g, 'u')
        .replace(/[ṣṢ]/g, 's')
        .replace(/[ṭṬ]/g, 't')
        .replace(/[ḍḌ]/g, 'd')
        .replace(/[ẓẒ]/g, 'z')
        .replace(/’/g, "'")
        .replace(/‘/g, "'")
        // Specific garbled pattern replacements
        .replace(/i%rm/gi, 'ihram')
        .replace(/¿umra/gi, 'umra')
        .replace(/shar\+ka/gi, 'sharika')
        .replace(/l-%amda/gi, 'l-hamda')
        .replace(/ni¿mata/gi, 'nimata')
        .replace(/Jumu¿a/gi, 'Joumoua')
        .replace(/al-\$arm/gi, 'al-Haram')
        .replace(/Ka¿ba/gi, 'Kaaba')
        .replace(/raka¿t/gi, 'rakaat')
        .replace(/Sa¿y/gi, 'Say')
        .replace(/baf/gi, 'Safa')
        .replace(/Allhumma/g, 'Allahumma')
        .replace(/All\+humma/g, 'Allahumma')
        .replace(/l\+/g, 'la')
        .replace(/ú/g, '')
        .replace(/%/g, 'h')
        .replace(/\$/g, 'H')
        .replace(/\+/g, 'i')
        .replace(/¿/g, "'");
}

export const TravelJournalDocument = ({ data }: { data: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image 
                        src="/logo.png" 
                        style={{ width: 35, height: 35, marginRight: 10, borderRadius: 8 }} 
                    />
                    <View>
                        <Text style={styles.title}>MON OMRA</Text>
                        <Text style={styles.subtitle}>Carnet de Voyage Spirituel</Text>
                    </View>
                </View>
                <View style={{ textAlign: 'right' }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{cleanText(data.groupName)}</Text>
                    <Text style={{ fontSize: 8, color: '#6b7280' }}>Réf: {data.groupId.slice(0, 8).toUpperCase()}</Text>
                </View>
            </View>

            {/* Flights Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. VÉHICULES & VOLS</Text>
                {data.flights.length === 0 ? (
                    <Text style={{ fontSize: 9, color: '#6b7280', fontStyle: 'italic', padding: 5 }}>Aucun vol ou transfert planifié pour le moment.</Text>
                ) : data.flights.map((flight: any, idx: number) => (
                    <View key={idx} style={styles.card}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5, color: '#10b981' }}>
                            VOL {cleanText(flight.type)} - {cleanText(flight.carrier)}
                        </Text>
                        {flight.segments.map((seg: any, sIdx: number) => (
                            <View key={sIdx} style={styles.row}>
                                <Text style={styles.value}>{cleanText(seg.from)} ➔ {cleanText(seg.to)}</Text>
                                <Text style={styles.value}>{cleanText(seg.flightNum)} | {cleanText(seg.date)} à {cleanText(seg.time)}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>

            {/* Hotels Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. HÉBERGEMENTS</Text>
                {data.hotels.length === 0 ? (
                    <Text style={{ fontSize: 9, color: '#6b7280', fontStyle: 'italic', padding: 5 }}>Aucun hébergement planifié pour le moment.</Text>
                ) : data.hotels.map((hotel: any, idx: number) => (
                    <View key={idx} style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.value}>{cleanText(hotel.name)}</Text>
                            <Text style={styles.value}>{cleanText(hotel.city)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Check-in: {cleanText(hotel.checkIn)}</Text>
                            <Text style={styles.label}>Check-out: {cleanText(hotel.checkOut)}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Planning Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. PROGRAMME DES PREMIERS JOURS</Text>
                {data.program.length === 0 ? (
                    <Text style={{ fontSize: 9, color: '#6b7280', fontStyle: 'italic', padding: 5 }}>Aucune activité programmée pour le moment.</Text>
                ) : data.program.slice(0, 3).map((day: any, idx: number) => (
                    <View key={idx} style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#10b981', marginBottom: 8 }}>
                            JOUR {day.day} - {cleanText(day.date)}
                        </Text>
                        {day.activities.map((act: any, aIdx: number) => (
                            <View key={aIdx} style={styles.activityRow}>
                                <Text style={styles.timeCol}>{cleanText(act.time)}</Text>
                                <View style={styles.contentCol}>
                                    <Text style={styles.activityTitle}>{cleanText(act.title)}</Text>
                                    <Text style={styles.activityDesc}>{cleanText(act.description)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </View>

            <Text style={styles.footer}>
                Ce document est généré par Mon Omra pour {cleanText(data.pilgrimName)}.
                Bon voyage spirituel. Hajj Mabroor & Omra Maqbula.
            </Text>
        </Page>
    </Document>
);
