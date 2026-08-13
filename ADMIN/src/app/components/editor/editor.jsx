import React, { useRef, useEffect } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './style.css'
import { alpha } from '@mui/material/styles'

const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
]

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
    ['link', 'image'],
    ['clean'],
  ],
}

export default function Editor({ id, error, value, onChange, helperText }) {
  return (
    <div className={error ? 'custom-quill error-border' : 'custom-quill'}>
      <ReactQuill
        id={id}
        formats={formats}
        value={value}
        onChange={(content, delta, source, editor) => {
          onChange(editor.getHTML()) // Ensure the string value is passed
        }}
        placeholder="Write something awesome..."
        modules={modules}
        theme="snow" // Setting the theme to "snow"
      />
      {helperText && helperText}
    </div>
  )
}
