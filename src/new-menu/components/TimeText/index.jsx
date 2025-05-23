import { useState, useEffect } from 'react';
import { Text } from '@chakra-ui/react';

const TimeText = ({ 
  time, 
  defaultText = "Never", 
  ...rest 
}) => {
  const [timeAgo, setTimeAgo] = useState('');
  
  useEffect(() => {
    const calculateTimeAgo = () => {
      if (!time) {
        setTimeAgo(defaultText);
        return { text: defaultText, interval: null };
      }
      
      const timeMs = typeof time === 'string' ? new Date(time).getTime() : Number(time);
      const now = Date.now();
      const diffSeconds = Math.floor((now - timeMs) / 1000);
      
      if (diffSeconds < 60) {
        return { text: `${diffSeconds}s ago`, interval: 1000 };
      } else if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60);
        return { 
          text: `${minutes}m ago`,
          interval: 60000 
        };
      } else {
        if (diffSeconds < 86400) {
          const hours = Math.floor(diffSeconds / 3600);
          return { text: `${hours}h ago`, interval: null };
        } else if (diffSeconds < 604800) {
          const days = Math.floor(diffSeconds / 86400);
          return { text: `${days}d ago`, interval: null };
        } else if (diffSeconds < 2592000) {
          const weeks = Math.floor(diffSeconds / 604800);
          return { text: `${weeks}w ago`, interval: null };
        } else if (diffSeconds < 31536000) {
          const months = Math.floor(diffSeconds / 2592000);
          return { text: `${months}mo ago`, interval: null };
        } else {
          const years = Math.floor(diffSeconds / 31536000);
          return { text: `${years}y ago`, interval: null };
        }
      }
    };
    
    const result = calculateTimeAgo();
    setTimeAgo(result.text);
    
    let intervalId;
    if (result.interval) {
      intervalId = setInterval(() => {
        const newResult = calculateTimeAgo();
        setTimeAgo(newResult.text);
      }, result.interval);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [time, defaultText]);
  
  if (time === undefined || time === null) {
    return <Text {...rest}>{defaultText}</Text>;
  }
  
  return <Text {...rest}>{timeAgo}</Text>;
};

export default TimeText;