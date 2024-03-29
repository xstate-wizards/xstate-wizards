import React from "react";
import styled from "styled-components";
import { wizardTheme } from "../../theme";

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  margin: 1em 0;
  box-shadow: none;
  border: 1px solid ${(props) => wizardTheme.colors.white[500]};
  border-bottom: 3px solid ${(props) => wizardTheme.colors.white[500]};
  background: ${(props) => wizardTheme.colors.white[900]};
  padding: 1em 2em;
`;
