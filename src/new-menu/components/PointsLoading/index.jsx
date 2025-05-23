import { Box, keyframes, useToken } from '@chakra-ui/react';

const pulseAnimation = keyframes`
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

export const PointsLoading = ({
    size = "6px",
    gap = "1",
    color = "primary.main",
    baseColor = "primary.light",
    speed = 0.9,
    count = 3
}) => {
    const [highlightColor] = useToken('colors', [color]);

    const points = Array.from({ length: count }, (_, i) => i);

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={gap}
            sx={{ '--highlight-color': highlightColor }}
        >
            {points.map((i) => (
                <Box
                    key={i}
                    h={size}
                    w={size}
                    borderRadius="full"
                    bg={baseColor}
                    display="inline-block"
                    animation={`${pulseAnimation} ${speed}s infinite ease-in-out both`}
                    sx={{
                        animationDelay: `${(i * speed) / count / 1.5}s`,
                        transition: "all 0.2s ease",
                        boxShadow: '0px 0px 2px 1px rgba(0, 0, 0, 0.2)'
                    }}
                />
            ))}
        </Box>
    );
};

export default PointsLoading;