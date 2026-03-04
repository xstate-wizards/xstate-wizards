import { $TSFixMe, TSpellInstructions } from "@xstate-wizards/spells";
import { groupBy, findIndex, orderBy, set, sortBy } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useEditor } from "../stores/EditorStore";
import { useSidebar } from "../stores/SidebarStore";
import { searchParamGet, searchParamSet, SPELLBOOK_SEARCH_PARAMS } from "../utils";

type TSpellDirectoryMap = {
  [spellKey: string]: string[] | null;
};
type TSpellVersionMap = {
  [spellKey: string]: $TSFixMe[];
};

const VersionHistory = ({ spellKey, spellVersionMap }) => {
  const editor = useEditor();

  const getMajorVersion = (value) => parseInt(value.version.split(".")?.[0]);
  const getMinorVersion = (value) => parseInt(value.version.split(".")?.[1]);
  const orderedVersions = orderBy(spellVersionMap[spellKey], [getMajorVersion, getMinorVersion], ["desc", "desc"]);
  const [numVersionsVisible, setNumVersionsVisible] = useState(
    Math.max(5, findIndex(orderedVersions, (v) => v.isActive === true) + 1)
  );
  // RENDER
  return (
    <ul className="spell-directory__versions-list">
      {orderedVersions.slice(0, numVersionsVisible).map((spell) => (
        <li
          key={spell.version}
          className={editor.focusedSpellId === spell.id ? "selected" : ""}
          onClick={() => {
            editor.setFocusedSpellId(spell.id);
            editor.setFocusedSpellVersion(spell.version);
          }}
        >
          {spell.version} {spell.isActive ? "(Active)" : ""}
        </li>
      ))}
      {numVersionsVisible < spellVersionMap[spellKey].length && (
        <li onClick={() => setNumVersionsVisible(numVersionsVisible + 10)}>
          <small>
            <u>v Show More Versions</u>
          </small>
        </li>
      )}
    </ul>
  );
};

const SpellDirectory = ({ selectSpellKey, directory, directoryTree, spellDirectoryMap, spellVersionMap }) => {
  const editor = useEditor();
  const [isExpanded, setIsExpanded] = useState(!directory); // more inteligent auto expanding/collapsing
  // RENDER
  return (
    <div className={`xw-sb__directory${directory ? " xw-sb__directory--has-dir" : ""}`}>
      {/* This directory's header */}
      {directory && (
        <h4>
          <span onClick={() => setIsExpanded(!isExpanded)}>
            [{isExpanded ? "-" : "+"}] {directory ?? ""}
          </span>
        </h4>
      )}
      {isExpanded && (
        <>
          {/* Sub-directories */}
          {Object.entries(directoryTree)
            .filter(([key, value]) => value && typeof value === "object" && key !== "")
            .sort()
            .map(([key, value]) => (
              <SpellDirectory
                key={key}
                selectSpellKey={selectSpellKey}
                directory={key}
                directoryTree={value}
                spellDirectoryMap={spellDirectoryMap}
                spellVersionMap={spellVersionMap}
              />
            ))}
          {/* Spells for this Directory */}
          <ul
            className={`xw-sb__spell-directory__spells-list ${
              Object.keys(directoryTree[""] ?? {})?.length > 0 ? "top-level" : ""
            }`}
          >
            {Object.keys({ ...(directoryTree ?? {}), ...(directoryTree[""] ?? {}) })
              .filter((key) => !directoryTree[key])
              .sort()
              .map((spellKey) => (
                <li key={spellKey} className={editor.focusedSpellKey === spellKey ? "selected" : ""}>
                  <span onClick={() => selectSpellKey(spellKey)}>{spellKey}</span>
                  {editor.focusedSpellKey === spellKey && (
                    <VersionHistory spellKey={spellKey} spellVersionMap={spellVersionMap} />
                  )}
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
};


type TSpellsSidebarProps = {
  onSpellCreate: Function;
  spells: {
    [id: number]: TSpellInstructions;
  };
};

export const SpellsSidebar: React.FC<TSpellsSidebarProps> = ({ onSpellCreate, spells }) => {
  // SETUP
  const editor = useEditor();
  const sidebar = useSidebar();
  const spellVersionMap: TSpellVersionMap = useMemo(() => groupBy(Object.values(spells ?? {}), "key"), [spells]);
  const spellDirectoryMap: TSpellDirectoryMap = useMemo<$TSFixMe>(
    () =>
      orderBy(Object.values(spells ?? {}), ["id"], ["desc"]).reduce((dir: $TSFixMe, spell: $TSFixMe) => {
        if (!dir[spell.key]) return { ...dir, [spell.key]: spell.editor?.directory };
        return dir;
      }, {}),
    [spells]
  );
  const directoryTree = useMemo(
    () =>
      Object.entries(spellDirectoryMap).reduce((directoryTree, [key, directory]) => {
        if (directory && directory?.length > 0) {
          // IF dirs
          set(directoryTree, `${directory.join(".")}.${key}`, "");
        } else if (!directory) {
          // IF empty dir
          directoryTree[key] = "";
        }
        return directoryTree;
      }, {}),
    [spellDirectoryMap]
  );
  // --- spell CREATE
  const createSpell = () => {
    const inputNewSpellKey = prompt("Name Spell");
    const inputNewSpellDirectory = prompt("What directory? Separate levels via commas");
    if (inputNewSpellKey)
      onSpellCreate({ key: inputNewSpellKey, editor: { directory: (inputNewSpellDirectory || "").split(",") ?? [] } });
  };
  // --- spell SELECT
  // 1) Set spell 2) update params 3) auto-focus to latest spell
  const selectSpellKey = (spellKey: string) => {
    console.log("selectSpellKey", spellKey);
    const autoFocusedSpell = orderBy(
      Object.values(spells ?? {}).filter((s) => s.key === spellKey),
      ["createdAt"],
      ["desc"]
    )?.[0];
    if (autoFocusedSpell) {
      editor.setFocusedSpellId(autoFocusedSpell.id);
    }
    editor.setFocusedSpellKey(spellKey);
    editor.setFocusedSpellVersion(undefined);
    searchParamSet(SPELLBOOK_SEARCH_PARAMS.SPELL_KEY, spellKey);
  };
  // MOUNT -- set spell if on query param
  useEffect(() => {
    const spellKey = searchParamGet(SPELLBOOK_SEARCH_PARAMS.SPELL_KEY);
    if (spellKey) selectSpellKey(spellKey);
  }, []);

  // RENDER
  return (
    <div className={`xw-sb__sidebar${sidebar.isCollapsed && editor.focusedSpellKey != null ? " xw-sb__sidebar--collapsed" : ""}`}>
      <aside className="xw-sb__spells-list">
        <div className="xw-sb__spells-list__header" onClick={() => sidebar.setIsCollapsed(true)}>
          <h4>✨🔮✨</h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              createSpell();
            }}
          >
            +
          </button>
        </div>
        <div className="xw-sb__spells-list__directory">
          <SpellDirectory
            selectSpellKey={selectSpellKey}
            directory={null}
            directoryTree={directoryTree}
            spellDirectoryMap={spellDirectoryMap}
            spellVersionMap={spellVersionMap}
          />
        </div>
      </aside>
    </div>
  );
};

