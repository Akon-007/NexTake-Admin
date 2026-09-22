import { useEffect, useRef } from "react";
import { Bold, Italic, Link2, List, RemoveFormatting, Heading3 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TOOLS: Array<{
  command: string;
  argument?: string;
  label: string;
  icon: typeof Bold;
}> = [
  { command: "bold", label: "Bold", icon: Bold },
  { command: "italic", label: "Italic", icon: Italic },
  { command: "formatBlock", argument: "<h3>", label: "Subheading", icon: Heading3 },
  { command: "insertUnorderedList", label: "Bullet list", icon: List },
  { command: "removeFormat", label: "Clear formatting", icon: RemoveFormatting },
] as const;

/**
 * Minimal rich-text editor for the syndicated body field.
 * Stores sanitised-by-convention HTML produced by the browser's own editing
 * commands; the public blog renders it inside its existing article template.
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Paste the licensed excerpt or the full syndicated text…",
  disabled,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  /* Only push external changes into the editor when they differ, so the
     caret is not reset while the admin is typing. */
  useEffect(() => {
    const node = editorRef.current;
    if (!node) return;
    if (value !== node.innerHTML) {
      node.innerHTML = value;
    }
  }, [value]);

  const exec = (command: string, argument?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const addLink = () => {
    const url = window.prompt("Link URL (must start with https://)");
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) return;
    exec("createLink", url);
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border border-line bg-surface ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-line bg-card px-2 py-1.5">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.command + (tool.argument ?? "")}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              disabled={disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => exec(tool.command, tool.argument)}
              className="rounded-md p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-mint disabled:opacity-50"
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}

        <button
          type="button"
          title="Insert link"
          aria-label="Insert link"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={addLink}
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-mint disabled:opacity-50"
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>

        <span className="ml-auto pr-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
          HTML
        </span>
      </div>

      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Syndicated content body"
        data-placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        onBlur={(event) => onChange(event.currentTarget.innerHTML)}
        className="nt-prose min-h-[180px] max-h-[420px] overflow-y-auto px-4 py-3 text-[13px] focus:outline-none [&:empty]:before:text-muted-deep [&:empty]:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
