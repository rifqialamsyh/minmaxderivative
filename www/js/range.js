let myChart; // Variable to store the chart instance

function calculateDerivative() {
  // Clear previous result and chart
  document.getElementById("result").innerHTML = "";
  clearChart();

  // Retrieve expression and range from inputs
  const expressionInput = document.getElementById("expression");
  const expression = expressionInput.value;
  const rangeInput = document.getElementById("rangeInput");
  const rangeString = rangeInput.value.trim();

  try {
    // Define variables for derivative function and default range
    let derivativeResult;
    let range = [-10, 10];

    // Parse range if provided, else use default
    if (rangeString) {
      try {
        range = rangeString.split(",").map((value) => parseFloat(value.trim()));
        if (range.length !== 2 || isNaN(range[0]) || isNaN(range[1])) {
          throw new Error(
            "Invalid range format. Please enter a valid range like `[-1/2, 2]`."
          );
        }
      } catch (error) {
        document.getElementById("result").innerHTML = `Error: ${error.message}`;
        return;
      }
    }

    // Convert expression to mathjs function with improved error handling
    let func;
    try {
      func = math.parse(expression, {
        scope: { x: true, y: 0, z: Math.PI },
      });
    } catch (error) {
      document.getElementById(
        "result"
      ).innerHTML = `Invalid expression: ${error.message}`;
      return;
    }

    // Calculate derivative
    derivativeResult = math.derivative(func, "x").toString();

    // Check if the first derivative is a constant or zero
    if (isConstantOrZeroDerivative(derivativeResult)) {
      document.getElementById("result").innerHTML =
        "The derivative is a constant or zero. There are no critical points. Please try a different function.";
      return;
    }

    // Initialize steps to accumulate calculation details
    let calculationSteps = [];

    // Use Newton-Raphson method to find critical points with higher accuracy
    const criticalPoints = findCriticalPointsWithNewtonRaphson(
      derivativeResult,
      range,
      calculationSteps
    );

    // Calculate function values at critical points and endpoints
    const functionValues = criticalPoints
      .concat(range)
      .map((x) => math.evaluate(func.toString(), { x }));

    // Find the highest and lowest values for extrema
    const maximum = Math.max(...functionValues);
    const minimum = Math.min(...functionValues);

    // Display derivative result, critical points, and extrema
    calculationSteps.push(`Critical points: ${JSON.stringify(criticalPoints)}`);
    calculationSteps.push(`Maximum value: ${maximum}`);
    calculationSteps.push(`Minimum value: ${minimum}`);

    // Display all calculation steps
    document.getElementById("result").innerHTML = calculationSteps.join("<br>");

    // Display chart
    displayChart(func, range[0], range[1]);
  } catch (error) {
    document.getElementById(
      "result"
    ).innerHTML = `An error occurred: ${error.message}`;
  }
}

function isConstantOrZeroDerivative(derivative) {
  // Check if the derivative is constant or equal to zero
  return (
    /^-?\d+(\.\d*)?$/.test(derivative) || // Check if the derivative is a constant
    /^0(\.0*)?$/.test(derivative) // Check if the derivative is zero
  );
}

function findCriticalPointsWithNewtonRaphson(derivative, interval, steps) {
  const tolerance = 0.001; // adjust tolerance as needed
  const criticalPoints = [];

  // Iterate over the interval
  for (let x = interval[0]; x <= interval[1]; x += 0.1) {
    // Check if derivative is close to zero within tolerance
    const derivativeValue = math.evaluate(derivative, { x });
    if (Math.abs(derivativeValue) < tolerance) {
      criticalPoints.push(x);

      // Use Newton-Raphson method to refine the critical point
      let x0 = x;
      while (Math.abs(derivativeValue) > tolerance) {
        x0 =
          x0 -
          derivativeValue /
            math.evaluate(math.derivative(derivative, "x"), { x: x0 });
        derivativeValue = math.evaluate(derivative, { x: x0 });
      }
      criticalPoints.push(x0);
      steps.push(`Critical point found at x = ${x0}`);
    }
  }

  return criticalPoints;
}

function displayChart(func, start, end) {
  const canvas = document.getElementById("myChart");
  const ctx = canvas.getContext("2d");

  const xValues = [];
  const yValues = [];

  for (let x = start; x <= end; x += 0.1) {
    xValues.push(x);
    yValues.push(math.evaluate(func.toString(), { x }));
  }

  const chartData = {
    labels: xValues,
    datasets: [
      {
        label: "Function Curve",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        data: yValues,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: "linear",
        position: "bottom",
      },
      y: {
        min: Math.min(...yValues),
        max: Math.max(...yValues),
      },
    },
  };

  myChart = new Chart(ctx, {
    type: "line",
    data: chartData,
    options: chartOptions,
  });
}

function clearChart() {
  // Check if myChart is defined before attempting to destroy it
  if (myChart) {
    myChart.destroy();
  }

  const canvas = document.getElementById("myChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
