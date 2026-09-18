"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote } from "lucide-react";
import { useTranslate } from "@refinedev/core";

import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function RichTextEditor({
  value,
  onChange,
  disabled,
  placeholder,
}: RichTextEditorProps) {
  const translate = useTranslate();
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? translate("events.fields.descriptionPlaceholder"),
      }),
    ],
    content: value || "<p></p>",
    editable: !disabled,
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[14rem] max-h-[28rem] overflow-y-auto px-3 py-2 text-sm leading-relaxed outline-none [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:font-serif [&_h3]:text-base [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-secondary [&_blockquote]:pl-3 [&_blockquote]:italic [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline",
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) {
    return (
      <div className="min-h-40 rounded-md border border-input bg-transparent" />
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-input bg-transparent shadow-xs",
        disabled && "opacity-60"
      )}
    >
      <div className="flex flex-wrap gap-1 border-b border-input bg-muted/40 p-1">
        <ToolbarButton
          pressed={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label={translate("events.editor.heading2")}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label={translate("events.editor.heading3")}
        >
          <Heading3 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label={translate("events.editor.bold")}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label={translate("events.editor.italic")}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label={translate("events.editor.quote")}
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label={translate("events.editor.bullets")}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label={translate("events.editor.numbers")}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive("link")}
          onClick={() => {
            const href = window.prompt(translate("events.editor.linkPrompt"));
            if (href === null) {
              return;
            }
            if (!href.trim()) {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().setLink({ href: href.trim() }).run();
          }}
          label={translate("events.editor.link")}
        >
          <Link2 className="size-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  pressed,
  onClick,
  label,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant={pressed ? "secondary" : "ghost"}
      className="size-8"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
