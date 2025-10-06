import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface RichTextEditorProps {
  readOnly?: boolean;
  defaultValue?: any;
  onTextChange?: (...args: any[]) => void;
  onSelectionChange?: (...args: any[]) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = forwardRef<Quill | null, RichTextEditorProps>(
  (
    { readOnly = false, defaultValue = null, onTextChange, onSelectionChange, placeholder, className },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);
    
    const toolbarOptions = [
      ["bold", "italic", "underline", "strike"], // toggled buttons
      ["blockquote", "code-block"],
      ["link", "image", "video"],

      [{ header: 1 }, { header: 2 }], // custom button values
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ script: "sub" }, { script: "super" }], // superscript/subscript
      [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
      [{ direction: "rtl" }], // text direction

      [{ size: ["small", false, "large", "huge"] }], // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],

      ["clean"], // remove formatting button
    ];

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      if (ref && typeof ref !== "function") {
        ref.current?.enable(!readOnly);
      }
    }, [ref, readOnly]);

    // Cập nhật nội dung khi defaultValue thay đổi
    useEffect(() => {
      if (ref && typeof ref !== "function" && ref.current && defaultValue !== defaultValueRef.current) {
        defaultValueRef.current = defaultValue;
        if (defaultValue) {
          if (typeof defaultValue === 'string') {
            ref.current.root.innerHTML = defaultValue;
          } else {
            ref.current.setContents(defaultValue);
          }
        } else {
          ref.current.setText('');
        }
      }
    }, [ref, defaultValue]);

    useEffect(() => {
      if (!containerRef.current) return;

      const container = containerRef.current;

      // Thêm CSS tùy chỉnh cho Quill editor
      const style = document.createElement('style');
      style.textContent = `
        .ql-editor {
          min-height: 200px;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .ql-editor img {
          display: block;
          margin: 10px auto;
          max-width: 100%;
          height: auto;
        }
        
        .ql-editor p {
          margin-bottom: 8px;
        }
        
        .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4, .ql-editor h5, .ql-editor h6 {
          margin-top: 16px;
          margin-bottom: 8px;
        }
        
        .ql-editor ul, .ql-editor ol {
          padding-left: 20px;
        }
        
        .ql-editor blockquote {
          border-left: 4px solid #ccc;
          margin: 16px 0;
          padding-left: 16px;
          font-style: italic;
        }
        
        .ql-toolbar {
          border-top: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-bottom: none;
          border-radius: 6px 6px 0 0;
          background-color: #f9fafb;
        }
        
        .ql-container {
          border: 1px solid #d1d5db;
          border-top: none;
          border-radius: 0 0 6px 6px;
          background-color: white;
        }
        
        .ql-editor:focus {
          outline: none;
        }
        
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `;
      document.head.appendChild(style);

      // Tạo div toolbar
      const toolbarContainer = document.createElement("div");
      toolbarContainer.id = "toolbar";
      container.appendChild(toolbarContainer);

      // Tạo div chứa editor
      const editorContainer = document.createElement("div");
      container.appendChild(editorContainer);

      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
        },
        readOnly,
        placeholder: placeholder || "Nhập mô tả sản phẩm...",
      });

      // Gán instance vào ref
      if (ref) {
        if (typeof ref === "function") {
          ref(quill);
        } else {
          ref.current = quill;
        }
      }

      if (defaultValueRef.current) {
        // Kiểm tra nếu defaultValue là HTML string
        if (typeof defaultValueRef.current === 'string') {
          quill.root.innerHTML = defaultValueRef.current;
        } else {
          // Nếu là Delta format
          quill.setContents(defaultValueRef.current);
        }
      }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      return () => {
        if (ref) {
          if (typeof ref === "function") {
            ref(null);
          } else {
            ref.current = null;
          }
        }
        container.innerHTML = "";
        // Xóa style khi component unmount
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }, [ref, placeholder]);

    return <div ref={containerRef} className={className} />;
  }
);

RichTextEditor.displayName = "RichTextEditor";
export default RichTextEditor;
