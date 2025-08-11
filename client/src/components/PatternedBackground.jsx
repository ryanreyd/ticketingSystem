import React from "react";

const PatternBackground = ({
  lineColor = "rgba(50,65,85,0.05)",
  lineThickness = 2,
  squareSize = 50,
  fadeStart = 70,
  fadeEnd = 100,
  coverage = 150,
  shape = "circle", // "circle" or "square"
  className = "",
}) => {
  const bgPattern = `
    repeating-linear-gradient(
      0deg,
      ${lineColor} 0 ${lineThickness}px,
      transparent ${lineThickness}px ${squareSize}px
    ),
    repeating-linear-gradient(
      90deg,
      ${lineColor} 0 ${lineThickness}px,
      transparent ${lineThickness}px ${squareSize}px
    )
  `;

  const gradientShape =
    shape === "square"
      ? "radial-gradient(closest-side, white " +
        fadeStart +
        "%, transparent " +
        fadeEnd +
        "%)"
      : "radial-gradient(circle, white " +
        fadeStart +
        "%, transparent " +
        fadeEnd +
        "%)";

  return (
    <div
      className={`absolute inset-0 ${className} duration-1000`}
      style={{
        backgroundImage: bgPattern,
        backgroundSize: `${squareSize}px ${squareSize}px`,
        WebkitMaskImage: gradientShape,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: `${coverage}% ${coverage}%`,
        maskImage: gradientShape,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: `${coverage}% ${coverage}%`,
      }}
    />
  );
};

export default PatternBackground;
