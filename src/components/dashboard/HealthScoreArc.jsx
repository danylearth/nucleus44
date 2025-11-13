import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";

export default function HealthScoreArc({ score }) {
  // If score is the default value (750) or missing, show a placeholder
  const isDefaultScore = !score || score === 750;
  
  const maxScore = 1000;
  const percentage = score / maxScore;

  // SVG arc parameters - scaled to fit viewBox perfectly
  const arcRx = 49.5;
  const arcRy = 45;
  const strokeWidth = 17;

  // Approximated circumference of the semi-elliptical arc
  const circumference = Math.PI * (arcRx + arcRy) / 2;
  const progress = percentage * circumference;

  // Constants for the viewBox
  const svgViewBoxWidth = 116;
  const svgViewBoxHeight = 70;

  // Center of the arc's baseline in SVG coordinates
  const arcCenterX = 58;
  const arcBaseY = 55;

  // Calculate positions for 13 equally spaced dots along the arc
  const generateDots = () => {
    const dots = [];
    const numDots = 13;
    const gap = 4.5; 
    const innerRadiusX = arcRx - (strokeWidth / 2) - gap;
    const innerRadiusY = arcRy - (strokeWidth / 2) - gap;
    
    for (let i = 0; i < numDots; i++) {
      const t = Math.PI - (i * Math.PI) / (numDots - 1);
      const x = arcCenterX + innerRadiusX * Math.cos(t);
      const y = arcBaseY - innerRadiusY * Math.sin(t);
      dots.push({ x, y });
    }
    
    return dots;
  };

  const dots = generateDots();

  // Position for the badge
  const badgeAngle = Math.PI * 0.82;
  const badgeSvgX = arcCenterX - Math.cos(badgeAngle) * (arcRy + 2);
  const badgeSvgY = arcBaseY - Math.sin(badgeAngle) * (arcRy + 2);

  const badgeX = (badgeSvgX / svgViewBoxWidth) * 100;
  const badgeY = (badgeSvgY / svgViewBoxHeight) * 100;

  return (
    <Link to={createPageUrl("HealthScore")}>
      <Card className="bg-white rounded-3xl border-0 subtle-shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 text-center relative">
          <div className="relative w-full max-w-xs mx-auto" style={{ height: '188px' }}>
            <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 116 70">
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff8c69" />
                  <stop offset="40%" stopColor="#ffd93d" />
                  <stop offset="100%" stopColor="#84e1a9" />
                </linearGradient>
              </defs>

              {/* Background Arc */}
              <path
                d={`M ${arcCenterX - arcRx},${arcBaseY} A ${arcRx},${arcRy} 0 0 1 ${arcCenterX + arcRx},${arcBaseY}`}
                stroke="#f3f4f6"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />

              {/* Progress Arc - only show if not default score */}
              {!isDefaultScore && (
                <path
                  d={`M ${arcCenterX - arcRx},${arcBaseY} A ${arcRx},${arcRy} 0 0 1 ${arcCenterX + arcRx},${arcBaseY}`}
                  stroke="url(#healthGradient)"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${progress} ${circumference}`}
                  className="transition-all duration-1000 ease-out"
                />
              )}

              {/* Dots */}
              {dots.map((dot, index) => (
                <circle
                  key={index}
                  cx={dot.x}
                  cy={dot.y}
                  r="1"
                  fill="#e2e8f0"
                />
              ))}
            </svg>
            
            {/* Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-end" style={{ bottom: '10%' }}>
              <div className="flex items-center">
                <div className={`text-5xl font-bold ${isDefaultScore ? 'text-gray-400' : 'text-gray-900'}`}>
                  {score}
                </div>
                {!isDefaultScore && (
                  <div style={{
                    width: 0,
                    height: 0,
                    borderLeft: '7px solid transparent',
                    borderRight: '7px solid transparent',
                    borderBottom: '12px solid #48bb78',
                    marginLeft: '4px',
                    transform: 'translateY(-3px)'
                  }}></div>
                )}
              </div>
              <div className={`text-sm ${isDefaultScore ? 'text-gray-400' : 'text-gray-500'}`}>
                {isDefaultScore ? 'Calculating...' : 'Health Score'}
              </div>
            </div>

            {/* Badge - only show if not default */}
            {!isDefaultScore && percentage > 0.75 && (
              <div
                className="absolute"
                style={{
                  top: `${badgeY}%`,
                  left: `${badgeX}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Badge className="bg-green-100/90 text-green-800 border-none text-xs px-2.5 py-1">
                  Good
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}