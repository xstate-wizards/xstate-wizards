import styled from "styled-components";

export const InputRow = styled.div`
  display: inline-grid;
  grid-auto-flow: column;
  div.label {
    grid-row: 1;
    padding: 0 4px;
    font-size: 12px;
    font-weight: 500;
  }
  div.input {
    grid-row: 2;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  & > div > div,
  & > div > label {
    display: grid;
    grid-auto-flow: row;
    grid-template-rows: repeat(2, 1fr);
    align-items: end;
    height: 100%;
  }
  input,
  button {
    border-radius: 0;
  }
  button {
    width: 100%;
    height: 100%;
  }
  & > div:first-of-type input,
  & > div:first-of-type button {
    border-radius: 0.25em 0 0 0.25em;
  }
  & > div:last-of-type input,
  & > div:last-of-type button {
    border-radius: 0 0.25em 0.25em 0;
  }

  @media (max-width: 45em) {
    grid-auto-flow: row;
  }
`;
