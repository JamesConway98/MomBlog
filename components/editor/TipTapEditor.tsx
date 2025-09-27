"use client"
import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

type Props = {
  contentHtml: string
  onUpdate?: (html: string) => void
}

export function TipTapEditor({ contentHtml, onUpdate }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: contentHtml || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[320px]'
      }
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && contentHtml !== editor.getHTML()) {
      editor.commands.setContent(contentHtml || '<p></p>', false)
    }
  }, [contentHtml, editor])

  if (!editor) return null

  return (
    <div className="border rounded-xl">
      <div className="flex flex-wrap gap-1 border-b p-2 text-sm">
        <button type="button" className="btn btn-outline px-3 py-1.5 rounded-lg" onClick={() => editor.chain().focus().toggleBold().run()} aria-pressed={editor.isActive('bold')}>Bold</button>
        <button type="button" className="btn btn-outline px-3 py-1.5 rounded-lg" onClick={() => editor.chain().focus().toggleItalic().run()} aria-pressed={editor.isActive('italic')}>Italic</button>
        <button type="button" className="btn btn-outline px-3 py-1.5 rounded-lg" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-pressed={editor.isActive('heading', { level: 2 })}>H2</button>
        <button type="button" className="btn btn-outline px-3 py-1.5 rounded-lg" onClick={() => editor.chain().focus().toggleBulletList().run()} aria-pressed={editor.isActive('bulletList')}>Bullets</button>
        <button type="button" className="btn btn-outline px-3 py-1.5 rounded-lg" onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-pressed={editor.isActive('orderedList')}>Numbered</button>
        <button type="button" className="btn btn-outline px-3 py-1.5 rounded-lg" onClick={() => editor.chain().focus().toggleBlockquote().run()} aria-pressed={editor.isActive('blockquote')}>Quote</button>
        <button type="button" className="btn btn-outline px-3 py-1.5 rounded-lg" onClick={() => editor.chain().focus().toggleCodeBlock().run()} aria-pressed={editor.isActive('codeBlock')}>Code</button>
        <div className="ml-auto flex gap-1">
          <button type="button" className="btn btn-outline px-3 py-1.5 rounded-lg" onClick={() => editor.chain().focus().undo().run()}>Undo</button>
          <button type="button" className="btn btn-outline px-3 py-1.5 rounded-lg" onClick={() => editor.chain().focus().redo().run()}>Redo</button>
        </div>
      </div>
      <div className="p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
