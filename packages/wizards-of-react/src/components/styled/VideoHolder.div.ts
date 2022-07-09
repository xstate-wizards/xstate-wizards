import styled from "styled-components";

type TVideoHolderProps = {
  height?: string;
  heightMobile?: string;
  width?: string;
};

export const VideoHolder = styled.div<TVideoHolderProps>`
  border-radu: 4px;
  overflow: hidden;
  span,
  iframe {
    max-height: ${(props) => props.height || "320px"};
    min-height: ${(props) => props.height || "320px"};
    width: 100%;
    padding: 0 2px;
    @media (max-width: 45em) {
      max-height: ${(props) => props.heightMobile || "220px"};
      min-height: ${(props) => props.heightMobile || "220px"};
    }
  }
`;
