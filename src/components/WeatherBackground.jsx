import { motion } from 'framer-motion';

export default function WeatherBackground({ condition, darkMode }) {
  const MotionSpan = motion.span;
  const MotionDiv = motion.div;
  const getScenery = () => {
    switch (condition) {
      case 'rainy':
        return (
          <div className="rain-container">
            {Array.from({ length: 30 }).map((_, i) => (
              <MotionSpan
                key={i}
                className="rain-drop"
                animate={{ y: ['-100vh', '100vh'] }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                style={{ left: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        );
      case 'snowy':
        return (
          <div className="snow-container">
            {Array.from({ length: 30 }).map((_, i) => (
              <MotionSpan
                key={i}
                className="snow-flake"
                animate={{
                  y: ['-10vh', '110vh'],
                  x: [0, 20, 0, -20, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                style={{ left: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        );
      case 'clear':
        return (
          <>
            <MotionDiv
              className="cloud-bg c1"
              animate={{ x: ['-20vw', '120vw'] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >☁️</MotionDiv>
            <MotionDiv
              className="cloud-bg c2"
              animate={{ x: ['120vw', '-20vw'] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >☁️</MotionDiv>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`weather-bg-root ${darkMode ? 'dark' : ''}`}>
      {getScenery()}
      {(condition === 'night' || darkMode) && <div className="stars-overlay"></div>}
    </div>
  );
}
