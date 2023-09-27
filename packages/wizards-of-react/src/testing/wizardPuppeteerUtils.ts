// TODO: i want to import @types/puppeteer, but its depreacted
type PuppeteerPage = any;
type PuppeteerElementHandle = any;

export class WizardPuppeteerUtils {
  _page: PuppeteerPage;
  constructor(page: PuppeteerPage) {
    this._page = page;
  }
  async _scrollIntoView(selectorOrElm: PuppeteerElementHandle) {
    if (typeof selectorOrElm === "string") {
      await this._page.$eval(selectorOrElm, (e) =>
        e.scrollIntoView({
          behavior: "auto",
          block: "center",
          inline: "center",
        })
      );
    } else {
      await selectorOrElm.evaluate((e) =>
        e.scrollIntoView({
          behavior: "auto",
          block: "center",
          inline: "center",
        })
      );
    }
  }
  async tapYesButton() {
    await this.tapButton("Yes");
  }
  async tapNoButton() {
    await this.tapButton("No");
  }
  async tapContinueButton() {
    await this.tapButton("Continue");
  }
  async tapButton(text) {
    const elms = await this._page.$$("button");
    let performedTap = false;
    for (const elm of elms) {
      if (((await elm.evaluate((e) => e.innerText)) || "").toLowerCase().startsWith(text.toLowerCase())) {
        await this._scrollIntoView(elm);
        await elm.tap();
        await new Promise((r) => setTimeout(r, 150)); // delay after action
        performedTap = true;
      }
    }
    if (!performedTap) {
      throw new Error(".tapButton() found nothing to tap!");
    }
  }
  async tapInput(label, option?: string) {
    const elms = await this._page.$$(".content-node__input *[data-wiz-label]");
    let performedTap = false;
    for (const elm of elms) {
      const testLabel = (await elm.evaluate((n) => n.getAttribute("data-wiz-label"))) || "";
      const testOption = (await elm.evaluate((n) => n.getAttribute("data-wiz-option-value"))) || "";
      if (
        // tap if no label filter given
        !label ||
        // tap if regex match
        (label instanceof RegExp && testLabel.match(label)) ||
        // tap if contains label
        testLabel.startsWith(label)
      ) {
        if (option && testOption.indexOf(option) === -1) {
          // skip, if option was provided and does not match
          continue;
        }
        await elm.tap();
        await new Promise((r) => setTimeout(r, 150)); // delay after action
        performedTap = true;
      }
    }
    if (!performedTap) {
      // console.log("label, option", label, option);
      throw new Error(".tapInput() found nothing to tap!");
    }
  }
  async tapSelectInput(label, value) {
    const elms = await this._page.$$(".content-node__input select[data-wiz-label]");
    let performedTap = false;
    for (const elm of elms) {
      const testLabel = (await elm.evaluate((n) => n.getAttribute("data-wiz-label"))) || "";
      if (
        // tap if no label filter given
        !label ||
        // tap if regex match
        (label instanceof RegExp && testLabel.match(label)) ||
        // tap if contains label
        testLabel.indexOf(label) !== -1
      ) {
        await elm.select(value);
        await new Promise((r) => setTimeout(r, 150)); // delay after action
        performedTap = true;
      }
    }
    if (!performedTap) {
      // console.log("label, value", label, value);
      throw new Error(".tapSelectInput() found nothing to tap!");
    }
  }
  async tapSelectDateInput(label, date) {
    const elms = await this._page.$$(`.content-node__input.date [data-wiz-label="${label}"] select`);
    if (elms.length !== 3) {
      throw new Error("Expected 3 <select /> for .tapSelectDateInput()");
    }
    await elms[0].select(String(date.getMonth() + 1));
    await new Promise((r) => setTimeout(r, 150)); // delay after action
    await elms[1].select(String(date.getDate()));
    await new Promise((r) => setTimeout(r, 150)); // delay after action
    await elms[2].select(String(date.getFullYear()));
    await new Promise((r) => setTimeout(r, 150)); // delay after action
  }
  async typeInput(label, text) {
    const elms = await this._page.$$(".content-node__input *[data-wiz-label]");
    let performedType = false;
    for (const elm of elms) {
      const testLabel = (await elm.evaluate((n) => n.getAttribute("data-wiz-label"))) || "";
      if (
        // tap if no label filter given
        !label ||
        // tap if regex match
        (label instanceof RegExp && testLabel.match(label)) ||
        // tap if contains label
        testLabel.indexOf(label) !== -1
      ) {
        await elm.evaluate((el) => (el.value = "")); // clear input
        await elm.type(text);
        await new Promise((r) => setTimeout(r, 150)); // delay after action
        performedType = true;
      }
    }
    if (!performedType) {
      // console.log("label, text", label, text);
      throw new Error(".typeInput() found nothing to type into!");
    }
  }
  async typePhoneInput(label, countryCode: string, phoneNumber: string) {
    const elCountryCode = await this._page.$(`.content-node__input.tel div[data-wiz-label="${label}"] select`);
    const elPhoneNum = await this._page.$(`.content-node__input.tel div[data-wiz-label="${label}"] input`);
    if (elCountryCode == null) throw new Error("Expected <select /> element.");
    if (elPhoneNum == null) throw new Error("Expected <input /> element.");
    await elCountryCode.select(countryCode?.includes("+") ? countryCode : `+${countryCode}`);
    await new Promise((r) => setTimeout(r, 150)); // delay after action
    await elPhoneNum.type(phoneNumber);
    await new Promise((r) => setTimeout(r, 150)); // delay after action
  }
  async waitForTimeout(...args) {
    await new Promise((r) => setTimeout(r, ...args));
  }
}
