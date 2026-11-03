// Registers jest-dom matchers and resets the DOM, stubbed globals and env between tests (Q1).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  // U1: recommendations tests stub NEXT_PUBLIC_API_BASE_URL; restore it so tests stay independent.
  vi.unstubAllEnvs();
});
