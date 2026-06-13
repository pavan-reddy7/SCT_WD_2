class Calculator {
  constructor(previousOperandElement, currentOperandElement) {
    this.previousOperandElement = previousOperandElement;
    this.currentOperandElement = currentOperandElement;
    this.clear();
  }

  clear() {
    this.expression = "0";
    this.previousExpression = "";
    this.justCalculated = false;
  }

  delete() {
    if (this.justCalculated || this.expression === "Error") {
      this.clear();
      return;
    }

    if (/[+\-*/] $/.test(this.expression)) {
      this.expression = this.expression.slice(0, -3);
      return;
    }

    this.expression =
      this.expression.length > 1 ? this.expression.slice(0, -1) : "0";
  }

  appendNumber(number) {
    if (this.justCalculated || this.expression === "Error") {
      this.clear();
    }

    const currentNumber = this.expression.split(/ [+\-*/] /).pop();
    if (number === "." && currentNumber.includes(".")) return;

    if ((this.expression === "0" || this.expression === "-0") && number !== ".") {
      this.expression = this.expression === "-0" ? `-${number}` : number;
    } else {
      this.expression += number;
    }
  }

  chooseOperation(operation) {
    if (this.expression === "Error") return;

    if (this.justCalculated) {
      this.justCalculated = false;
      this.previousExpression = "";
    }

    if (/[+\-*/] $/.test(this.expression)) {
      this.expression = `${this.expression.slice(0, -2)}${operation} `;
      return;
    }

    this.expression += ` ${operation} `;
  }

  applyPercent() {
    if (this.expression === "Error" || /[+\-*/] $/.test(this.expression)) return;

    const currentNumber = this.expression.match(/-?\d*\.?\d+$/)?.[0];
    if (!currentNumber) return;

    const percentage = String(
      Number.parseFloat((Number.parseFloat(currentNumber) / 100).toFixed(10))
    );

    this.expression =
      this.expression.slice(0, -currentNumber.length) + percentage;
  }

  compute() {
    if (this.expression === "Error" || /[+\-*/] $/.test(this.expression)) return;

    const tokens = this.expression.split(" ");
    const values = tokens.map((token) =>
      /^[+\-*/]$/.test(token) ? token : Number.parseFloat(token)
    );

    if (values.some((value) => typeof value === "number" && Number.isNaN(value))) {
      this.showError();
      return;
    }

    for (let index = 1; index < values.length; index += 2) {
      if (values[index] !== "*" && values[index] !== "/") continue;

      if (values[index] === "/" && values[index + 1] === 0) {
        this.showError();
        return;
      }

      const result =
        values[index] === "*"
          ? values[index - 1] * values[index + 1]
          : values[index - 1] / values[index + 1];

      values.splice(index - 1, 3, result);
      index -= 2;
    }

    let result = values[0];
    for (let index = 1; index < values.length; index += 2) {
      result =
        values[index] === "+"
          ? result + values[index + 1]
          : result - values[index + 1];
    }

    this.previousExpression = `${this.expression} =`;
    this.expression = String(Number.parseFloat(result.toFixed(10)));
    this.justCalculated = true;
  }

  showError() {
    this.previousExpression = `${this.expression} =`;
    this.expression = "Error";
    this.justCalculated = true;
  }

  updateDisplay() {
    this.currentOperandElement.textContent = this.expression;
    this.previousOperandElement.textContent = this.previousExpression;
    this.fitTextToDisplay(this.currentOperandElement, 3.5, 1.5);
    this.fitTextToDisplay(this.previousOperandElement, 1, 0.8);
    this.currentOperandElement.scrollLeft = this.currentOperandElement.scrollWidth;
    this.previousOperandElement.scrollLeft =
      this.previousOperandElement.scrollWidth;
  }

  fitTextToDisplay(element, maximumSize, minimumSize) {
    let fontSize = maximumSize;
    element.style.whiteSpace = "nowrap";
    element.style.fontSize = `${fontSize}rem`;

    while (element.scrollWidth > element.clientWidth && fontSize > minimumSize) {
      fontSize -= 0.1;
      element.style.fontSize = `${Math.max(fontSize, minimumSize)}rem`;
    }

  }

}

const previousOperandElement = document.querySelector("[data-previous-operand]");
const currentOperandElement = document.querySelector("[data-current-operand]");
const calculator = new Calculator(previousOperandElement, currentOperandElement);

document.querySelectorAll("[data-number]").forEach((button) => {
  button.addEventListener("click", () => {
    calculator.appendNumber(button.dataset.number);
    calculator.updateDisplay();
  });
});

document.querySelectorAll("[data-operation]").forEach((button) => {
  button.addEventListener("click", () => {
    calculator.chooseOperation(button.dataset.operation);
    calculator.updateDisplay();
  });
});

document.querySelector("[data-equals]").addEventListener("click", () => {
  calculator.compute();
  calculator.updateDisplay();
});

document.querySelector("[data-percent]").addEventListener("click", () => {
  calculator.applyPercent();
  calculator.updateDisplay();
});

document.querySelector("[data-clear]").addEventListener("click", () => {
  calculator.clear();
  calculator.updateDisplay();
});

document.querySelector("[data-delete]").addEventListener("click", () => {
  calculator.delete();
  calculator.updateDisplay();
});

[previousOperandElement, currentOperandElement].forEach((element) => {
  element.addEventListener(
    "wheel",
    (event) => {
      if (element.scrollWidth <= element.clientWidth) return;

      event.preventDefault();
      element.scrollLeft += event.deltaY || event.deltaX;
    },
    { passive: false }
  );
});

document.addEventListener("keydown", (event) => {
  const keyMap = { Enter: "=", Escape: "AC", Backspace: "⌫" };
  const key = keyMap[event.key] ?? event.key;
  const button = [...document.querySelectorAll("button")].find(
    (element) =>
      element.dataset.number === key ||
      element.dataset.operation === key ||
      element.textContent.trim() === key
  );

  if (button) {
    event.preventDefault();
    button.click();
  }
});

calculator.updateDisplay();
window.addEventListener("resize", () => calculator.updateDisplay());

