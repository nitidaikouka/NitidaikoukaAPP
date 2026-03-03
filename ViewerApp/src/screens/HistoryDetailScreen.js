import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 64) / 5; // 的中表っぽく調整

export default function HistoryDetailScreen({ route }) {
    const { session } = route.params;

    const renderMark = (mark) => {
        if (mark === 'hit' || mark === '○') return <Text style={[styles.mark, styles.hit]}>○</Text>;
        if (mark === 'miss' || mark === '×') return <Text style={[styles.mark, styles.miss]}>×</Text>;
        // Swift app saves empty string for none
        if (mark === '' || mark === 'none') return <Text style={styles.mark}>-</Text>;
        return <Text style={styles.mark}>-</Text>;
    };

    const formatDate = (dateValue) => {
        // Handle Apple timestamp (seconds since Jan 1, 2001)
        if (typeof dateValue === 'number') {
            const date = new Date((dateValue + 978307200) * 1000);
            return date.toLocaleDateString('ja-JP');
        }
        // Fallback for standard ISO strings
        return new Date(dateValue).toLocaleDateString('ja-JP');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{formatDate(session.date)} の記録</Text>
                <Text style={styles.note}>{session.note || 'メモなし'}</Text>
            </View>

            <View style={styles.table}>
                {session.archers && session.archers.filter(a => !a.isSeparator && !a.isTotalCalculator).map((archer, aIdx) => (
                    <View key={aIdx} style={styles.archerRow}>
                        <View style={styles.nameLabel}>
                            <Text style={styles.nameText}>{archer.name}</Text>
                        </View>
                        <View style={styles.marksContainer}>
                            {archer.marks.map((mark, mIdx) => (
                                <View key={mIdx} style={styles.markCell}>
                                    {renderMark(mark)}
                                </View>
                            ))}
                            <View style={[styles.markCell, styles.totalCell]}>
                                <Text style={styles.totalText}>
                                    {archer.marks.filter(m => m === 'hit' || m === '○').length}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    note: {
        color: '#aaa',
        marginTop: 8,
        fontSize: 14,
    },
    table: {
        padding: 16,
    },
    archerRow: {
        marginBottom: 20,
    },
    nameLabel: {
        marginBottom: 8,
        paddingLeft: 4,
    },
    nameText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    marksContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderWidth: 1,
        borderColor: '#444',
    },
    markCell: {
        width: '25%', // 4本1組を意識
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#333',
    },
    mark: {
        fontSize: 24,
        color: '#666',
    },
    hit: {
        color: '#3b82f6', // 的中
    },
    miss: {
        color: '#ef4444', // 逸れ
    },
    totalCell: {
        backgroundColor: '#1a1a1a',
    },
    totalText: {
        color: '#3b82f6',
        fontWeight: 'bold',
        fontSize: 18,
    }
});
