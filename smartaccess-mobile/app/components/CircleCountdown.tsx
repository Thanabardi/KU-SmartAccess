import { Authenticator, KeyDecoder } from '@otplib/core';
import { useCountdown } from 'react-countdown-circle-timer';
import { Svg, Defs, LinearGradient, Stop, Path, Text } from 'react-native-svg';
import { View } from 'react-native';

export function Countdown() {
    // mock authenticator for get time Remaining
    const keyDecoder: KeyDecoder<string> = (key: string) => {
        return key;
      };

    const authenticator = new Authenticator({
        keyDecoder: keyDecoder
      });

    const timeRemaining = authenticator.timeRemaining();

    const {
        path,
        pathLength,
        stroke,
        strokeDashoffset,
        remainingTime,
        elapsedTime,
        size,
        strokeWidth,
        } = useCountdown({ 
            isPlaying: true, 
            duration: 30, 
            colors:['#004777', '#F7B801', '#A30000', '#A30000'], 
            colorsTime:[30, 20, 10, 0],
            initialRemainingTime:timeRemaining, 
            onComplete:() => ({ shouldRepeat: true, delay: 0 })
        })

    const scale = 0.4

    return (
        <View style={{position: 'absolute', justifyContent: 'center', width: 40, height:40, alignSelf:'center', flexDirection:'row', paddingTop: 16}}>
            <Svg width={size*scale} height={size*scale} viewBox={`0 0 ${size} ${size}`} scaleX={scale} scaleY={scale}>
                <Defs>
                    <LinearGradient id="your-unique-id" x1="1" y1="0" x2="0" y2="0">
                        <Stop offset="5%" stopColor="gold"/>
                        <Stop offset="95%" stopColor="red"/>
                    </LinearGradient>
                </Defs>
                    {/* Circle */}
                <Path
                    d={path}
                    fill="none"
                    stroke="#d9d9d9"
                    strokeWidth={strokeWidth}
                />
                <Path
                    d={path}
                    fill="none"
                    stroke={stroke}
                    strokeLinecap="butt"
                    strokeWidth={strokeWidth}
                    strokeDasharray={pathLength}
                    strokeDashoffset={strokeDashoffset}
                />
                {/* Centering the text */}
                <Text
                    x={size / 2} // Half the width of the SVG
                    y={size / 2} // Half the height of the SVG
                    textAnchor="middle" // Center the text horizontally
                    alignmentBaseline="middle" // Center the text vertically
                    fill="black" // Text color
                    fontSize={64} // Text font size
                    fontWeight="bold" // Make the text bold
                >
                    {remainingTime}
                </Text>
            </Svg>
        </View>
  );
};

export default Countdown;
