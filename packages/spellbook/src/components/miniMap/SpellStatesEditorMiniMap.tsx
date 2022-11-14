import { DragControls, Reorder, useDragControls } from "framer-motion";
import React, { useState } from "react";
import styled from "styled-components";
import { SpellSectionsEditor } from "./SpellSectionsEditor";

interface Props {
  dragControls: DragControls;
}

export function ReorderIcon({ dragControls }: Props) {
  return (
    <svg viewBox="0 0 10 10" width="18" height="18" fill="#8E8E9B" onPointerDown={(event) => dragControls.start(event)}>
      <path d="M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z"></path>
    </svg>
  );
}

const Item = ({ value }) => {
  const controls = useDragControls();
  return (
    <Reorder.Item value={value} dragListener={false} dragControls={controls} as="div">
      <ReorderIcon dragControls={controls} />
      <a href={`#${value.stateName}`}>
        {value.state?.key ? "↔︎" : "◗"} {value.stateName}
      </a>
    </Reorder.Item>
  );
};

export const SpellStatesEditorMiniMap = ({ config, statesList, onConfigUpdate, onStatesUpdate }) => {
  const [isSectionsEditing, setIsSectionsEditing] = useState(false);
  const sectionsBar = config?.sectionsBar ?? [];

  // RENDER
  return (
    <>
      {isSectionsEditing && (
        <SpellSectionsEditor
          sectionsBar={sectionsBar}
          states={statesList}
          onClose={() => setIsSectionsEditing(false)}
          onUpdate={(sectionsBar) => onConfigUpdate({ ...config, sectionsBar })}
        />
      )}
      <StyledSpellStatesMiniMap>
        <small className="sections-bar__trigger" onClick={() => setIsSectionsEditing(true)}>
          [+] Sections
        </small>
        <Reorder.Group
          key="statesOrder"
          axis="y"
          values={statesList}
          onReorder={(newStatesOrder) => {
            console.log("onReorder", newStatesOrder);
            onStatesUpdate(newStatesOrder);
          }}
          as="ul"
        >
          {statesList.map((state) => (
            <li key={state.stateName}>
              {((sb) =>
                sb != null ? (
                  <small className="sections-bar__trigger" onClick={() => setIsSectionsEditing(true)}>
                    {sb.name}
                  </small>
                ) : null)(sectionsBar.find((sb) => sb.trigger === state.stateName))}

              <Item key={state.stateName} value={state} />
            </li>
          ))}
        </Reorder.Group>
      </StyledSpellStatesMiniMap>
    </>
  );
};

const StyledSpellStatesMiniMap = styled.div`
  position: sticky;
  top: 30px;
  padding: 1em 0 0 1em;
  user-select: none;
  max-height: calc(100vh - 105px);
  overflow-y: scroll;
  div {
    padding: 0 0.5em 0 0;
    margin: 0.25em 0;
    font-size: 11px;
    letter-spacing: -0.1px;
    font-weight: 900;
    p {
      margin: 0;
    }
    display: flex;
    align-items: center;
    svg {
      padding-right: 4px;
      cursor: grab;
    }
  }
  small.sections-bar__trigger {
    display: flex;
    font-size: 11px;
    height: 14px;
    color: #aaa;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  a {
    color: gray;
  }
`;
