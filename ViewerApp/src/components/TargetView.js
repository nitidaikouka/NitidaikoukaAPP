import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');
const TARGET_SIZE = width * 0.8;

const TargetView = ({ type, onTargetPress, points = [] }) => {
    // 尺二寸 (36cm) vs 八寸 (24cm) の比率
    const scale = type === 'hoshi_8' ? 0.66 : 1.0;
    const radius = (TARGET_SIZE / 2) * scale;
    const center = TARGET_SIZE / 2;

    const renderTargetBase = () => {
        switch (type) {
            case 'kasumi_12':
                return (
                    <>
                        {/* 霞的: 3本の黒い輪 */}
                        <Circle cx={center} cy={center} r={radius} fill="white" stroke="black" strokeWidth="1" />
                        <Circle cx={center} cy={center} r={radius * 0.85} fill="black" />
                        <Circle cx={center} cy={center} r={radius * 0.7} fill="white" />
                        <Circle cx={center} cy={center} r={radius * 0.45} fill="black" />
                        <Circle cx={center} cy={center} r={radius * 0.3} fill="white" />
                        <Circle cx={center} cy={center} r={radius * 0.15} fill="black" />
                    </>
                );
            case 'hoshi_12':
            case 'hoshi_8':
                return (
                    <>
                        {/* 星的: 中心に一つの黒い点（星） */}
                        <Circle cx={center} cy={center} r={radius} fill="white" stroke="black" strokeWidth="1" />
                        <Circle cx={center} cy={center} r={radius * 0.25} fill="black" />
                    </>
                );
            default:
                return null;
        }
    };

    const handlePress = (evt) => {
        if (!onTargetPress) return;
        const { locationX, locationY } = evt.nativeEvent;
        // 中心からの相対座標 (-1.0 to 1.0) に変換して保存
        const relX = (locationX - center) / radius;
        const relY = (locationY - center) / radius;
        onTargetPress({ x: relX, y: relY });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={handlePress}
                style={{ width: TARGET_SIZE, height: TARGET_SIZE }}
            >
                <Svg width={TARGET_SIZE} height={TARGET_SIZE}>
                    {renderTargetBase()}
                    {/* 記録された矢の表示 */}
                    {points.map((p, i) => (
                        <Circle
                            key={i}
                            cx={center + p.x * radius}
                            cy={center + p.y * radius}
                            r="4"
                            fill={p.isHit ? "#3b82f6" : "#ef4444"}
                            stroke="white"
                            strokeWidth="1"
                        />
                    ))}
                </Svg>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 10,
    },
});

export default TargetView;
