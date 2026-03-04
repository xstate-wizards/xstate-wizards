import { resolveText } from "../resolveText";

describe("resolveText", () => {
  // --- Plain string passthrough ---
  it("returns a plain string as-is", () => {
    expect(resolveText("hello")).toBe("hello");
  });

  it("returns empty string for null", () => {
    expect(resolveText(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(resolveText(undefined)).toBe("");
  });

  // --- Locale selection ---
  it("picks the correct locale from a locale object", () => {
    expect(resolveText({ en: "Hello", es: "Hola" }, "en")).toBe("Hello");
    expect(resolveText({ en: "Hello", es: "Hola" }, "es")).toBe("Hola");
  });

  it("falls back to first value when locale is missing", () => {
    expect(resolveText({ en: "Hello", es: "Hola" }, "fr")).toBe("Hello");
  });

  it("falls back to first value when no locale provided", () => {
    expect(resolveText({ en: "Hello", es: "Hola" })).toBe("Hello");
  });

  it("returns empty string for empty locale object", () => {
    expect(resolveText({})).toBe("");
  });

  // --- Interpolation ---
  it("interpolates {path} tokens from context", () => {
    expect(resolveText("Hi {name}", undefined, { name: "Bob" })).toBe("Hi Bob");
  });

  it("interpolates deep paths from context", () => {
    const context = { resources: { User: [{ name: "Alice" }] } };
    expect(resolveText("Hi {resources.User.0.name}", undefined, context)).toBe("Hi Alice");
  });

  it("preserves unresolvable tokens", () => {
    expect(resolveText("Hi {missing}", undefined, {})).toBe("Hi {missing}");
  });

  it("does not interpolate without context", () => {
    expect(resolveText("Hi {name}")).toBe("Hi {name}");
  });

  it("interpolates locale objects with context", () => {
    const context = { name: "Carlos" };
    expect(resolveText({ en: "Hi {name}", es: "Hola {name}" }, "es", context)).toBe("Hola Carlos");
  });

  it("handles multiple tokens in one string", () => {
    const context = { first: "Jane", last: "Doe" };
    expect(resolveText("{first} {last}", undefined, context)).toBe("Jane Doe");
  });

  it("stringifies non-string context values", () => {
    expect(resolveText("Count: {n}", undefined, { n: 42 })).toBe("Count: 42");
  });

  it("preserves token when context value is null", () => {
    expect(resolveText("Hi {name}", undefined, { name: null })).toBe("Hi {name}");
  });
});
