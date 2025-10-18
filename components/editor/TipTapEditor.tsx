"use client"
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

type Props = {
  contentHtml: string
  onUpdate?: (html: string) => void
}

export function TipTapEditor({ contentHtml, onUpdate }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        HTMLAttributes: { class: 'rounded-xl max-w-full h-auto mx-auto' },
      }),
    ],
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

  const toolbarButtonClass =
    'btn btn-outline px-2 py-0.5 rounded-lg text-[0.7rem] tracking-[0.08em] disabled:opacity-40 disabled:cursor-not-allowed data-[active=true]:bg-black data-[active=true]:text-white data-[active=true]:border-black data-[active=true]:shadow-sm'

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editor) {
      event.target.value = ''
      return
    }

    const alt = window.prompt('Describe this image (alt text):', '')?.trim()
    if (!alt) {
      window.alert('Upload canceled: alt text is required.')
      event.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('altText', alt)

    setUploading(true)
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to upload image')
      }

      const imageUrl = data?.url || data?.signedUrl
      if (!imageUrl) {
        throw new Error('Upload succeeded but no URL was returned')
      }

      editor.chain().focus().setImage({ src: imageUrl, alt }).run()
    } catch (error: any) {
      window.alert(error?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="border rounded-xl">
      <div className="flex flex-wrap gap-1 border-b p-2 text-sm">
        <button
          type="button"
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          aria-pressed={editor.isActive('bold')}
          data-active={editor.isActive('bold')}
        >
          Bold
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          aria-pressed={editor.isActive('italic')}
          data-active={editor.isActive('italic')}
        >
          Italic
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
          aria-pressed={editor.isActive('heading', { level: 2 })}
          data-active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          aria-pressed={editor.isActive('bulletList')}
          data-active={editor.isActive('bulletList')}
        >
          Bullets
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          aria-pressed={editor.isActive('orderedList')}
          data-active={editor.isActive('orderedList')}
        >
          Numbered
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={!editor.can().chain().focus().toggleBlockquote().run()}
          aria-pressed={editor.isActive('blockquote')}
          data-active={editor.isActive('blockquote')}
        >
          Quote
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
          aria-pressed={editor.isActive('codeBlock')}
          data-active={editor.isActive('codeBlock')}
        >
          Code
        </button>
        <button
          type="button"
          className={`${toolbarButtonClass} whitespace-nowrap`}
          onClick={openFilePicker}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : 'Add Image'}
        </button>
        <div className="ml-auto flex gap-1">
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
          >
            Undo
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
          >
            Redo
          </button>
        </div>
      </div>
      <div className="p-3">
        <EditorContent editor={editor} />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
