import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Box,
    Text,
    Flex,
} from '@chakra-ui/react'
import { Input } from '..'
import { useEffect, useState, useRef } from 'react'

const CompactSlider = ({
    min = 0,
    max = 100,
    value: defaultValue = 50,
    threshold = 100,
    onChange,
    onChangeEnd,
    label,
    width = "100%",
    logarithmic = false,
    allowFloat = false,
    precision = 2,
}) => {
    if (logarithmic && (min < 0 || max <= threshold)) {
        throw new Error('Logarithmic scale requires min >= 0 and max > threshold');
    }

    const format = (val) => {
        return allowFloat
            ? Number(val).toFixed(precision)
            : Math.round(val);
    };

    const toSliderValue = (value) => {
        if (!logarithmic) return Number(value);

        if (value <= threshold) {
            return (value / threshold) * 50;
        } else {
            const logMin = Math.log10(threshold);
            const logMax = Math.log10(max);
            const logVal = Math.log10(value);
            return 50 + ((logVal - logMin) / (logMax - logMin)) * 50;
        }
    };

    const fromSliderValue = (sliderVal) => {
        if (!logarithmic) return format(sliderVal);

        if (sliderVal <= 50) {
            return format((sliderVal / 50) * threshold);
        } else {
            const logMin = Math.log10(threshold);
            const logMax = Math.log10(max);
            const logVal = ((sliderVal - 50) / 50) * (logMax - logMin) + logMin;
            return format(10 ** logVal);
        }
    };

    const [sliderValue, setSliderValue] = useState(() => toSliderValue(defaultValue));
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(defaultValue);

    const handleInputChange = (e) => {
        const { value } = e.target;
        setInputValue(value);
    }


    const initialValueRef = useRef(defaultValue);
    const changeEndTimeoutRef = useRef(null);

    useEffect(() => {
        const sliderVal = toSliderValue(defaultValue);
        setSliderValue(sliderVal);
        setInputValue(String(fromSliderValue(sliderVal)));
        initialValueRef.current = defaultValue;
    }, [defaultValue]);

    const handleChange = (val) => {
        const actualValue = fromSliderValue(val);
        const numericValue = Number(actualValue);

        setSliderValue(val);
        setInputValue(String(actualValue));
        onChange?.(numericValue);

        if (changeEndTimeoutRef.current) {
            clearTimeout(changeEndTimeoutRef.current);
        }

        changeEndTimeoutRef.current = setTimeout(() => {
            if (onChangeEnd && numericValue !== initialValueRef.current) {
                onChangeEnd(numericValue);
                initialValueRef.current = numericValue;
            }
        }, 500);
    };

    const handleInputBlur = () => {
        setIsEditing(false);
        const numeric = Number(inputValue);

        if (!isNaN(numeric) && inputValue !== '') {
            const clamped = Math.max(min, Math.min(max, numeric));
            const formattedValue = format(clamped);
            const numericValue = Number(formattedValue);

            setSliderValue(toSliderValue(clamped));
            setInputValue(String(formattedValue));
            onChange?.(numericValue);

            if (changeEndTimeoutRef.current) {
                clearTimeout(changeEndTimeoutRef.current);
                changeEndTimeoutRef.current = null;
            }

            if (onChangeEnd && numericValue !== initialValueRef.current) {
                onChangeEnd(numericValue);
                initialValueRef.current = numericValue;
            }
        } else {
            setInputValue(String(fromSliderValue(sliderValue)));
        }
    };

    const handleSliderChangeEnd = (val) => {
        if (changeEndTimeoutRef.current) {
            clearTimeout(changeEndTimeoutRef.current);
            changeEndTimeoutRef.current = null;
        }

        const actualValue = fromSliderValue(val);
        const numericValue = Number(actualValue);

        if (onChangeEnd && numericValue !== initialValueRef.current) {
            onChangeEnd(numericValue);
            initialValueRef.current = numericValue;
        }
    };

    return (
        <Box width={width} ps="10px" pe="10px">
            <Flex justifyContent="center" alignItems="center" gap={2}>
                <Text>{label}</Text>
                {isEditing ? (
                    <Input
                        size="sm"
                        width="80px"
                        value={inputValue}
                        isNumber
                        min={min}
                        max={max}
                        allowFloat={allowFloat}
                        precision={precision}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        autoFocus
                    />
                ) : (
                    <Text
                        fontWeight="medium"
                        onDoubleClick={() => setIsEditing(true)}
                        cursor="pointer"
                    >
                        {inputValue}
                    </Text>
                )}
            </Flex>
            <Slider
                min={logarithmic ? Math.max(0, min) : min}
                max={logarithmic ? 100 : max}
                step={allowFloat ? 0.01 : 1}
                value={sliderValue}
                onChange={handleChange}
                onChangeEnd={handleSliderChangeEnd}
                colorScheme="primary"
            >
                <SliderTrack bg="darkMode.bg">
                    <SliderFilledTrack bg="primary.main" />
                </SliderTrack>
                <SliderThumb
                    bg="primary.main"
                    _focus={{
                        boxShadow: 'none',
                        outline: 'none',
                    }}
                />
            </Slider>
        </Box>
    );
};

export default CompactSlider;