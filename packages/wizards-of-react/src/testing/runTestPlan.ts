import { TPrepparedSpellMapping, TSpellMap } from "@xstate-wizards/spells";
import { WizardPuppeteerUtils } from "./wizardPuppeteerUtils";

// TODO: i want to import @types/puppeteer, but its depreacted
type PuppeteerPage = any;

export const runTestPlan = async (
  page: PuppeteerPage,
  machine: TPrepparedSpellMapping,
  spellMap: TSpellMap,
  finalMachineId: string,
  finalMachineState: string
) => {
  // SETUP
  // --- prepare the e2e testing utils
  const utils = new WizardPuppeteerUtils(page);
  // --- machine props
  const entryMachineId = await page.$eval("form[data-wiz-machine-state]", (n) => n.getAttribute("data-wiz-machine-id"));
  const TEST_PLAN = Object.entries(
    machine.createMachine({}, { serializations: { functions: {} }, spellMap }).config.states // TODO: probably should remove the need for this serializations record?
  ).reduce((plan, [state, node]) => {
    // @ts-ignore
    plan[state] = node?.meta?.test;
    return plan;
  }, {});

  // CHECK START
  // --- assert that we're at the intro state for this machine
  const currentMachineId = entryMachineId;
  const initialState = await page.$eval("form[data-wiz-machine-state]", (n) =>
    n.getAttribute("data-wiz-entry-machine-state")
  );
  let statePriorToAction = await page.$eval("form[data-wiz-machine-state]", (n) =>
    n.getAttribute("data-wiz-machine-state")
  );
  if (statePriorToAction !== initialState) throw new Error("not starting from initial state");

  // RUN
  // run the defined test plan, until the entry machine id changes, is not found, or machine is done
  while (currentMachineId === entryMachineId) {
    // --- check for test plan on state
    if (typeof TEST_PLAN[statePriorToAction] !== "function") {
      throw new Error("no test plan function");
    }
    if (TEST_PLAN[statePriorToAction].toString() === "() => null") {
      throw new Error(`No test plan defined for "${statePriorToAction}"!`);
    }
    // --- run it and ensure no errors throw
    await TEST_PLAN[statePriorToAction](utils);
    await utils.waitForTimeout(0); // setTimeout to reset event loop
    // BREAK IF
    // --- ??? entry machine id changed (navigated away, i guess that's solved by while loop)
    // --- ??? no form element w/ machine id is found (but then test would fail?)
    // --- machine is done
    if (finalMachineId === currentMachineId && finalMachineState === statePriorToAction) {
      break;
    }
    // EXPECT TRANSITION
    const stateAfterTestRun = await page.$eval("form[data-wiz-machine-state]", (n) =>
      n.getAttribute("data-wiz-machine-state")
    );
    if (stateAfterTestRun === statePriorToAction) {
      throw new Error("state has not change after running state's test function");
    }
    statePriorToAction = stateAfterTestRun;
  }
};
