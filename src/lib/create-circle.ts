const createCircle = (x = 0, y = 0, color = "red", scale = 1, size = 20) => {
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );

  circle.setAttribute("cx", x.toString(10));
  circle.setAttribute("cy", y.toString(10));
  circle.setAttribute("r", (size * scale).toString(10));
  circle.setAttribute("fill", color);

  return circle;
};

export default createCircle