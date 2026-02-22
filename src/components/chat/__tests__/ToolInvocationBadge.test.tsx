import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// --- getToolLabel: str_replace_editor ---

test("getToolLabel returns 'Creating /App.jsx' for str_replace_editor create", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" }))
    .toBe("Creating /App.jsx");
});

test("getToolLabel returns 'Editing /App.jsx' for str_replace_editor str_replace", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/App.jsx" }))
    .toBe("Editing /App.jsx");
});

test("getToolLabel returns 'Editing /App.jsx' for str_replace_editor insert", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/App.jsx" }))
    .toBe("Editing /App.jsx");
});

test("getToolLabel returns 'Reading /App.jsx' for str_replace_editor view", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" }))
    .toBe("Reading /App.jsx");
});

test("getToolLabel returns 'Undoing edit to /App.jsx' for str_replace_editor undo_edit", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }))
    .toBe("Undoing edit to /App.jsx");
});

// --- getToolLabel: file_manager ---

test("getToolLabel returns 'Renaming /old.tsx' for file_manager rename", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.tsx" }))
    .toBe("Renaming /old.tsx");
});

test("getToolLabel returns 'Deleting /old.tsx' for file_manager delete", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/old.tsx" }))
    .toBe("Deleting /old.tsx");
});

// --- getToolLabel: fallbacks ---

test("getToolLabel returns toolName for unknown tool", () => {
  expect(getToolLabel("some_other_tool", { command: "do_thing", path: "/file" }))
    .toBe("some_other_tool");
});

test("getToolLabel returns toolName for known tool with unknown command", () => {
  expect(getToolLabel("str_replace_editor", { command: "unknown_cmd", path: "/file" }))
    .toBe("str_replace_editor");
});

test("getToolLabel returns toolName when args are empty", () => {
  expect(getToolLabel("str_replace_editor", {})).toBe("str_replace_editor");
});

// --- ToolInvocationBadge: call state ---

test("ToolInvocationBadge shows spinner and friendly label in call state", () => {
  const invocation: ToolInvocation = {
    toolCallId: "abc",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "call",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={invocation} />);
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

// --- ToolInvocationBadge: partial-call state ---

test("ToolInvocationBadge shows spinner in partial-call state", () => {
  const invocation: ToolInvocation = {
    toolCallId: "abc",
    toolName: "str_replace_editor",
    args: { command: "view", path: "/App.jsx" },
    state: "partial-call",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={invocation} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

// --- ToolInvocationBadge: result state ---

test("ToolInvocationBadge shows green dot and no spinner in result state", () => {
  const invocation: ToolInvocation = {
    toolCallId: "abc",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "result",
    result: "Success",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={invocation} />);
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

// --- ToolInvocationBadge: file_manager ---

test("ToolInvocationBadge shows friendly label for file_manager delete", () => {
  const invocation: ToolInvocation = {
    toolCallId: "xyz",
    toolName: "file_manager",
    args: { command: "delete", path: "/old.tsx" },
    state: "call",
  };
  render(<ToolInvocationBadge toolInvocation={invocation} />);
  expect(screen.getByText("Deleting /old.tsx")).toBeDefined();
});

// --- ToolInvocationBadge: unknown tool fallback ---

test("ToolInvocationBadge displays raw toolName for unknown tool", () => {
  const invocation: ToolInvocation = {
    toolCallId: "xyz",
    toolName: "unknown_tool",
    args: {},
    state: "call",
  };
  render(<ToolInvocationBadge toolInvocation={invocation} />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

// --- ToolInvocationBadge: styling ---

test("ToolInvocationBadge label span uses font-sans class", () => {
  const invocation: ToolInvocation = {
    toolCallId: "abc",
    toolName: "file_manager",
    args: { command: "delete", path: "/old.tsx" },
    state: "call",
  };
  render(<ToolInvocationBadge toolInvocation={invocation} />);
  const span = screen.getByText("Deleting /old.tsx");
  expect(span.className).toContain("font-sans");
});

test("ToolInvocationBadge container has correct pill classes", () => {
  const invocation: ToolInvocation = {
    toolCallId: "abc",
    toolName: "str_replace_editor",
    args: { command: "view", path: "/App.jsx" },
    state: "call",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={invocation} />);
  const pill = container.firstChild as HTMLElement;
  expect(pill.className).toContain("inline-flex");
  expect(pill.className).toContain("rounded-lg");
  expect(pill.className).toContain("bg-neutral-50");
  expect(pill.className).toContain("border-neutral-200");
});
