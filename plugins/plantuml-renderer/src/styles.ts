export const plantUmlStyles = `
.plantuml-diagram {
  margin: 1.5rem 0;
}

.plantuml-canvas {
  display: flex;
  justify-content: center;
  overflow-x: auto;
}

.plantuml-canvas svg {
  display: block;
  height: auto;
  max-width: 100%;
}

.plantuml-source {
  white-space: pre-wrap;
}

.plantuml-error {
  display: block;
  color: var(--tertiary);
  font-family: var(--codeFont);
  text-align: left;
}
`
