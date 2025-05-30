import { Input as InputComponent, useTheme } from "@chakra-ui/react";
import { transparentize } from '@chakra-ui/theme-tools';
import { useState } from "react";

const Input = ({
    value,
    onChange,
    onChangeEnd,
    onBlur,
    min = -Infinity,
    max = Infinity,
    isNumber = false,
    allowFloat = false,
    precision = 2,
    ...rest
}) => {
    const theme = useTheme();
    const glowColor = transparentize('primary.main', 0.7)(theme);

    const [initialValue, setInitialValue] = useState(null);

    const handleFocus = (e) => {
        setInitialValue(value);
        if (rest.onFocus) {
            rest.onFocus(e);
        }
    };

    const handleChange = (e) => {
        if (!isNumber) {
            onChange?.(e);
            return;
        }

        let inputVal = e.target.value;

        if (inputVal === '') {
            onChange?.(e);
            return;
        }

        if (inputVal === '-') {
            if (min >= 0) {
                e.target.value = '';
            }
            onChange?.(e);
            return;
        }

        const isNegative = inputVal.startsWith('-');
        let digits = isNegative ? inputVal.substring(1) : inputVal;
        let cleanedDigits = '';
        let hasDot = false;

        for (let i = 0; i < digits.length; i++) {
            const char = digits[i];
            if (char >= '0' && char <= '9') {
                cleanedDigits += char;
            } else if (char === '.' && allowFloat && !hasDot) {
                cleanedDigits += char;
                hasDot = true;
            }
        }

        if (cleanedDigits.startsWith('.')) {
            cleanedDigits = '0' + cleanedDigits;
        }

        if (cleanedDigits.length > 1 && cleanedDigits.startsWith('0') && cleanedDigits.charAt(1) !== '.') {
            const withoutLeadingZeros = cleanedDigits.replace(/^0+/, '');
            cleanedDigits = withoutLeadingZeros.length > 0 ? withoutLeadingZeros : '0';
        }

        if (hasDot && allowFloat) {
            const parts = cleanedDigits.split('.');
            if (parts.length > 1 && parts[1].length > precision) {
                parts[1] = parts[1].substring(0, precision);
                cleanedDigits = parts.join('.');
            }
        }

        let formattedVal = isNegative ? '-' + cleanedDigits : cleanedDigits;

        e.target.value = formattedVal;
        onChange?.(e);
    };

    const applyMinMax = (val) => {
        if (!isNumber) return val;
        if (val === '' || val === '-' || val.endsWith('.')) return val;
        let num = Number(val);
        if (isNaN(num)) return val;
        num = Math.min(Math.max(min, num), max);
        if (allowFloat) {
            num = num.toFixed(precision).replace(/\.?0+$/, '');
        }
        return String(num);
    };

    const handleBlur = (e) => {
        let newValue = applyMinMax(e.target.value);
        if (newValue !== e.target.value) {
            e.target.value = newValue;
            onChange?.({ target: { value: newValue } });
        }
        if (value !== initialValue && onChangeEnd) {
            onChangeEnd(newValue);
        }
        setInitialValue(null);
        if (onBlur) {
            onBlur(e);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            if (e.key === 'Escape' && initialValue !== null && onChange) {
                onChange({ target: { value: initialValue } });
            } else if (e.key === 'Enter') {
                let newValue = applyMinMax(e.target.value);
                if (newValue !== e.target.value) {
                    e.target.value = newValue;
                    onChange?.({ target: { value: newValue } });
                }
            }
            setTimeout(() => {
                e.target.blur();
            }, 0);
            e.preventDefault();
        }
        if (rest.onKeyDown) {
            rest.onKeyDown(e);
        }
    };

    return (
        <InputComponent
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            color="text.primary"
            borderColor="primary.dark"
            bg="darkMode.card"
            _placeholder={{ color: 'text.secondary' }}
            _focus={{ borderColor: 'primary.main', outline: 'none', boxShadow: `0 0 10px ${glowColor}` }}
            {...rest}
        />
    );
};

export default Input;